
import React from 'react';

interface StatsBarProps {
  label: string;
  value: number;
  max: number;
  colorClass: string;
  icon?: string;
}

const StatsBar: React.FC<StatsBarProps> = ({ label, value, max, colorClass, icon }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="w-full mb-3">
      <div className="flex justify-between items-center mb-1 text-sm font-semibold text-gray-600">
        <div className="flex items-center gap-1">
          {icon && <span>{icon}</span>}
          <span>{label}</span>
        </div>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`h-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        >
          <div className="w-full h-full shimmer opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
