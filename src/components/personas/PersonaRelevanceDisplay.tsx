import React from 'react';
import type { EnhancedTargetMarketPersona, PersonaRelevanceItem } from '../../types/project';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PersonaRelevanceDisplayProps {
    persona: EnhancedTargetMarketPersona;
    className?: string;
}

const PersonaRelevanceDisplay: React.FC<PersonaRelevanceDisplayProps> = ({ 
    persona, 
    className = '' 
}) => {
    const relevance = persona.target_relevance;

    // Only show if SME/Enterprise relevance exists
    if (!relevance || relevance.sme_score === undefined || relevance.enterprise_score === undefined) {
        return null;
    }

    const getScoreColor = (score: number): string => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getScoreTextColor = (score: number): string => {
        if (score >= 80) return 'text-green-700';
        if (score >= 60) return 'text-yellow-700';
        if (score >= 40) return 'text-orange-700';
        return 'text-red-700';
    };

    const getPrimaryTargetBadge = () => {
        if (!relevance.primary_target) {
            return null;
        }

        const colors = {
            SME: 'bg-blue-100 text-blue-800',
            ENTERPRISE: 'bg-purple-100 text-purple-800',
            MIXED: 'bg-gray-100 text-gray-800',
        };

        const labels = {
            SME: 'SME Target',
            ENTERPRISE: 'Enterprise Target',
            MIXED: 'Mixed Target',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[relevance.primary_target] || 'bg-gray-100 text-gray-800'}`}>
                {labels[relevance.primary_target] || 'Mixed Target'}
            </span>
        );
    };

    const getConfidenceBadge = () => {
        if (!relevance.confidence_level) {
            return null;
        }

        const colors = {
            high: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-red-100 text-red-800',
        };

        const confidenceLevel = relevance.confidence_level;
        const colorClass = colors[confidenceLevel] || 'bg-gray-100 text-gray-800';

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                {confidenceLevel.charAt(0).toUpperCase() + confidenceLevel.slice(1)} Confidence
            </span>
        );
    };

    return (
        <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-800">Target Relevance</h4>
                <div className="flex gap-2">
                    {getPrimaryTargetBadge()}
                    {getConfidenceBadge()}
                </div>
            </div>

            <div className="space-y-3">
                {/* SME Relevance */}
                {relevance.sme_score !== undefined && (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-600">SME Relevance</span>
                            <span className={`text-xs font-bold ${getScoreTextColor(relevance.sme_score)}`}>
                                {relevance.sme_score}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getScoreColor(relevance.sme_score)}`}
                                style={{ width: `${relevance.sme_score}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Enterprise Relevance */}
                {relevance.enterprise_score !== undefined && (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-600">Enterprise Relevance</span>
                            <span className={`text-xs font-bold ${getScoreTextColor(relevance.enterprise_score)}`}>
                                {relevance.enterprise_score}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getScoreColor(relevance.enterprise_score)}`}
                                style={{ width: `${relevance.enterprise_score}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Explanation */}
            {relevance.sme_score !== undefined && relevance.enterprise_score !== undefined && (
                <div className="mt-3 p-2 bg-white bg-opacity-60 rounded text-xs text-gray-600">
                    <span className="font-medium">Analysis:</span> This page content shows{' '}
                    <span className="font-medium">
                        {relevance.sme_score > relevance.enterprise_score ? 'stronger alignment with SME' : 
                         relevance.enterprise_score > relevance.sme_score ? 'stronger alignment with Enterprise' : 
                         'balanced alignment with both'} decision makers
                    </span>
                    {' '}based on messaging, tone, and content characteristics.
                </div>
            )}
        </div>
    );
};

/**
 * Render individual persona relevance item with match/mismatch points
 */
const renderPersonaRelevanceItem = (item: PersonaRelevanceItem, index: number) => {
    const getScoreColor = (score: number): string => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getScoreTextColor = (score: number): string => {
        if (score >= 80) return 'text-green-700';
        if (score >= 60) return 'text-yellow-700';
        if (score >= 40) return 'text-orange-700';
        return 'text-red-700';
    };

    const getConfidenceColor = (level: string): string => {
        if (level === 'high') return 'bg-green-100 text-green-800';
        if (level === 'medium') return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const colors = [
        'bg-blue-50 border-blue-200',
        'bg-purple-50 border-purple-200',
        'bg-green-50 border-green-200',
        'bg-orange-50 border-orange-200',
    ];
    const bgColor = colors[index % colors.length];

    return (
        <div key={item.persona_id} className={`${bgColor} border rounded-lg p-4 mb-3`}>
            <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold text-gray-800">{item.persona_name}</h5>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${getScoreTextColor(item.relevance_score)}`}>
                        {item.relevance_score}%
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(item.confidence_level)}`}>
                        {item.confidence_level.charAt(0).toUpperCase() + item.confidence_level.slice(1)}
                    </span>
                </div>
            </div>

            {/* Relevance Score Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getScoreColor(item.relevance_score)}`}
                    style={{ width: `${item.relevance_score}%` }}
                />
            </div>

            {/* Match Points */}
            {item.match_points.length > 0 && (
                <div className="mb-2">
                    <div className="flex items-center gap-1 mb-1">
                        <CheckCircle2 size={12} className="text-green-600" />
                        <span className="text-xs font-medium text-gray-700">Matches:</span>
                    </div>
                    <ul className="ml-5 space-y-1">
                        {item.match_points.map((point, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Mismatch Points */}
            {item.mismatch_points.length > 0 && (
                <div>
                    <div className="flex items-center gap-1 mb-1">
                        <XCircle size={12} className="text-red-600" />
                        <span className="text-xs font-medium text-gray-700">Doesn't match:</span>
                    </div>
                    <ul className="ml-5 space-y-1">
                        {item.mismatch_points.map((point, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                <span className="text-red-600 mt-0.5">•</span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

/**
 * Display multiple persona relevance (for trailmap personas)
 */
export const MultiPersonaRelevanceDisplay: React.FC<{
    personaRelevance: PersonaRelevanceItem[];
    className?: string;
}> = ({ personaRelevance, className = '' }) => {
    if (!personaRelevance || personaRelevance.length === 0) {
        return null;
    }

    return (
        <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 ${className}`}>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Persona Relevance</h4>
            <div className="space-y-2">
                {personaRelevance.map((item, index) => renderPersonaRelevanceItem(item, index))}
            </div>
        </div>
    );
};

export default PersonaRelevanceDisplay;