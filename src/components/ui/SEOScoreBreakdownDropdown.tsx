import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';

interface SEOScoreCategory {
    score: number;
    maxScore: number;
    details: Record<string, { points: number; maxPoints: number; passed: boolean | number }>;
}

interface SEOScoreBreakdown {
    metaTags: SEOScoreCategory;
    contentQuality: SEOScoreCategory;
    technical: SEOScoreCategory;
}

interface SEOScoreBreakdownDropdownProps {
    score: number;
    breakdown?: {
        totalScore: number;
        breakdown: SEOScoreBreakdown;
        grade: string;
    } | null;
}

// Human-readable names for the scoring factors
const factorLabels: Record<string, string> = {
    has_meta_title: 'Has Meta Title',
    has_title: 'Has Title Tag',
    has_description: 'Has Meta Description',
    title_not_too_long: 'Title Not Too Long',
    title_not_too_short: 'Title Not Too Short',
    title_length_optimal: 'Optimal Title Length',
    title_consistency: 'Title-Content Consistency',
    description_consistency: 'Description-Content Consistency',
    adequate_content_rate: 'Adequate Content Rate',
    not_excessive_content: 'Not Excessive Content',
    adequate_character_count: 'Adequate Character Count',
    no_duplicate_title: 'No Duplicate Title',
    no_duplicate_description: 'No Duplicate Description',
    no_duplicate_content: 'No Duplicate Content',
    has_h1_tag: 'Has H1 Tag',
    relevant_title: 'Relevant Title',
    relevant_description: 'Relevant Description',
};

const categoryLabels: Record<string, { name: string; color: string; bgColor: string }> = {
    metaTags: { name: 'Meta Tags', color: 'text-blue-700', bgColor: 'bg-blue-50' },
    contentQuality: { name: 'Content Quality', color: 'text-green-700', bgColor: 'bg-green-50' },
    technical: { name: 'Technical SEO', color: 'text-purple-700', bgColor: 'bg-purple-50' },
};

interface DetailItem {
    category: string;
    key: string;
    name: string;
    points: number;
    maxPoints: number;
    passed: boolean | number;
}

const SEOScoreBreakdownDropdown: React.FC<SEOScoreBreakdownDropdownProps> = ({ score, breakdown }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Flatten and sort all details by max points (highest first)
    const getAllDetails = (): DetailItem[] => {
        if (!breakdown?.breakdown) return [];

        const allDetails: DetailItem[] = [];

        Object.entries(breakdown.breakdown).forEach(([categoryKey, category]) => {
            Object.entries(category.details as Record<string, { points: number; maxPoints: number; passed: boolean | number }>).forEach(([detailKey, detail]) => {
                allDetails.push({
                    category: categoryKey,
                    key: detailKey,
                    name: factorLabels[detailKey] || detailKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    points: detail.points,
                    maxPoints: detail.maxPoints,
                    passed: detail.passed,
                });
            });
        });

        // Sort by maxPoints descending
        return allDetails.sort((a, b) => b.maxPoints - a.maxPoints);
    };

    const getScoreColor = (points: number, maxPoints: number) => {
        const ratio = points / maxPoints;
        if (ratio >= 1) return 'text-green-600';
        if (ratio >= 0.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPassedIcon = (passed: boolean | number) => {
        if (typeof passed === 'boolean') {
            return passed ? (
                <Check size={12} className="text-green-600" />
            ) : (
                <X size={12} className="text-red-600" />
            );
        }
        // For consistency scores (0-1 range)
        const value = passed * 100;
        if (value >= 70) return <Check size={12} className="text-green-600" />;
        if (value >= 40) return <span className="text-yellow-600 text-xs font-medium">{Math.round(value)}%</span>;
        return <X size={12} className="text-red-600" />;
    };

    const hasBreakdown = breakdown?.breakdown;

    return (
        <div className="w-full">
            {/* Score header - clickable to expand */}
            <div className="flex justify-between text-sm mb-1">
                <button
                    onClick={() => hasBreakdown && setIsOpen(!isOpen)}
                    className={`flex items-center gap-1 ${hasBreakdown ? 'cursor-pointer hover:text-blue-600' : ''}`}
                    disabled={!hasBreakdown}
                >
                    <span className="group relative cursor-help">
                        SEO Score
                        <span className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-72 p-2 bg-gray-900 text-white text-xs rounded-lg z-50">
                            <span className="block font-semibold text-blue-400 mb-1">📊 Source: DataForSEO</span>
                            <span className="block mb-1">Analyzes meta tags, content quality, and technical SEO.</span>
                            <span className="block text-gray-400 text-[10px]">Formula: Meta Tags (40%) + Content Quality (40%) + Technical (20%)</span>
                            {hasBreakdown && <span className="block mt-1 text-blue-300">Click to see detailed breakdown.</span>}
                        </span>
                    </span>
                    {hasBreakdown && (
                        isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />
                    )}
                </button>
                <div className="flex items-center gap-2">
                    <span className="font-medium">{score}%</span>
                    {breakdown?.grade && (
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${breakdown.grade === 'A' ? 'bg-green-100 text-green-700' :
                            breakdown.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                breakdown.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {breakdown.grade}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${score}%` }} />
            </div>

            {/* Expandable breakdown section */}
            {isOpen && hasBreakdown && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    {/* Category summary row */}
                    <div className="flex flex-wrap gap-2 mb-3 pb-2 border-b border-gray-200">
                        {Object.entries(breakdown.breakdown).map(([key, cat]) => (
                            <span key={key} className={`${categoryLabels[key]?.bgColor} ${categoryLabels[key]?.color} px-2 py-0.5 rounded text-xs font-medium`}>
                                {categoryLabels[key]?.name}: {cat.score}/{cat.maxScore}
                            </span>
                        ))}
                    </div>

                    {/* Individual factors */}
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {getAllDetails().map((item) => (
                            <div
                                key={`${item.category}-${item.key}`}
                                className={`flex items-center justify-between p-1.5 rounded ${categoryLabels[item.category]?.bgColor}`}
                            >
                                <div className="flex items-center gap-2">
                                    {getPassedIcon(item.passed)}
                                    <span className="text-xs text-gray-700">{item.name}</span>
                                </div>
                                <span className={`text-xs font-medium ${getScoreColor(item.points, item.maxPoints)}`}>
                                    {item.points}/{item.maxPoints}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SEOScoreBreakdownDropdown;
