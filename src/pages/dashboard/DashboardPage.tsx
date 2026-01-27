import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectStore } from '../../stores/projectStore';
import StatusBadge from '../../components/ui/StatusBadge';
import { ChevronDown, ChevronRight, FileText, Tag, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const projects = useProjectStore(state => state.projects);
    const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const allPages = projects.flatMap(p => p.pages.map(page => ({ ...page, projectName: p.name, projectId: p.id })));

    // Calculate overall stats
    const overallStats = {
        total: allPages.length,
        draft: allPages.filter(p => p.status === 'draft').length,
        awaitingSEO: allPages.filter(p => p.status === 'awaiting_seo').length,
        awaitingContent: allPages.filter(p => p.status === 'awaiting_content').length,
        pendingReview: allPages.filter(p => p.status === 'pending_review').length,
        approved: allPages.filter(p => p.status === 'approved').length,
        rejected: allPages.filter(p => p.status === 'rejected').length,
        revisionRequested: allPages.filter(p => p.status === 'revision_requested').length,
    };

    const toggleProject = (projectId: string) => {
        setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
    };

    // Get stage info for a page
    const getStageInfo = (status: string) => {
        switch (status) {
            case 'draft':
                return { step: 1, label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: FileText };
            case 'awaiting_seo':
                return { step: 2, label: 'Awaiting SEO', color: 'bg-blue-100 text-blue-700', icon: Tag };
            case 'awaiting_content':
                return { step: 2, label: 'Awaiting Content', color: 'bg-purple-100 text-purple-700', icon: FileText };
            case 'processing':
                return { step: 3, label: 'Processing', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
            case 'pending_review':
                return { step: 4, label: 'Pending Review', color: 'bg-orange-100 text-orange-700', icon: Clock };
            case 'revision_requested':
                return { step: 3, label: 'Revision Requested', color: 'bg-red-100 text-red-700', icon: AlertCircle };
            case 'approved':
                return { step: 5, label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle };
            case 'rejected':
                return { step: 5, label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle };
            default:
                return { step: 0, label: 'Unknown', color: 'bg-gray-100 text-gray-600', icon: FileText };
        }
    };

    return (
        <div className="p-8">
            {/* Welcome Section */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                    {getGreeting()}, {user?.name}
                </h1>
                <p className="text-text-secondary">
                    Here's what's happening with your projects today.
                </p>
            </div>

            {/* Status Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-gray-900">{overallStats.total}</p>
                    <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-gray-600">{overallStats.draft}</p>
                    <p className="text-xs text-gray-500">Draft</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                    <p className="text-2xl font-bold text-blue-600">{overallStats.awaitingSEO}</p>
                    <p className="text-xs text-blue-600">Awaiting SEO</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                    <p className="text-2xl font-bold text-purple-600">{overallStats.awaitingContent}</p>
                    <p className="text-xs text-purple-600">Awaiting Content</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
                    <p className="text-2xl font-bold text-orange-600">{overallStats.pendingReview}</p>
                    <p className="text-xs text-orange-600">Pending Review</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                    <p className="text-2xl font-bold text-red-600">{overallStats.revisionRequested}</p>
                    <p className="text-xs text-red-600">Revision</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                    <p className="text-2xl font-bold text-green-600">{overallStats.approved}</p>
                    <p className="text-xs text-green-600">Approved</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                    <p className="text-2xl font-bold text-red-600">{overallStats.rejected}</p>
                    <p className="text-xs text-red-600">Rejected</p>
                </div>
            </div>

            {/* Page Tracking by Project */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Page Tracking</h2>
                    <p className="text-sm text-gray-500">Track the status of each page across all projects</p>
                </div>

                <div className="divide-y divide-gray-100">
                    {projects.map(project => (
                        <div key={project.id}>
                            {/* Project Header - Expandable */}
                            <button
                                onClick={() => toggleProject(project.id)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {expandedProjects[project.id] ? (
                                        <ChevronDown size={18} className="text-gray-400" />
                                    ) : (
                                        <ChevronRight size={18} className="text-gray-400" />
                                    )}
                                    <div className="text-left">
                                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                                        <p className="text-sm text-gray-500">{project.website_url}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{project.pages.length} pages</span>
                                        <div className="flex gap-1">
                                            {project.pages.filter(p => p.status === 'approved').length > 0 && (
                                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-medium">
                                                    {project.pages.filter(p => p.status === 'approved').length}
                                                </span>
                                            )}
                                            {project.pages.filter(p => p.status === 'pending_review').length > 0 && (
                                                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs flex items-center justify-center font-medium">
                                                    {project.pages.filter(p => p.status === 'pending_review').length}
                                                </span>
                                            )}
                                            {project.pages.filter(p => p.status === 'revision_requested').length > 0 && (
                                                <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-medium">
                                                    {project.pages.filter(p => p.status === 'revision_requested').length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Expanded Pages List */}
                            {expandedProjects[project.id] && (
                                <div className="bg-gray-50 px-6 pb-4">
                                    <div className="space-y-2">
                                        {project.pages.length === 0 ? (
                                            <p className="text-sm text-gray-500 py-4 text-center">No pages yet</p>
                                        ) : (
                                            project.pages.map(page => {
                                                const stageInfo = getStageInfo(page.status);
                                                const StageIcon = stageInfo.icon;
                                                return (
                                                    <Link
                                                        key={page.id}
                                                        to={`/projects/${project.id}/pages/${page.id}`}
                                                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full ${stageInfo.color} flex items-center justify-center`}>
                                                                <StageIcon size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{page.name}</p>
                                                                <p className="text-xs text-gray-500">/{page.slug}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {/* Stage Progress Indicator */}
                                                            <div className="hidden md:flex items-center gap-1">
                                                                {[1, 2, 3, 4, 5].map(step => (
                                                                    <div
                                                                        key={step}
                                                                        className={`w-2 h-2 rounded-full ${
                                                                            step <= stageInfo.step
                                                                                ? page.status === 'rejected' || page.status === 'revision_requested'
                                                                                    ? 'bg-red-400'
                                                                                    : page.status === 'approved'
                                                                                        ? 'bg-green-400'
                                                                                        : 'bg-blue-400'
                                                                                : 'bg-gray-200'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            {/* Data Indicators */}
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${page.seo_data ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                                                    SEO
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${page.content_data ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                                                                    Content
                                                                </span>
                                                            </div>
                                                            <StatusBadge status={page.status} size="sm" />
                                                        </div>
                                                    </Link>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <p className="text-gray-500">No projects yet. Create your first project to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
