import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import * as ProjectTypes from '../../types/project';

type TrailmapPersonas = ProjectTypes.TrailmapPersonas;
type TrailmapCustomerPersona = ProjectTypes.TrailmapCustomerPersona;

interface TrailmapPersonasDisplayProps {
    projectId: string;
    className?: string;
}

const TrailmapPersonasDisplay: React.FC<TrailmapPersonasDisplayProps> = ({ 
    projectId, 
    className = '' 
}) => {
    const [trailmapPersonas, setTrailmapPersonas] = useState<TrailmapPersonas | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchTrailmapPersonas = async () => {
        try {
            const result = await apiClient.get<{
                success: boolean;
                data: TrailmapPersonas | null;
                message?: string;
            }>(`/projects/${projectId}/trailmap-personas`);
            
            if (result.success) {
                console.log('Trailmap Personas fetched:', JSON.stringify(result.data, null, 2));
                setTrailmapPersonas(result.data);
                setError(null);
            } else {
                setError(result.message || 'Failed to fetch trailmap personas');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch trailmap personas');
            console.error('Error fetching trailmap personas:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefreshPersonas = async () => {
        setIsRefreshing(true);
        try {
            const result = await apiClient.post<{
                success: boolean;
                data: TrailmapPersonas;
                message?: string;
            }>(`/projects/${projectId}/trailmap-personas/refresh`);
            
            if (result.success) {
                setTrailmapPersonas(result.data);
                setError(null);
            } else {
                setError(result.message || 'Failed to refresh trailmap personas');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh trailmap personas');
            console.error('Error refreshing trailmap personas:', err);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleToggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        fetchTrailmapPersonas();
    }, [projectId]);

    const renderPersona = (persona: TrailmapCustomerPersona, title: string, key: string) => {
        const colors = [
            'bg-blue-100 text-blue-800',
            'bg-purple-100 text-purple-800',
            'bg-green-100 text-green-800',
            'bg-orange-100 text-orange-800',
        ];
        // Use hash of key for consistent color assignment
        const colorIndex = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const accentColor = colors[colorIndex % colors.length];

        return (
            <div key={key} className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg overflow-hidden">
                <div className={`px-4 py-3 font-semibold text-sm flex items-center gap-2 ${accentColor}`}>
                    <Users size={16} />
                    {title}
                </div>
                <div className="p-4 bg-[var(--color-bg-secondary)] space-y-4">
                    {/* Personal Details */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[var(--color-bg-tertiary)] p-2 rounded border border-[var(--color-border)]">
                            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Name</span>
                            <p className="text-xs font-medium text-[var(--color-text-primary)]">{persona.name || title || 'Not specified'}</p>
                        </div>
                        <div className="bg-[var(--color-bg-tertiary)] p-2 rounded border border-[var(--color-border)]">
                            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Age</span>
                            <p className="text-xs font-medium text-[var(--color-text-primary)]">{persona.age || 'Not specified'}</p>
                        </div>
                        <div className="bg-[var(--color-bg-tertiary)] p-2 rounded border border-[var(--color-border)]">
                            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase">Location</span>
                            <p className="text-xs font-medium text-[var(--color-text-primary)]">{persona.location || 'Not specified'}</p>
                        </div>
                    </div>

                    {/* Description */}
                    {persona.description && persona.description.trim() !== '' && persona.description !== 'Persona description not specified in trailmap.' && (
                        <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-3">
                            <h5 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">Description</h5>
                            <p className="text-sm text-[var(--color-text-secondary)]">{persona.description}</p>
                        </div>
                    )}

                    {/* Communication Preferences */}
                    {persona.communication_preferences && persona.communication_preferences.trim() !== '' && persona.communication_preferences !== 'Communication preferences not specified.' && (
                        <div>
                            <h5 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">Communication Preferences</h5>
                            <p className="text-xs text-[var(--color-text-secondary)]">{persona.communication_preferences}</p>
                        </div>
                    )}

                    {/* Goals */}
                    {persona.goals && Array.isArray(persona.goals) && persona.goals.length > 0 && (
                        <div>
                            <h5 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">Goals</h5>
                            <ul className="space-y-1">
                                {persona.goals.map((item, i) => (
                                    <li key={i} className="text-xs text-[var(--color-text-secondary)] flex items-start gap-2">
                                        <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Transformation */}
                    {persona.transformation && persona.transformation.trim() !== '' && persona.transformation !== 'Transformation not specified.' && (
                        <div>
                            <h5 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">Transformation</h5>
                            <p className="text-xs text-[var(--color-text-secondary)]">{persona.transformation}</p>
                        </div>
                    )}

                    {/* Pain Points */}
                    {persona.pain_points && Array.isArray(persona.pain_points) && persona.pain_points.length > 0 && (
                        <div>
                            <h5 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">Pain Points</h5>
                            <ul className="space-y-1">
                                {persona.pain_points.map((item, i) => (
                                    <li key={i} className="text-xs text-[var(--color-text-secondary)] flex items-start gap-2">
                                        <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Hesitations */}
                    {persona.hesitations && Array.isArray(persona.hesitations) && persona.hesitations.length > 0 && (
                        <div>
                            <h5 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">Hesitations</h5>
                            <ul className="space-y-1">
                                {persona.hesitations.map((item, i) => (
                                    <li key={i} className="text-xs text-[var(--color-text-secondary)] flex items-start gap-2">
                                        <span className="w-1 h-1 bg-orange-500 rounded-full mt-1.5"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Influencers */}
                    {persona.influencers && Array.isArray(persona.influencers) && persona.influencers.length > 0 && (
                        <div>
                            <h5 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-2">Influencers</h5>
                            <ul className="space-y-1">
                                {persona.influencers.map((item, i) => (
                                    <li key={i} className="text-xs text-[var(--color-text-secondary)] flex items-start gap-2">
                                        <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className={`bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-6 ${className}`}>
                <div className="flex items-center justify-center">
                    <RefreshCw className="animate-spin mr-2 text-[var(--color-text-tertiary)]" size={16} />
                    <span className="text-sm text-[var(--color-text-secondary)]">Loading customer personas...</span>
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
                        onClick={fetchTrailmapPersonas}
                        className="px-3 py-1 bg-[var(--color-accent)] text-white text-xs rounded hover:opacity-90 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!trailmapPersonas || trailmapPersonas.personas.length === 0) {
        return (
            <div className={`bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg ${className}`}>
                {/* Collapsed Header */}
                <div 
                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[var(--color-bg-tertiary)] transition-colors"
                    onClick={handleToggleExpanded}
                >
                    <div className="flex items-center gap-2">
                        <Users size={18} className="text-[var(--color-accent)]" />
                        <h3 className="font-semibold text-[var(--color-text-primary)]">Customer Personas</h3>
                        <span className="text-xs text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded">Not Available</span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-[var(--color-text-secondary)]" /> : <ChevronDown size={16} className="text-[var(--color-text-secondary)]" />}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="px-4 pb-4 border-t border-[var(--color-border)]">
                        <div className="text-center py-4">
                            <FileText className="mx-auto mb-2 text-[var(--color-text-tertiary)]" size={24} />
                            <p className="text-sm text-[var(--color-text-secondary)] mb-3">No customer personas available</p>
                            <p className="text-xs text-[var(--color-text-tertiary)] mb-3">Digital Trailmap document may be missing from Google Drive.</p>
                            <button
                                onClick={handleRefreshPersonas}
                                disabled={isRefreshing}
                                className="px-3 py-1 bg-[var(--color-accent)] text-white text-xs rounded hover:opacity-90 transition-colors disabled:opacity-50"
                            >
                                {isRefreshing ? 'Extracting...' : 'Extract Personas'}
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
                    <h3 className="font-semibold text-[var(--color-text-primary)]">Customer Personas</h3>
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                        <Calendar size={12} />
                        <span>Extracted {new Date(trailmapPersonas.extracted_at).toLocaleDateString()}</span>
                    </div>
                    <span className="text-xs text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded">
                        {trailmapPersonas.personas.length} {trailmapPersonas.personas.length === 1 ? 'persona' : 'personas'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRefreshPersonas();
                        }}
                        disabled={isRefreshing}
                        className="flex items-center gap-1 px-2 py-1 bg-[var(--color-accent)] text-white text-xs rounded hover:opacity-90 transition-colors disabled:opacity-50"
                        title="Re-extract personas from trailmap"
                    >
                        <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                        {isRefreshing ? 'Extracting...' : 'Refresh'}
                    </button>
                    {isExpanded ? <ChevronUp size={16} className="text-[var(--color-text-secondary)]" /> : <ChevronDown size={16} className="text-[var(--color-text-secondary)]" />}
                </div>
            </div>

            {/* Collapsible Content */}
            {isExpanded && (
                <>
                    {/* Source Document */}
                    <div className="px-4 py-2 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)]">
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                            <FileText size={12} />
                            <span>Extracted from:</span>
                            <span className="px-1.5 py-0.5 bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] rounded text-[10px] border border-[var(--color-border)]">
                                Digital Trailmap
                            </span>
                        </div>
                    </div>

                    {/* Personas Grid */}
                    <div className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {trailmapPersonas.personas.map((p) => 
                                renderPersona(p.persona, p.name, p.id)
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TrailmapPersonasDisplay;
