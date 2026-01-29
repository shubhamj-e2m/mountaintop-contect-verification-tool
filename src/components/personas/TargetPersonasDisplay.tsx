import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import * as ProjectTypes from '../../types/project';

type TargetPersonaAnalysis = ProjectTypes.TargetPersonaAnalysis;
type CustomerPersona = ProjectTypes.CustomerPersona;

interface TargetPersonasDisplayProps {
    projectId: string;
    className?: string;
}

const TargetPersonasDisplay: React.FC<TargetPersonasDisplayProps> = ({ 
    projectId, 
    className = '' 
}) => {
    const [targetPersonas, setTargetPersonas] = useState<TargetPersonaAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchTargetPersonas = async () => {
        try {
            const result = await apiClient.get<{
                success: boolean;
                data: TargetPersonaAnalysis | null;
                message?: string;
            }>(`/projects/${projectId}/target-personas`);
            
            if (result.success) {
                setTargetPersonas(result.data);
                setError(null);
            } else {
                setError(result.message || 'Failed to fetch target personas');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch target personas');
            console.error('Error fetching target personas:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefreshPersonas = async () => {
        setIsRefreshing(true);
        try {
            const result = await apiClient.post<{
                success: boolean;
                data: TargetPersonaAnalysis;
                message?: string;
            }>(`/projects/${projectId}/target-personas/refresh`);
            
            if (result.success) {
                setTargetPersonas(result.data);
                setError(null);
            } else {
                setError(result.message || 'Failed to refresh target personas');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh target personas');
            console.error('Error refreshing target personas:', err);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleToggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        fetchTargetPersonas();
    }, [projectId]);

    const renderPersona = (persona: CustomerPersona, title: string, accentColor: string) => (
        <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg overflow-hidden">
            <div className={`px-4 py-3 font-semibold text-sm flex items-center gap-2 ${accentColor}`}>
                <Users size={16} />
                {title}
            </div>
            <div className="p-4 bg-[var(--color-bg-secondary)] space-y-4">
                {/* Summary */}
                <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-3">
                    <p className="text-sm text-[var(--color-text-secondary)] italic">"{persona.summary}"</p>
                </div>

                {/* Demographics */}
                <div>
                    <h5 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">Demographics</h5>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[var(--color-bg-tertiary)] p-2 rounded border border-[var(--color-border)]">
                            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Age Range</span>
                            <p className="text-xs font-medium text-[var(--color-text-primary)]">{persona.demographics.age_range}</p>
                        </div>
                        <div className="bg-[var(--color-bg-tertiary)] p-2 rounded border border-[var(--color-border)]">
                            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Gender</span>
                            <p className="text-xs font-medium text-[var(--color-text-primary)]">{persona.demographics.gender}</p>
                        </div>
                        <div className="bg-[var(--color-bg-tertiary)] p-2 rounded border border-[var(--color-border)]">
                            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Location</span>
                            <p className="text-xs font-medium text-[var(--color-text-primary)]">{persona.demographics.location}</p>
                        </div>
                        <div className="bg-[var(--color-bg-tertiary)] p-2 rounded border border-[var(--color-border)]">
                            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Income Level</span>
                            <p className="text-xs font-medium text-[var(--color-text-primary)]">{persona.demographics.income_level}</p>
                        </div>
                    </div>
                </div>

                {/* Psychographics */}
                <div>
                    <h5 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">Psychographics</h5>
                    <div className="space-y-2">
                        {persona.psychographics.interests.length > 0 && (
                            <div>
                                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Interests</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {persona.psychographics.interests.map((item, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-[var(--color-info-light)] text-[var(--color-info)] text-[10px] rounded-full border border-[var(--color-border)]">{item}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {persona.psychographics.values.length > 0 && (
                            <div>
                                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Values</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {persona.psychographics.values.map((item, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-[var(--color-success-light)] text-[var(--color-success)] text-[10px] rounded-full border border-[var(--color-border)]">{item}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {persona.psychographics.pain_points.length > 0 && (
                            <div>
                                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Pain Points</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {persona.psychographics.pain_points.map((item, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-[var(--color-error-light)] text-[var(--color-error)] text-[10px] rounded-full border border-[var(--color-border)]">{item}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {persona.psychographics.goals.length > 0 && (
                            <div>
                                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Goals</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {persona.psychographics.goals.map((item, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-[var(--color-accent-light)] text-[var(--color-accent)] text-[10px] rounded-full border border-[var(--color-border)]">{item}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Behavior */}
                <div>
                    <h5 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">Behavior</h5>
                    <div className="space-y-2">
                        {persona.behavior.decision_factors.length > 0 && (
                            <div>
                                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Decision Factors</span>
                                <ul className="mt-1 space-y-1">
                                    {persona.behavior.decision_factors.map((item, i) => (
                                        <li key={i} className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                                            <span className="w-1 h-1 bg-[var(--color-text-tertiary)] rounded-full"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {persona.behavior.buying_patterns.length > 0 && (
                            <div>
                                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Buying Patterns</span>
                                <ul className="mt-1 space-y-1">
                                    {persona.behavior.buying_patterns.map((item, i) => (
                                        <li key={i} className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                                            <span className="w-1 h-1 bg-[var(--color-text-tertiary)] rounded-full"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {persona.behavior.online_behavior.length > 0 && (
                            <div>
                                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Online Behavior</span>
                                <ul className="mt-1 space-y-1">
                                    {persona.behavior.online_behavior.map((item, i) => (
                                        <li key={i} className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                                            <span className="w-1 h-1 bg-[var(--color-text-tertiary)] rounded-full"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className={`bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-6 ${className}`}>
                <div className="flex items-center justify-center">
                    <RefreshCw className="animate-spin mr-2 text-[var(--color-text-tertiary)]" size={16} />
                    <span className="text-sm text-[var(--color-text-secondary)]">Loading target personas...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-6 ${className}`}>
                <div className="text-center">
                    <p className="text-sm text-[var(--color-error)] mb-3">{error}</p>
                    <button
                        onClick={fetchTargetPersonas}
                        className="px-3 py-1 bg-[var(--color-accent)] text-white text-xs rounded hover:opacity-90 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!targetPersonas) {
        return (
            <div className={`bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg ${className}`}>
                {/* Collapsed Header */}
                <div 
                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[var(--color-bg-tertiary)] transition-colors"
                    onClick={handleToggleExpanded}
                >
                    <div className="flex items-center gap-2">
                        <Users size={18} className="text-[var(--color-accent)]" />
                        <h3 className="font-semibold text-[var(--color-text-primary)]">Target Market</h3>
                        <span className="text-xs text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded">Not Available</span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-[var(--color-text-secondary)]" /> : <ChevronDown size={16} className="text-[var(--color-text-secondary)]" />}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="px-4 pb-4 border-t border-[var(--color-border)]">
                        <div className="text-center py-4">
                            <FileText className="mx-auto mb-2 text-[var(--color-text-tertiary)]" size={24} />
                            <p className="text-sm text-[var(--color-text-secondary)] mb-3">No target personas available</p>
                            <p className="text-xs text-[var(--color-text-tertiary)] mb-3">Strategic documents (Digital Trailmap or Brand Strategy) may be missing from Google Drive.</p>
                            <button
                                onClick={handleRefreshPersonas}
                                disabled={isRefreshing}
                                className="px-3 py-1 bg-[var(--color-accent)] text-white text-xs rounded hover:opacity-90 transition-colors disabled:opacity-50"
                            >
                                {isRefreshing ? 'Generating...' : 'Generate Personas'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg overflow-hidden ${className}`}>
            {/* Accordion Header */}
            <div 
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[var(--color-bg-tertiary)] transition-colors"
                onClick={handleToggleExpanded}
            >
                <div className="flex items-center gap-2">
                    <Users size={18} className="text-[var(--color-accent)]" />
                    <h3 className="font-semibold text-[var(--color-text-primary)]">Target Market</h3>
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                        <Calendar size={12} />
                        <span>Generated {new Date(targetPersonas.generated_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRefreshPersonas();
                        }}
                        disabled={isRefreshing}
                        className="flex items-center gap-1 px-2 py-1 bg-[var(--color-accent)] text-white text-xs rounded hover:opacity-90 transition-colors disabled:opacity-50"
                        title="Regenerate personas from strategic documents"
                    >
                        <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    {isExpanded ? <ChevronUp size={16} className="text-[var(--color-text-secondary)]" /> : <ChevronDown size={16} className="text-[var(--color-text-secondary)]" />}
                </div>
            </div>

            {/* Collapsible Content */}
            {isExpanded && (
                <>
                    {/* Source Documents */}
                    <div className="px-4 py-2 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)]">
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                            <FileText size={12} />
                            <span>Generated from:</span>
                            <div className="flex gap-1">
                                {targetPersonas.source_documents.map((doc, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] rounded text-[10px] border border-[var(--color-border)]">
                                        {doc === 'trailmap' ? 'Digital Trailmap' : 'Brand Strategy'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Personas Grid */}
                    <div className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {renderPersona(
                                targetPersonas.sme_persona,
                                '🏢 SME Customer',
                                'bg-[var(--color-info-light)] text-[var(--color-info)]'
                            )}
                            {renderPersona(
                                targetPersonas.enterprise_persona,
                                '🏛️ Enterprise Customer',
                                'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TargetPersonasDisplay;