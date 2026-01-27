import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, FileText, Trash2 } from 'lucide-react';
import type { Project } from '../../types/project';
import { useProjectStore } from '../../stores/projectStore';

interface ProjectCardProps {
    project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const navigate = useNavigate();
    const deleteProject = useProjectStore(state => state.deleteProject);
    const approvedPages = project.pages.filter(p => p.status === 'approved').length;
    const pendingPages = project.pages.filter(p => p.status === 'pending_review').length;
    const totalPages = project.pages.length;
    const progress = totalPages > 0 ? (approvedPages / totalPages) * 100 : 0;

    const handleCardClick = () => {
        navigate(`/projects/${project.id}`);
    };

    const handleExternalLinkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(project.website_url, '_blank', 'noopener,noreferrer');
    };

    const handleDeleteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
            await deleteProject(project.id);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="block bg-white border border-[var(--color-border)] rounded-lg p-5 hover:shadow-md hover:border-[var(--color-accent)] transition-smooth cursor-pointer"
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] truncate">{project.name}</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExternalLinkClick}
                        className="text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-smooth"
                        title="Open website"
                    >
                        <ExternalLink size={16} />
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="text-[var(--color-text-tertiary)] hover:text-red-500 transition-smooth"
                        title="Delete project"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <p className="text-sm text-[var(--color-text-tertiary)] mb-3 truncate">{project.website_url}</p>

            {project.description && (
                <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">{project.description}</p>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] mb-4">
                <span className="flex items-center gap-1">
                    <FileText size={14} />
                    {totalPages} pages
                </span>
                {pendingPages > 0 && (
                    <span className="text-orange-600">{pendingPages} pending</span>
                )}
                {approvedPages > 0 && (
                    <span className="text-green-600">{approvedPages} approved</span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {approvedPages}/{totalPages} pages approved
            </p>
        </div>
    );
};

export default ProjectCard;
