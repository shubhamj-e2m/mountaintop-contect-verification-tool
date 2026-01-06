import React, { useState } from 'react';
import { User, Bell, Link as LinkIcon, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/user';

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'integrations'>('profile');
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'integrations', label: 'Integrations', icon: LinkIcon },
    ] as const;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Settings</h1>

            <div className="flex gap-6">
                {/* Sidebar Tabs */}
                <div className="w-48 space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
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

                {/* Content */}
                <div className="flex-1 max-w-2xl">
                    {activeTab === 'profile' && (
                        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-6">Profile Settings</h2>

                            {/* Avatar */}
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                    alt="Avatar"
                                    className="w-20 h-20 rounded-full"
                                />
                                <div>
                                    <button className="px-4 py-2 border border-[var(--color-border)] rounded-md text-sm hover:bg-gray-50 transition-smooth">
                                        Change Avatar
                                    </button>
                                    <p className="text-sm text-[var(--color-text-tertiary)] mt-1">JPG, PNG or GIF. Max 2MB.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                        Role
                                    </label>
                                    <p className="px-4 py-2 bg-gray-50 border border-[var(--color-border)] rounded-md text-[var(--color-text-secondary)]">
                                        {user?.role === 'seo_analyst' ? 'SEO Analyst' :
                                            user?.role === 'content_writer' ? 'Content Writer' : 'Content Verifier'}
                                    </p>
                                </div>

                                {/* Demo Role Switcher */}
                                <div className="pt-4 border-t border-[var(--color-border)]">
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                        Demo: Switch Role
                                    </label>
                                    <div className="flex gap-2">
                                        {(['seo_analyst', 'content_writer', 'content_verifier'] as UserRole[]).map((role) => (
                                            <button
                                                key={role}
                                                onClick={() => {/* switchRole not implemented */}}
                                                className={`px-3 py-1.5 text-sm rounded-md transition-smooth ${user?.role === role
                                                        ? 'bg-[var(--color-accent)] text-white'
                                                        : 'border border-[var(--color-border)] hover:bg-gray-50'
                                                    }`}
                                            >
                                                {role === 'seo_analyst' ? 'SEO Analyst' :
                                                    role === 'content_writer' ? 'Content Writer' : 'Content Verifier'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 transition-smooth mt-4">
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-6">Notification Preferences</h2>

                            <div className="space-y-4">
                                {[
                                    { label: 'New task assigned', desc: 'Get notified when you have a new task' },
                                    { label: 'Revision requested', desc: 'Get notified when your work needs revision' },
                                    { label: 'Content approved', desc: 'Get notified when content is approved' },
                                    { label: 'New comments', desc: 'Get notified about new comments on your pages' },
                                    { label: 'Analysis complete', desc: 'Get notified when AI analysis is complete' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
                                        <div>
                                            <p className="font-medium text-[var(--color-text-primary)]">{item.label}</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-6">Integrations</h2>

                            <div className="space-y-4">
                                <div className="p-4 border border-[var(--color-border)] rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium">n8n Webhooks</h3>
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Not Connected</span>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                                        Connect your n8n instance for AI-powered content analysis
                                    </p>
                                    <input
                                        type="url"
                                        placeholder="https://your-n8n-instance.com/webhook/..."
                                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    />
                                </div>

                                <div className="p-4 border border-[var(--color-border)] rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium">Google Sheets API</h3>
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Not Connected</span>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                                        Enable direct Google Sheets import for content data
                                    </p>
                                    <button className="px-4 py-2 border border-[var(--color-border)] rounded-md text-sm hover:bg-gray-50 transition-smooth">
                                        Connect Google Account
                                    </button>
                                </div>

                                <div className="p-4 border border-[var(--color-border)] rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium">Supabase</h3>
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Not Connected</span>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                                        Connect to Supabase for data persistence
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="url"
                                            placeholder="Supabase URL"
                                            className="px-3 py-2 border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Anon Key"
                                            className="px-3 py-2 border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                        />
                                    </div>
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
