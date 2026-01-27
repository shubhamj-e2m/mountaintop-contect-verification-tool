import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Loader2, Trash2, Search } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useAuth } from '../../contexts/AuthContext';
import { getProjectMembers, addProjectMember, removeProjectMember, getUsersForAssignment } from '../../services/projectService';
import type { User } from '../../types/user';

const ProjectSettingsPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const projects = useProjectStore(state => state.projects);
    const updateProject = useProjectStore(state => state.updateProject);
    const { user } = useAuth();

    const canEditProject = user?.role === 'admin' || user?.role === 'seo_analyst';

    const project = projects.find(p => p.id === projectId);

    // Project Settings Form state
    const [editName, setEditName] = useState('');
    const [editWebsiteUrl, setEditWebsiteUrl] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editDriveUrl, setEditDriveUrl] = useState('');
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Member Management state
    const [projectMembers, setProjectMembers] = useState<Array<{ id: string; user_id: string; role: string; user: { id: string; name: string; email: string; role: string; avatar_url?: string | null } }>>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [newMemberUserId, setNewMemberUserId] = useState('');
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [memberError, setMemberError] = useState('');
    const [memberSuccess, setMemberSuccess] = useState('');
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'general' | 'team'>('general');

    // Initialize form with project data
    useEffect(() => {
        if (project) {
            setEditName(project.name);
            setEditWebsiteUrl(project.website_url);
            setEditDescription(project.description || '');
            setEditDriveUrl(project.google_drive_url || '');
        }
    }, [project]);

    // Fetch members and users on mount
    useEffect(() => {
        if (projectId) {
            fetchProjectMembers();
            fetchAllUsers();
        }
    }, [projectId]);

    const fetchProjectMembers = async () => {
        if (!projectId) return;
        setIsLoadingMembers(true);
        setMemberError('');
        try {
            const members = await getProjectMembers(projectId);
            setProjectMembers(members);
        } catch (err: any) {
            console.error('Error fetching project members:', err);
            setMemberError(err.message || 'Failed to load project members');
        } finally {
            setIsLoadingMembers(false);
        }
    };

    const fetchAllUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const users = await getUsersForAssignment();
            setAllUsers(users);
        } catch (err: any) {
            console.warn('Could not fetch users for assignment:', err);
            setAllUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !newMemberUserId) return;

        const selectedUser = allUsers.find(u => u.id === newMemberUserId);
        if (!selectedUser) {
            setMemberError('Selected user not found');
            return;
        }

        let projectRole: 'seo_analyst' | 'content_writer' | 'content_verifier';
        if (selectedUser.role === 'admin' || selectedUser.role === 'seo_analyst') {
            projectRole = 'seo_analyst';
        } else if (selectedUser.role === 'content_writer') {
            projectRole = 'content_writer';
        } else if (selectedUser.role === 'content_verifier') {
            projectRole = 'content_verifier';
        } else {
            projectRole = 'content_writer';
        }

        setIsAddingMember(true);
        setMemberError('');
        setMemberSuccess('');

        try {
            await addProjectMember(projectId, newMemberUserId, projectRole);
            setMemberSuccess('Member added successfully');
            setNewMemberUserId('');
            await Promise.all([
                fetchProjectMembers(),
                fetchAllUsers()
            ]);
            setTimeout(() => setMemberSuccess(''), 3000);
        } catch (err: any) {
            console.error('Error adding member:', err);
            const errorMessage = err?.message || err?.error?.message || 'Failed to add member';
            setMemberError(errorMessage);
            setTimeout(() => setMemberError(''), 5000);
        } finally {
            setIsAddingMember(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!projectId) return;
        if (!confirm('Are you sure you want to remove this member from the project?')) return;

        setMemberError('');
        setMemberSuccess('');

        try {
            await removeProjectMember(projectId, userId);
            setMemberSuccess('Member removed successfully');
            await fetchProjectMembers();
            setTimeout(() => setMemberSuccess(''), 3000);
        } catch (err: any) {
            setMemberError(err.message || 'Failed to remove member');
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-700';
            case 'seo_analyst':
                return 'bg-info-light text-info';
            case 'content_writer':
                return 'bg-warning-light text-warning';
            case 'content_verifier':
                return 'bg-success-light text-success';
            default:
                return 'bg-bg-tertiary text-text-secondary';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Administrator';
            case 'seo_analyst':
                return 'SEO Analyst';
            case 'content_writer':
                return 'Content Writer';
            case 'content_verifier':
                return 'Content Verifier';
            default:
                return role;
        }
    };

    const availableUsers = allUsers.filter(
        (u) => !projectMembers.some((m) => m.user_id === u.id)
    );

    // Filter available users based on search query
    const filteredAvailableUsers = useMemo(() => {
        if (!memberSearchQuery.trim()) {
            return availableUsers;
        }

        const query = memberSearchQuery.toLowerCase().trim();
        return availableUsers.filter(user => 
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            getRoleLabel(user.role).toLowerCase().includes(query)
        );
    }, [availableUsers, memberSearchQuery]);

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !editName.trim() || !editWebsiteUrl.trim()) return;

        setIsSavingSettings(true);
        try {
            await updateProject(projectId, {
                name: editName,
                website_url: editWebsiteUrl,
                description: editDescription,
                google_drive_url: editDriveUrl,
            });
            // Navigate back to project detail page after saving
            navigate(`/projects/${projectId}`);
        } catch (error) {
            console.error('Error updating project settings:', error);
        } finally {
            setIsSavingSettings(false);
        }
    };

    if (!project) {
        return (
            <div className="p-8">
                <p className="text-[var(--color-text-secondary)]">Project not found</p>
            </div>
        );
    }

    return (
        <div className="p-8 w-full">
            {/* Back Link */}
            <Link 
                to={`/projects/${projectId}`} 
                className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
            >
                <ArrowLeft size={16} />
                Back to Project
            </Link>

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                    <Settings size={24} />
                    Project Settings
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                    Manage project details and team members
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-[var(--color-border)]">
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-2 text-sm font-medium transition-smooth flex items-center gap-1 ${
                        activeTab === 'general'
                            ? 'text-[var(--color-text-primary)] border-b-2 border-[var(--color-accent)]'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                >
                    General
                </button>
                <button 
                    onClick={() => setActiveTab('team')}
                    className={`px-4 py-2 text-sm font-medium transition-smooth flex items-center gap-1 ${
                        activeTab === 'team'
                            ? 'text-[var(--color-text-primary)] border-b-2 border-[var(--color-accent)]'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                >
                    <Users size={16} />
                    Team Members
                </button>
            </div>

            {/* General Settings Form */}
            {activeTab === 'general' && (
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">General Settings</h2>
                <form onSubmit={handleUpdateSettings} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                            Website URL *
                        </label>
                        <input
                            type="url"
                            value={editWebsiteUrl}
                            onChange={(e) => setEditWebsiteUrl(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                            Description
                        </label>
                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                            Google Drive Folder URL
                        </label>
                        <input
                            type="url"
                            placeholder="https://drive.google.com/drive/folders/..."
                            value={editDriveUrl}
                            onChange={(e) => setEditDriveUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                        <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">
                            Provide the URL of the folder containing Brand Strategy ("report") and Digital Trailmap documents.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                        <button
                            type="button"
                            onClick={() => navigate(`/projects/${projectId}`)}
                            className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-md text-[var(--color-text-secondary)] hover:bg-gray-50 transition-smooth"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSavingSettings}
                            className="flex-1 px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSavingSettings && <Loader2 size={16} className="animate-spin" />}
                            {isSavingSettings ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
            )}

            {/* Team Members Section */}
            {activeTab === 'team' && (
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users size={18} />
                    Team Members
                </h2>

                {/* Success/Error Messages */}
                {memberSuccess && (
                    <div className="mb-3 p-2 bg-success-light text-success text-sm rounded-md">
                        {memberSuccess}
                    </div>
                )}
                {memberError && (
                    <div className="mb-3 p-2 bg-error-light text-error text-sm rounded-md">
                        {memberError}
                    </div>
                )}

                {/* Current Members */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Assigned Members
                    </label>
                    {isLoadingMembers ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-[var(--color-accent)]" />
                        </div>
                    ) : projectMembers.length === 0 ? (
                        <p className="text-sm text-[var(--color-text-secondary)] py-2">
                            No members assigned yet
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {projectMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-md border border-[var(--color-border)]"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={
                                                member.user?.avatar_url ||
                                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user?.email || 'default'}`
                                            }
                                            alt={member.user?.name || 'User'}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                                {member.user?.name || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-[var(--color-text-secondary)]">
                                                {member.user?.email || ''}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 text-xs rounded-full font-medium ${getRoleBadgeColor(
                                                member.user?.role || member.role
                                            )}`}
                                        >
                                            {getRoleLabel(member.user?.role || member.role)}
                                        </span>
                                    </div>
                                    {canEditProject && (
                                        <button
                                            onClick={() => handleRemoveMember(member.user_id)}
                                            className="p-1.5 text-error hover:bg-error-light rounded-md transition-smooth"
                                            title="Remove member"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Member Form */}
                {canEditProject && (
                    <div className="border-t border-[var(--color-border)] pt-4">
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Add Team Member
                        </label>
                        {isLoadingUsers ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-[var(--color-accent)]" />
                            </div>
                        ) : availableUsers.length === 0 ? (
                            <p className="text-sm text-[var(--color-text-secondary)] py-2">
                                {allUsers.length === 0
                                    ? 'Unable to load users. Admin access required to add members.'
                                    : 'All users are already assigned to this project'}
                            </p>
                        ) : (
                            <form onSubmit={handleAddMember} className="space-y-3">
                                {/* Search Bar */}
                                {availableUsers.length > 3 && (
                                    <div className="relative">
                                        <Search 
                                            size={16} 
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" 
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search members by name, email, or role..."
                                            value={memberSearchQuery}
                                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                        Select User
                                    </label>
                                    {filteredAvailableUsers.length === 0 ? (
                                        <p className="text-sm text-[var(--color-text-secondary)] py-2">
                                            No members found matching "{memberSearchQuery}"
                                        </p>
                                    ) : (
                                        <select
                                            value={newMemberUserId}
                                            onChange={(e) => setNewMemberUserId(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-white"
                                        >
                                            <option value="">Select a user...</option>
                                            {filteredAvailableUsers.map((user) => {
                                                const roleLabel = user.role === 'admin' ? 'Admin' : 
                                                                  user.role === 'seo_analyst' ? 'SEO Analyst' : 
                                                                  user.role === 'content_writer' ? 'Content Writer' : 
                                                                  'Content Verifier';
                                                return (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name} ({user.email}) - {roleLabel}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    )}
                                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                                        User will be assigned to this project with their system role
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isAddingMember || !newMemberUserId}
                                    className="w-full px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isAddingMember && <Loader2 size={16} className="animate-spin" />}
                                    {isAddingMember ? 'Adding...' : 'Add Member'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
            )}
        </div>
    );
};

export default ProjectSettingsPage;
