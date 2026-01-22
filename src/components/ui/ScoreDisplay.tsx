import React from 'react';
import ScoreTooltip from './ScoreTooltip';

interface ScoreWeight {
    name: string;
    weight: number;
    score?: number;
    color?: string;
}

interface ScoreDisplayProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    tooltipTitle?: string;
    tooltipDescription?: string;
    weights?: ScoreWeight[];
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
    score, 
    size = 'md', 
    showLabel = false,
    tooltipTitle,
    tooltipDescription,
    weights
}) => {
    const getColor = () => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStrokeColor = () => {
        if (score >= 80) return 'stroke-green-500';
        if (score >= 60) return 'stroke-yellow-500';
        return 'stroke-red-500';
    };

    const sizes = {
        sm: { container: 'w-10 h-10', text: 'text-xs', stroke: 3 },
        md: { container: 'w-16 h-16', text: 'text-sm', stroke: 4 },
        lg: { container: 'w-24 h-24', text: 'text-xl', stroke: 5 },
    };

    const { container, text, stroke } = sizes[size];
    const radius = 50 - stroke;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const scoreDisplay = (
        <div className="flex flex-col items-center">
            <div className={`relative ${container}`}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={stroke}
                        className="text-gray-200"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        strokeWidth={stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={getStrokeColor()}
                    />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center font-bold ${text} ${getColor()}`}>
                    {score}%
                </span>
            </div>
            {showLabel && <span className="mt-1 text-xs text-gray-500">Score</span>}
        </div>
    );

    // If we have tooltip data, wrap with ScoreTooltip
    if (tooltipTitle && weights && weights.length > 0) {
        return (
            <ScoreTooltip
                title={tooltipTitle}
                description={tooltipDescription}
                weights={weights}
                totalScore={score}
            >
                {scoreDisplay}
            </ScoreTooltip>
        );
    }

    return scoreDisplay;
};

export default ScoreDisplay;
