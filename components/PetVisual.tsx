
import React from 'react';
import { EvolutionStage, PetType } from '../types';

interface PetVisualProps {
  stage: EvolutionStage;
  type: PetType;
  happiness: number;
}

const PetVisual: React.FC<PetVisualProps> = ({ stage, type, happiness }) => {
  const getColor = () => {
    switch (type) {
      case PetType.FIRE: return '#f87171'; // red-400
      case PetType.WATER: return '#60a5fa'; // blue-400
      case PetType.NATURE: return '#4ade80'; // green-400
      default: return '#fbbf24'; // yellow-400
    }
  };

  const getSizing = () => {
    switch (stage) {
      case EvolutionStage.EGG: return 'scale-50';
      case EvolutionStage.BABY: return 'scale-75';
      case EvolutionStage.TEEN: return 'scale-90';
      case EvolutionStage.ADULT: return 'scale-100';
      case EvolutionStage.LEGENDARY: return 'scale-125';
      default: return 'scale-100';
    }
  };

  const isHappy = happiness > 70;

  return (
    <div className={`relative w-48 h-48 flex items-center justify-center transition-all duration-700 ${getSizing()} float-animation`}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        {/* Shadow */}
        <ellipse cx="100" cy="180" rx="40" ry="10" fill="rgba(0,0,0,0.1)" />
        
        {stage === EvolutionStage.EGG ? (
          <path
            d="M100 40C70 40 50 80 50 120C50 160 70 180 100 180C130 180 150 160 150 120C150 80 130 40 100 40Z"
            fill={getColor()}
            stroke="white"
            strokeWidth="4"
          />
        ) : (
          <g>
            {/* Body */}
            <circle cx="100" cy="110" r="60" fill={getColor()} />
            
            {/* Features based on stage */}
            {stage === EvolutionStage.TEEN && (
              <path d="M60 70 L40 40 M140 70 L160 40" stroke={getColor()} strokeWidth="8" strokeLinecap="round" />
            )}
            {stage === EvolutionStage.ADULT && (
              <path d="M70 50 Q100 20 130 50" fill="none" stroke={getColor()} strokeWidth="12" />
            )}
            {stage === EvolutionStage.LEGENDARY && (
              <g>
                <path d="M40 110 Q20 80 40 50 M160 110 Q180 80 160 50" fill="none" stroke="gold" strokeWidth="6" />
                <circle cx="100" cy="40" r="10" fill="gold" className="shimmer" />
              </g>
            )}

            {/* Eyes */}
            <circle cx="80" cy="100" r="6" fill="black" />
            <circle cx="120" cy="100" r="6" fill="black" />
            
            {/* Mouth */}
            {isHappy ? (
              <path d="M85 130 Q100 145 115 130" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
            ) : (
              <line x1="90" y1="135" x2="110" y2="135" stroke="black" strokeWidth="3" strokeLinecap="round" />
            )}
          </g>
        )}
      </svg>
    </div>
  );
};

export default PetVisual;
