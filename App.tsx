
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  PetType, 
  EvolutionStage, 
  GameState, 
  PetStats 
} from './types';
import { 
  SAVE_KEY, 
  INITIAL_ACHIEVEMENTS, 
  XP_PER_LEVEL, 
  TICK_RATE_MS, 
  STAT_DECAY,
  STAGE_THRESHOLDS 
} from './constants';
import PetVisual from './components/PetVisual';
import StatsBar from './components/StatsBar';
import { getPetWhispererMessage } from './services/geminiService';
import { 
  Heart, 
  Utensils, 
  Gamepad2, 
  Moon, 
  Trophy, 
  Sparkles,
  MessageCircle,
  RefreshCw,
  Plus
} from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      petName: '',
      petType: PetType.FIRE,
      stage: EvolutionStage.EGG,
      level: 1,
      xp: 0,
      stats: { hunger: 100, happiness: 100, energy: 100 },
      achievements: INITIAL_ACHIEVEMENTS,
      lastTick: Date.now(),
      adopted: false,
    };
  });

  const [whisper, setWhisper] = useState<string>('');
  const [isWhispering, setIsWhispering] = useState(false);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const lastEvolvedStage = useRef(gameState.stage);

  // Persistence
  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // Main Game Tick (Stat Decay)
  useEffect(() => {
    if (!gameState.adopted) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const newHunger = Math.max(0, prev.stats.hunger - STAT_DECAY.hunger);
        const newEnergy = Math.max(0, prev.stats.energy - STAT_DECAY.energy);
        // Happiness decays faster if hunger/energy are low
        const happinessModifier = (newHunger < 20 || newEnergy < 20) ? 2 : 1;
        const newHappiness = Math.max(0, prev.stats.happiness - (STAT_DECAY.happiness * happinessModifier));

        return {
          ...prev,
          stats: {
            hunger: newHunger,
            energy: newEnergy,
            happiness: newHappiness
          },
          lastTick: Date.now()
        };
      });
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, [gameState.adopted]);

  // Level & Evolution Check
  useEffect(() => {
    if (!gameState.adopted) return;

    let newStage = gameState.stage;
    const { level } = gameState;

    if (level >= STAGE_THRESHOLDS[EvolutionStage.LEGENDARY]) newStage = EvolutionStage.LEGENDARY;
    else if (level >= STAGE_THRESHOLDS[EvolutionStage.ADULT]) newStage = EvolutionStage.ADULT;
    else if (level >= STAGE_THRESHOLDS[EvolutionStage.TEEN]) newStage = EvolutionStage.TEEN;
    else if (level >= STAGE_THRESHOLDS[EvolutionStage.BABY]) newStage = EvolutionStage.BABY;

    if (newStage !== gameState.stage) {
      setGameState(prev => ({ ...prev, stage: newStage }));
      setShowEvolutionModal(true);
      unlockAchievement('evolution_baby'); // Example unlock trigger
      if (newStage === EvolutionStage.LEGENDARY) unlockAchievement('legendary');
    }

    if (level >= 10) unlockAchievement('level_10');
    if (gameState.stats.happiness >= 100) unlockAchievement('happy_pet');

  }, [gameState.level, gameState.stats.happiness]);

  const addXP = (amount: number) => {
    setGameState(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      while (newXP >= XP_PER_LEVEL) {
        newXP -= XP_PER_LEVEL;
        newLevel += 1;
      }
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const unlockAchievement = (id: string) => {
    setGameState(prev => ({
      ...prev,
      achievements: prev.achievements.map(a => a.id === id ? { ...a, unlocked: true } : a)
    }));
  };

  const handleFeed = () => {
    setGameState(prev => ({
      ...prev,
      stats: { ...prev.stats, hunger: Math.min(100, prev.stats.hunger + 25) }
    }));
    addXP(10);
    unlockAchievement('first_meal');
  };

  const handlePlay = () => {
    if (gameState.stats.energy < 15) return;
    setGameState(prev => ({
      ...prev,
      stats: { 
        ...prev.stats, 
        happiness: Math.min(100, prev.stats.happiness + 20),
        energy: Math.max(0, prev.stats.energy - 15)
      }
    }));
    addXP(15);
  };

  const handleRest = () => {
    setGameState(prev => ({
      ...prev,
      stats: { 
        ...prev.stats, 
        energy: Math.min(100, prev.stats.energy + 30),
        hunger: Math.max(0, prev.stats.hunger - 5)
      }
    }));
    addXP(5);
  };

  const handleAdopt = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState.petName.trim()) {
      setGameState(prev => ({ ...prev, adopted: true }));
    }
  };

  const handleWhisperer = async () => {
    setIsWhispering(true);
    const msg = await getPetWhispererMessage(gameState);
    setWhisper(msg);
    setIsWhispering(false);
  };

  const resetGame = () => {
    if (confirm("Reset everything? Your cute pet will go to pet heaven!")) {
      localStorage.removeItem(SAVE_KEY);
      window.location.reload();
    }
  };

  if (!gameState.adopted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <Sparkles className="mx-auto w-16 h-16 text-pink-400 mb-4 animate-pulse" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">EvoPet</h1>
          <p className="text-gray-500 mb-8">Begin your journey with a mystical egg.</p>
          
          <form onSubmit={handleAdopt} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name your companion</label>
              <input 
                type="text" 
                value={gameState.petName}
                onChange={e => setGameState(prev => ({ ...prev, petName: e.target.value }))}
                placeholder="e.g. Bubbles, Sparky..."
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-300 outline-none transition-all text-center text-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Choose an element</label>
              <div className="grid grid-cols-3 gap-3">
                {[PetType.FIRE, PetType.WATER, PetType.NATURE].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setGameState(prev => ({ ...prev, petType: type }))}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      gameState.petType === type 
                        ? 'border-pink-400 bg-pink-50 text-pink-600 scale-105' 
                        : 'border-gray-100 text-gray-400 hover:border-pink-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-pink-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5 fill-current" />
              Adopt Pet
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {gameState.petName} <span className="text-pink-400">Lv.{gameState.level}</span>
          </h2>
          <p className="text-gray-500 font-medium">Stage: {gameState.stage}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={resetGame}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Reset Game"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Pet Display Card */}
        <div className="md:col-span-7 bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-32 h-32" />
          </div>
          
          <PetVisual 
            stage={gameState.stage} 
            type={gameState.petType} 
            happiness={gameState.stats.happiness} 
          />

          {whisper && (
            <div className="mt-6 bg-pink-50 border border-pink-100 rounded-2xl p-4 text-pink-700 italic text-center relative max-w-sm">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-pink-50 border-t border-l border-pink-100 rotate-45"></div>
              "{whisper}"
            </div>
          )}

          <div className="mt-8 w-full">
            <StatsBar 
              label="Experience" 
              value={gameState.xp} 
              max={XP_PER_LEVEL} 
              colorClass="bg-indigo-400" 
              icon="⭐"
            />
          </div>

          <div className="mt-4 flex gap-4 w-full">
             <button 
                onClick={handleWhisperer}
                disabled={isWhispering}
                className="flex-1 bg-indigo-100 text-indigo-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-200 transition-all disabled:opacity-50"
              >
                <MessageCircle className={`w-5 h-5 ${isWhispering ? 'animate-spin' : ''}`} />
                {isWhispering ? 'Listening...' : 'Whisperer'}
              </button>
          </div>
        </div>

        {/* Stats & Controls Card */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-400" /> Stats & Wellbeing
            </h3>
            <StatsBar label="Hunger" value={gameState.stats.hunger} max={100} colorClass="bg-amber-400" icon="🍕" />
            <StatsBar label="Happiness" value={gameState.stats.happiness} max={100} colorClass="bg-pink-400" icon="💖" />
            <StatsBar label="Energy" value={gameState.stats.energy} max={100} colorClass="bg-blue-400" icon="⚡" />
            
            <div className="grid grid-cols-3 gap-3 mt-8">
              <button 
                onClick={handleFeed}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all border border-amber-100"
              >
                <Utensils className="w-6 h-6" />
                <span className="text-xs font-bold">Feed</span>
              </button>
              <button 
                onClick={handlePlay}
                disabled={gameState.stats.energy < 15}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-all border border-pink-100 disabled:opacity-50"
              >
                <Gamepad2 className="w-6 h-6" />
                <span className="text-xs font-bold">Play</span>
              </button>
              <button 
                onClick={handleRest}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-100"
              >
                <Moon className="w-6 h-6" />
                <span className="text-xs font-bold">Rest</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 flex-1">
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> Achievements
            </h3>
            <div className="space-y-3">
              {gameState.achievements.map(ach => (
                <div 
                  key={ach.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    ach.unlocked ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
                  }`}
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <div>
                    <h4 className={`text-sm font-bold ${ach.unlocked ? 'text-green-800' : 'text-gray-600'}`}>
                      {ach.title}
                    </h4>
                    <p className="text-xs text-gray-500">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evolution Modal */}
      {showEvolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <Sparkles className="mx-auto w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Evolution!</h2>
            <p className="text-gray-600 mb-6">
              {gameState.petName} has grown into a <strong>{gameState.stage}</strong>!
            </p>
            <button 
              onClick={() => setShowEvolutionModal(false)}
              className="w-full bg-pink-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-pink-600 transition-all"
            >
              Wonderful!
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-12 text-center text-gray-400 text-sm">
        <p>EvoPet: Idle Companion • Stats decay while you rest</p>
      </div>
    </div>
  );
};

export default App;
