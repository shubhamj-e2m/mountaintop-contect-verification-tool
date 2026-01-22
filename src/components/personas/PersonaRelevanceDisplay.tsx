import React from 'react';
import type { CustomerPersona, EnhancedCustomerPersona } from '../../types/project';

interface PersonaRelevanceDisplayProps {
    persona: EnhancedCustomerPersona;
    className?: string;
}

const PersonaRelevanceDisplay: React.FC<PersonaRelevanceDisplayProps> = ({ 
    persona, 
    className = '' 
}) => {
    const relevance = persona.target_relevance;

    if (!relevance) {
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[relevance.primary_target]}`}>
                {labels[relevance.primary_target]}
            </span>
        );
    };

    const getConfidenceBadge = () => {
        const colors = {
            high: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[relevance.confidence_level]}`}>
                {relevance.confidence_level.charAt(0).toUpperCase() + relevance.confidence_level.slice(1)} Confidence
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

                {/* Enterprise Relevance */}
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
            </div>

            {/* Explanation */}
            <div className="mt-3 p-2 bg-white bg-opacity-60 rounded text-xs text-gray-600">
                <span className="font-medium">Analysis:</span> This page content shows{' '}
                <span className="font-medium">
                    {relevance.sme_score > relevance.enterprise_score ? 'stronger alignment with SME' : 
                     relevance.enterprise_score > relevance.sme_score ? 'stronger alignment with Enterprise' : 
                     'balanced alignment with both'} decision makers
                </span>
                {' '}based on messaging, tone, and content characteristics.
            </div>
        </div>
    );
};

export default PersonaRelevanceDisplay;