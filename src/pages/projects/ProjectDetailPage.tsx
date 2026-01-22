import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ExternalLink, Settings, ArrowLeft } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import DataStatusIndicator from '../../components/ui/DataStatusIndicator';
import TargetPersonasDisplay from '../../components/personas/TargetPersonasDisplay';
import { useProjectStore } from '../../stores/projectStore';
import { useAuth } from '../../contexts/AuthContext';

const ProjectDetailPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { projects, addPage } = useProjectStore();
    const { user } = useAuth();
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'needs_work'>('all');
    const [showAddPageModal, setShowAddPageModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Admin, SEO Analyst, and Content Writer can create pages
    const canCreatePage = user?.role === 'admin' || user?.role === 'seo_analyst' || user?.role === 'content_writer';
    const canEditProject = user?.role === 'admin' || user?.role === 'seo_analyst';

    // Page Form state
    const [newPageName, setNewPageName] = useState('');
    const [newPageSlug, setNewPageSlug] = useState('');

    // Project Settings Form state
    const [editName, setEditName] = useState('');
    const [editWebsiteUrl, setEditWebsiteUrl] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editDriveUrl, setEditDriveUrl] = useState('');
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const project = projects.find(p => p.id === projectId);

    if (!project) {
        return (
            <div className="p-8">
                <p className="text-[var(--color-text-secondary)]">Project not found</p>
            </div>
        );
    }

    const filteredPages = project.pages.filter(page => {
        if (filter === 'all') return true;
        if (filter === 'pending') return page.status === 'pending_review';
        if (filter === 'approved') return page.status === 'approved';
        if (filter === 'needs_work') return ['revision_requested', 'awaiting_seo', 'awaiting_content'].includes(page.status);
        return true;
    });

    const stats = {
        total: project.pages.length,
        pending: project.pages.filter(p => p.status === 'pending_review').length,
        approved: project.pages.filter(p => p.status === 'approved').length,
        avgScore: project.pages.filter(p => p.analysis).reduce((acc, p) => acc + (p.analysis?.overall_score || 0), 0) /
            (project.pages.filter(p => p.analysis).length || 1),
    };

    const handleAddPage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPageName.trim() || !newPageSlug.trim() || !projectId) return;

        addPage(projectId, newPageName, newPageSlug);

        setNewPageName('');
        setNewPageSlug('');
        setShowAddPageModal(false);
    };

    const handleOpenSettings = () => {
        if (project) {
            setEditName(project.name);
            setEditWebsiteUrl(project.website_url);
            setEditDescription(project.description || '');
            setEditDriveUrl(project.google_drive_url || '');
            setShowSettingsModal(true);
        }
    };

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !editName.trim() || !editWebsiteUrl.trim()) return;

        setIsSavingSettings(true);
        try {
            await useProjectStore.getState().updateProject(projectId, {
                name: editName,
                website_url: editWebsiteUrl,
                description: editDescription,
                google_drive_url: editDriveUrl,
            });
            setShowSettingsModal(false);
        } catch (error) {
            console.error('Error updating project settings:', error);
        } finally {
            setIsSavingSettings(false);
        }
    };

    // Auto-generate slug from name
    const handleNameChange = (name: string) => {
        setNewPageName(name);
        setNewPageSlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    };

    return (
        <div className="p-8">
            {/* Back Link */}
            <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-4">
                <ArrowLeft size={16} />
                Back to Projects
            </Link>

            {/* Project Header */}
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">{project.name}</h1>
                        <a
                            href={project.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline"
                        >
                            {project.website_url}
                            <ExternalLink size={14} />
                        </a>
                        {project.description && (
                            <p className="text-[var(--color-text-secondary)] mt-2">{project.description}</p>
                        )}
                        {project.google_drive_url && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-text-tertiary)] bg-blue-50 w-fit px-2 py-1 rounded border border-blue-100">
                                <span className="font-semibold text-blue-700 uppercase">Drive Folder:</span>
                                <a href={project.google_drive_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 truncate max-w-[300px]">
                                    {project.google_drive_url}
                                </a>
                            </div>
                        )}
                    </div>
                    {canEditProject && (
                        <button
                            onClick={handleOpenSettings}
                            className="p-2 hover:bg-gray-100 rounded-md transition-smooth"
                        >
                            <Settings size={20} className="text-[var(--color-text-secondary)]" />
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">Total Pages</p>
                    <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
                </div>
                <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">Pending Review</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.pending}</p>
                </div>
                <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">Avg Score</p>
                    <p className="text-3xl font-bold text-[var(--color-accent)]">{Math.round(stats.avgScore)}%</p>
                </div>
            </div>

            {/* Target Personas Section */}
            <TargetPersonasDisplay projectId={project.id} className="mb-6" />

            {/* Filter Tabs and Add Page Button */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    {(['all', 'pending', 'approved', 'needs_work'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-smooth ${filter === tab ? 'bg-white text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                        >
                            {tab === 'all' ? 'All' : tab === 'pending' ? 'Pending' : tab === 'approved' ? 'Approved' : 'Needs Work'}
                        </button>
                    ))}
                </div>
                {canCreatePage && (
                    <button
                        onClick={() => setShowAddPageModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 transition-smooth font-medium text-sm"
                    >
                        <Plus size={16} />
                        Add Page
                    </button>
                )}
            </div>

            {/* Pages List */}
            <div className="space-y-2">
                {filteredPages.length === 0 ? (
                    <div className="bg-white border border-[var(--color-border)] rounded-lg p-8 text-center">
                        <p className="text-[var(--color-text-secondary)]">No pages found. Add your first page to get started.</p>
                    </div>
                ) : (
                    filteredPages.map(page => (
                        <Link
                            key={page.id}
                            to={`/projects/${projectId}/pages/${page.id}`}
                            className="block bg-white border border-[var(--color-border)] rounded-lg p-4 hover:shadow-md hover:border-[var(--color-accent)] transition-smooth"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <h3 className="font-medium text-[var(--color-text-primary)]">{page.name}</h3>
                                        <p className="text-sm text-[var(--color-text-tertiary)]">/{page.slug}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <DataStatusIndicator
                                            hasData={!!page.seo_data}
                                            needsRevision={page.status === 'revision_requested'}
                                            label="SEO"
                                        />
                                        <DataStatusIndicator
                                            hasData={!!page.content_data}
                                            needsRevision={page.status === 'revision_requested'}
                                            label="Content"
                                        />
                                    </div>
                                    {page.analysis && (
                                        <div className="text-right">
                                            <span className={`text-lg font-bold ${page.analysis.overall_score >= 80 ? 'text-green-600' : page.analysis.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {page.analysis.overall_score}%
                                            </span>
                                        </div>
                                    )}
                                    <StatusBadge status={page.status} size="sm" />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Add Page Modal */}
            {showAddPageModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h2 className="text-xl font-semibold mb-4">Add New Page</h2>
                        <form onSubmit={handleAddPage} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                    Page Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Home Page, About Us"
                                    value={newPageName}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                    Page Slug *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., home, about-us"
                                    value={newPageSlug}
                                    onChange={(e) => setNewPageSlug(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddPageModal(false)}
                                    className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-md text-[var(--color-text-secondary)] hover:bg-gray-50 transition-smooth"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 transition-smooth"
                                >
                                    Add Page
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Project Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
                        <h2 className="text-xl font-semibold mb-4">Project Settings</h2>
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
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSettingsModal(false)}
                                    className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-md text-[var(--color-text-secondary)] hover:bg-gray-50 transition-smooth"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingSettings}
                                    className="flex-1 px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 transition-smooth disabled:opacity-50"
                                >
                                    {isSavingSettings ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetailPage;
