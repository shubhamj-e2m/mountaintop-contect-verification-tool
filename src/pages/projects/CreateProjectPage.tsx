import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Loader2, X, Search } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useAuth } from '../../contexts/AuthContext';
import { getUsersForAssignment, addProjectMember } from '../../services/projectService';
import type { User } from '../../types/user';

const CreateProjectPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const addProject = useProjectStore(state => state.addProject);

    // Form state
    const [projectName, setProjectName] = useState('');
    const [projectUrl, setProjectUrl] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [duplicateNameError, setDuplicateNameError] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Member selection state
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [memberError, setMemberError] = useState('');
    const [memberSearchQuery, setMemberSearchQuery] = useState('');

    // Fetch available users on mount
    useEffect(() => {
        fetchAllUsers();
    }, []);

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

    const handleToggleMember = (userId: string) => {
        setSelectedMemberIds(prev => 
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
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

    const getProjectRole = (userRole: string): 'seo_analyst' | 'content_writer' | 'content_verifier' => {
        if (userRole === 'admin' || userRole === 'seo_analyst') {
            return 'seo_analyst';
        } else if (userRole === 'content_writer') {
            return 'content_writer';
        } else if (userRole === 'content_verifier') {
            return 'content_verifier';
        }
        return 'content_writer';
    };

    // Filter members based on search query
    const filteredMembers = useMemo(() => {
        if (!memberSearchQuery.trim()) {
            return allUsers;
        }

        const query = memberSearchQuery.toLowerCase().trim();
        return allUsers.filter(user => 
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            getRoleLabel(user.role).toLowerCase().includes(query)
        );
    }, [allUsers, memberSearchQuery]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectName.trim() || !projectUrl.trim() || !user) return;

        setDuplicateNameError('');
        setMemberError('');
        setIsCreating(true);

        try {
            // Create the project
            const newProject = await addProject(
                projectName,
                projectUrl,
                projectDesc || undefined,
                user.id
            );

            if (newProject && newProject.id) {
                // Add selected members to the project
                if (selectedMemberIds.length > 0) {
                    try {
                        await Promise.all(
                            selectedMemberIds.map(async (userId) => {
                                const selectedUser = allUsers.find(u => u.id === userId);
                                if (selectedUser) {
                                    const projectRole = getProjectRole(selectedUser.role);
                                    await addProjectMember(newProject.id, userId, projectRole);
                                }
                            })
                        );
                    } catch (err: any) {
                        console.error('Error adding members:', err);
                        setMemberError('Project created but some members could not be added. You can add them later in project settings.');
                    }
                }

                // Navigate to the new project's detail page
                navigate(`/projects/${newProject.id}`);
            }
        } catch (error: any) {
            console.error('Error creating project:', error);
            if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
                setDuplicateNameError(error.message);
            } else {
                setDuplicateNameError('Failed to create project. Please try again.');
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleNameChange = (value: string) => {
        setProjectName(value);
        if (duplicateNameError) {
            setDuplicateNameError('');
        }
    };

    return (
        <div className="p-8 w-full">
            {/* Back Link */}
            <Link 
                to="/projects" 
                className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
            >
                <ArrowLeft size={16} />
                Back to Projects
            </Link>

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                    <Plus size={24} />
                    Create New Project
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                    Create a new project and assign team members
                </p>
            </div>

            {/* Error Messages */}
            {duplicateNameError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{duplicateNameError}</p>
                </div>
            )}
            {memberError && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-700">{memberError}</p>
                </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-6">
                {/* Project Details Section */}
                <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Project Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Company Website"
                                value={projectName}
                                onChange={(e) => handleNameChange(e.target.value)}
                                required
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
                                    duplicateNameError 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-[var(--color-border)]'
                                }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                Website URL *
                            </label>
                            <input
                                type="url"
                                placeholder="https://example.com"
                                value={projectUrl}
                                onChange={(e) => setProjectUrl(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                Description (optional)
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Brief description of the project..."
                                value={projectDesc}
                                onChange={(e) => setProjectDesc(e.target.value)}
                                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Team Members Section */}
                <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users size={18} />
                        Assign Team Members (Optional)
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                        Select team members to assign to this project. You can add more members later in project settings.
                    </p>

                    {/* Search Bar */}
                    {allUsers.length > 0 && (
                        <div className="relative mb-4">
                            <Search 
                                size={18} 
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" 
                            />
                            <input
                                type="text"
                                placeholder="Search members by name, email, or role..."
                                value={memberSearchQuery}
                                onChange={(e) => setMemberSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                            />
                        </div>
                    )}

                    {isLoadingUsers ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-[var(--color-accent)]" />
                        </div>
                    ) : allUsers.length === 0 ? (
                        <p className="text-sm text-[var(--color-text-secondary)] py-4">
                            Unable to load users. Admin access required to assign members.
                        </p>
                    ) : filteredMembers.length === 0 ? (
                        <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">
                            No members found matching "{memberSearchQuery}"
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredMembers.map((user) => {
                                const isSelected = selectedMemberIds.includes(user.id);
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => handleToggleMember(user.id)}
                                        className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-smooth ${
                                            isSelected
                                                ? 'bg-[var(--color-accent-light)] border-[var(--color-accent)]'
                                                : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                isSelected 
                                                    ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' 
                                                    : 'border-gray-300'
                                            }`}>
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <img
                                                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'default'}`}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-[var(--color-text-secondary)] truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-2 py-0.5 text-xs rounded-full font-medium ${getRoleBadgeColor(user.role)}`}
                                            >
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {selectedMemberIds.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                            <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                                Selected members ({selectedMemberIds.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {selectedMemberIds.map((userId) => {
                                    const selectedUser = allUsers.find(u => u.id === userId);
                                    if (!selectedUser) return null;
                                    return (
                                        <div
                                            key={userId}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-accent-light)] rounded-md text-sm"
                                        >
                                            <span className="text-[var(--color-text-primary)]">
                                                {selectedUser.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleMember(userId);
                                                }}
                                                className="text-[var(--color-accent)] hover:text-[var(--color-accent-dark)]"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/projects')}
                        disabled={isCreating}
                        className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-md text-[var(--color-text-secondary)] hover:bg-gray-50 transition-smooth disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isCreating || !!duplicateNameError}
                        className="flex-1 px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isCreating && <Loader2 size={16} className="animate-spin" />}
                        {isCreating ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProjectPage;
