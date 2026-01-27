import React, { useState, useEffect } from 'react';
import { Search, Loader2, Trash2, Save, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsers, updateUserRole, deleteUser } from '../../services/adminService';
import type { User, UserRole } from '../../types/user';

const TeamManagementPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingRole, setEditingRole] = useState<Record<string, UserRole>>({});
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ userId: string; userName: string } | null>(null);

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredUsers(
                users.filter(
                    (u) =>
                        u.name.toLowerCase().includes(query) ||
                        u.email.toLowerCase().includes(query) ||
                        u.role.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const allUsers = await getAllUsers();
            setUsers(allUsers);
            setFilteredUsers(allUsers);
        } catch (err: any) {
            setError(err.message || 'Failed to load team members');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        setEditingRole((prev) => ({ ...prev, [userId]: newRole }));
    };

    const handleSaveRole = async (userId: string) => {
        const newRole = editingRole[userId];
        if (!newRole) return;

        setUpdatingUserId(userId);
        setError('');
        setSuccess('');

        try {
            await updateUserRole(userId, newRole);
            setSuccess(`Role updated successfully`);
            
            // Update local state
            setUsers((prevUsers) =>
                prevUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
            );
            
            // Clear editing state
            setEditingRole((prev) => {
                const updated = { ...prev };
                delete updated[userId];
                return updated;
            });

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update role');
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleDeleteClick = (userId: string, userName: string) => {
        // Prevent admin from deleting themselves
        if (userId === currentUser?.id) {
            setError('You cannot delete your own account');
            return;
        }
        setShowDeleteConfirm({ userId, userName });
    };

    const handleDeleteConfirm = async () => {
        if (!showDeleteConfirm) return;

        const { userId } = showDeleteConfirm;
        setDeletingUserId(userId);
        setError('');
        setSuccess('');

        try {
            await deleteUser(userId);
            setSuccess('Team member removed successfully');
            
            // Update local state
            setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
            
            // Clear delete confirmation
            setShowDeleteConfirm(null);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to remove team member');
        } finally {
            setDeletingUserId(null);
        }
    };

    const getRoleBadgeColor = (role: UserRole) => {
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

    const getRoleLabel = (role: UserRole) => {
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

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                    Team Management
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                    Manage team members, assign roles, and control access permissions
                </p>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="mb-4 p-3 bg-success-light text-success text-sm rounded-md flex items-center justify-between">
                    <span>{success}</span>
                    <button onClick={() => setSuccess('')} className="text-success hover:text-success/80">
                        <X size={16} />
                    </button>
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-error-light text-error text-sm rounded-md flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-error hover:text-error/80">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                    />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    />
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)] mb-4" />
                    <p className="text-[var(--color-text-secondary)]">Loading team members...</p>
                </div>
            ) : (
                /* Users Table */
                <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Member
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-text-secondary)]">
                                            {searchQuery ? 'No team members found matching your search' : 'No team members yet'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => {
                                        const isEditing = editingRole[user.id] !== undefined;
                                        const currentRole = editingRole[user.id] || user.role;
                                        const isUpdating = updatingUserId === user.id;
                                        const isDeleting = deletingUserId === user.id;
                                        const isCurrentUser = user.id === currentUser?.id;

                                        return (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-[var(--color-bg-secondary)] transition-smooth"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={
                                                                user.avatar_url ||
                                                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
                                                            }
                                                            alt={user.name}
                                                            className="w-10 h-10 rounded-full mr-3"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-[var(--color-text-primary)]">
                                                                {user.name}
                                                                {isCurrentUser && (
                                                                    <span className="ml-2 text-xs text-[var(--color-text-tertiary)]">
                                                                        (You)
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-[var(--color-text-secondary)]">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                value={currentRole}
                                                                onChange={(e) =>
                                                                    handleRoleChange(user.id, e.target.value as UserRole)
                                                                }
                                                                disabled={isUpdating}
                                                                className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-white"
                                                            >
                                                                <option value="admin">Administrator</option>
                                                                <option value="seo_analyst">SEO Analyst</option>
                                                                <option value="content_writer">Content Writer</option>
                                                                <option value="content_verifier">Content Verifier</option>
                                                            </select>
                                                            <button
                                                                onClick={() => handleSaveRole(user.id)}
                                                                disabled={isUpdating || currentRole === user.role}
                                                                className="p-1.5 text-success hover:bg-success-light rounded-md transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Save role"
                                                            >
                                                                {isUpdating ? (
                                                                    <Loader2 size={16} className="animate-spin" />
                                                                ) : (
                                                                    <Save size={16} />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingRole((prev) => {
                                                                        const updated = { ...prev };
                                                                        delete updated[user.id];
                                                                        return updated;
                                                                    });
                                                                }}
                                                                disabled={isUpdating}
                                                                className="p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] rounded-md transition-smooth"
                                                                title="Cancel"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`inline-block px-2.5 py-1 text-xs rounded-full font-medium ${getRoleBadgeColor(
                                                                    user.role
                                                                )}`}
                                                            >
                                                                {getRoleLabel(user.role)}
                                                            </span>
                                                            {!isCurrentUser && (
                                                                <button
                                                                    onClick={() => handleRoleChange(user.id, user.role)}
                                                                    className="text-xs text-[var(--color-accent)] hover:underline"
                                                                >
                                                                    Edit
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                                                    {formatDate(user.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {!isCurrentUser && (
                                                        <button
                                                            onClick={() => handleDeleteClick(user.id, user.name)}
                                                            disabled={isDeleting || isUpdating}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-error hover:bg-error-light rounded-md transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isDeleting ? (
                                                                <>
                                                                    <Loader2 size={14} className="animate-spin" />
                                                                    Removing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Trash2 size={14} />
                                                                    Remove
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setShowDeleteConfirm(null)}
                >
                    <div 
                        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-error" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                                    Remove Team Member
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Are you sure you want to remove <strong>{showDeleteConfirm.userName}</strong> from
                                    the team? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                disabled={deletingUserId === showDeleteConfirm.userId}
                                className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-md text-[var(--color-text-secondary)] hover:bg-gray-50 transition-smooth disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deletingUserId === showDeleteConfirm.userId}
                                className="flex-1 px-4 py-2 bg-error text-white rounded-md hover:opacity-90 transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deletingUserId === showDeleteConfirm.userId && (
                                    <Loader2 size={16} className="animate-spin" />
                                )}
                                {deletingUserId === showDeleteConfirm.userId ? 'Removing...' : 'Remove Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagementPage;
