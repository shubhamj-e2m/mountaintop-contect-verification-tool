import React from 'react';

interface ScoreWeight {
  name: string;
  weight: number;
  score?: number;
  color?: string;
}

interface ScoreTooltipProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  weights: ScoreWeight[];
  totalScore: number;
  className?: string;
}

const ScoreTooltip: React.FC<ScoreTooltipProps> = ({
  children,
  title,
  description,
  weights,
  totalScore,
  className = '',
}) => {
  const formatWeight = (weight: number) => `${(weight * 100).toFixed(0)}%`;
  
  const getWeightedScore = (score: number | undefined, weight: number) => {
    if (score === undefined) return 0;
    return score * weight;
  };

  return (
    <div className={`group relative cursor-help ${className}`}>
      {children}
      <div className="invisible group-hover:visible absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg z-50 shadow-lg">
        {/* Header */}
        <div className="mb-2">
          <span className="block font-semibold text-blue-400 mb-1">📊 {title}</span>
          {description && (
            <span className="block text-gray-300 mb-2">{description}</span>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Score:</span>
            <span className="font-bold text-white">{totalScore}%</span>
          </div>
        </div>

        {/* Weights breakdown */}
        <div className="border-t border-gray-700 pt-2">
          <span className="block font-medium text-gray-300 mb-2">Weight Distribution:</span>
          <div className="space-y-1">
            {weights.map((item, index) => (
              <div key={index} className="text-[10px]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    {item.color && (
                      <div 
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-medium text-white">{formatWeight(item.weight)}</span>
                </div>
                {item.score !== undefined && (
                  <div className="text-gray-400 text-right mt-0.5">
                    {item.score}% × {formatWeight(item.weight)} = {getWeightedScore(item.score, item.weight).toFixed(1)} pts
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formula hint */}
        <div className="border-t border-gray-700 pt-1.5 mt-1.5">
          <span className="text-gray-500 text-[9px]">
            Formula: Σ(Score × Weight) for each component
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoreTooltip;