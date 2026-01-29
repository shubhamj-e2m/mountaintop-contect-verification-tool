import React, { useState, useEffect, useRef } from 'react';
import { User, Bell, Link as LinkIcon, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { supabase } from '../../lib/supabase';

const AVATAR_BUCKET = 'avatars';
const AVATAR_MAX_SIZE_MB = 2;
const AVATAR_ACCEPT = 'image/jpeg,image/png,image/gif';

const formatRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
        admin: 'Admin',
        seo_analyst: 'SEO Analyst',
        content_writer: 'Content Writer',
        content_verifier: 'Content Verifier',
    };
    return labels[role] ?? role;
};

const SettingsPage: React.FC = () => {
    const { user, refreshUserProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'integrations'>('profile');
    const [name, setName] = useState(user?.name ?? '');
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [googleDriveStatus, setGoogleDriveStatus] = useState<{ enabled: boolean; authenticated: boolean } | null>(null);
    const [integrationsError, setIntegrationsError] = useState('');
    const [integrationsSuccess, setIntegrationsSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setName(user?.name ?? '');
    }, [user?.name]);

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'integrations', label: 'Integrations', icon: LinkIcon },
    ] as const;

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        if (!user?.id) return;
        setIsSavingProfile(true);
        try {
            await apiClient.patch<{ id: string; name: string; email: string; role: string; avatar_url?: string | null }>('/users/me', { name: name.trim() });
            refreshUserProfile();
            setProfileSuccess('Profile updated.');
        } catch (err) {
            setProfileError(err instanceof Error ? err.message : 'Failed to save profile');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;
        if (file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024) {
            setProfileError(`Image must be under ${AVATAR_MAX_SIZE_MB}MB`);
            return;
        }
        setProfileError('');
        setProfileSuccess('');
        setIsUploadingAvatar(true);
        try {
            const ext = file.name.split('.').pop() || 'png';
            const path = `${user.id}/avatar.${ext}`;
            const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
            const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
            await apiClient.patch('/users/me', { avatar_url: avatarUrl });
            refreshUserProfile();
            setProfileSuccess('Avatar updated.');
        } catch (err: unknown) {
            const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Failed to upload avatar';
            setProfileError(message.includes('Bucket') ? `${message} Create a public "avatars" bucket in Supabase Storage if needed.` : message);
        } finally {
            setIsUploadingAvatar(false);
            e.target.value = '';
        }
    };

    const handleConnectGoogleDrive = () => {
        apiClient.get<{ authUrl: string }>('/google-drive/auth-url').then((data) => {
            if (data?.authUrl) window.location.href = data.authUrl;
        }).catch(() => setIntegrationsError('Only admins can connect Google Drive.'));
    };

    useEffect(() => {
        if (activeTab === 'integrations') {
            setIntegrationsError('');
            apiClient.get<{ enabled: boolean; authenticated: boolean }>('/google-drive/status')
                .then(setGoogleDriveStatus)
                .catch(() => setGoogleDriveStatus(null));
        }
    }, [activeTab]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('google_drive') === 'connected') {
            setActiveTab('integrations');
            setIntegrationsSuccess('Google Drive connected.');
            window.history.replaceState({}, '', window.location.pathname);
        } else if (params.get('google_drive') === 'error') {
            setActiveTab('integrations');
            setIntegrationsError('Google Drive connection failed.');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Settings</h1>

            <div className="flex gap-6">
                <div className="w-48 space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left transition-smooth ${activeTab === tab.id
                                    ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)] font-medium'
                                    : 'text-[var(--color-text-secondary)] hover:bg-gray-100'
                                }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1 max-w-2xl">
                    {activeTab === 'profile' && (
                        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-6">Profile Settings</h2>

                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'default'}`}
                                    alt="Avatar"
                                    className="w-20 h-20 rounded-full object-cover"
                                />
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept={AVATAR_ACCEPT}
                                        className="sr-only"
                                        onChange={handleAvatarChange}
                                        disabled={isUploadingAvatar}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingAvatar}
                                        className="px-4 py-2 border border-[var(--color-border)] rounded-md text-sm hover:bg-gray-50 transition-smooth disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isUploadingAvatar && <Loader2 size={16} className="animate-spin" />}
                                        Change Avatar
                                    </button>
                                    <p className="text-sm text-[var(--color-text-tertiary)] mt-1">JPG, PNG or GIF. Max {AVATAR_MAX_SIZE_MB}MB.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div>
                                    <label htmlFor="profile-name" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        id="profile-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="profile-email" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                        Email
                                    </label>
                                    <input
                                        id="profile-email"
                                        type="email"
                                        value={user?.email ?? ''}
                                        readOnly
                                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md bg-gray-50 text-[var(--color-text-secondary)] cursor-not-allowed"
                                    />
                                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Email cannot be changed here. Use your account provider to update it.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                        Role
                                    </label>
                                    <p className="px-4 py-2 bg-gray-50 border border-[var(--color-border)] rounded-md text-[var(--color-text-secondary)]">
                                        {user?.role ? formatRoleLabel(user.role) : '—'}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Role is managed by your admin.</p>
                                </div>

                                {profileError && (
                                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{profileError}</div>
                                )}
                                {profileSuccess && (
                                    <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md">{profileSuccess}</div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSavingProfile || !name.trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSavingProfile && <Loader2 size={16} className="animate-spin" />}
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-6">Notifications</h2>
                            <p className="text-[var(--color-text-secondary)]">
                                You receive in-app notifications for tasks, comments, and content updates. Open the Activity or Notifications area in the app to view and manage them. Email notification preferences are not yet configurable here.
                            </p>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-6">Integrations</h2>

                            {integrationsSuccess && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-md">{integrationsSuccess}</div>
                            )}
                            {integrationsError && (
                                <div className="mb-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-md">{integrationsError}</div>
                            )}

                            <div className="space-y-4">
                                <div className="p-4 border border-[var(--color-border)] rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium">Google Drive</h3>
                                        {googleDriveStatus && (
                                            <span className={`px-2 py-1 text-xs rounded-full ${googleDriveStatus.authenticated ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {googleDriveStatus.authenticated ? 'Connected' : 'Not connected'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                                        Connect Google Drive to import strategic documents and content from folders. Only an admin can connect; the connection is shared for the app.
                                    </p>
                                    {googleDriveStatus?.enabled && !googleDriveStatus?.authenticated && (
                                        <button
                                            type="button"
                                            onClick={handleConnectGoogleDrive}
                                            className="px-4 py-2 border border-[var(--color-border)] rounded-md text-sm hover:bg-gray-50 transition-smooth"
                                        >
                                            Connect Google Drive
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
