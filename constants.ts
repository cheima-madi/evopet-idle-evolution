
import { Achievement, EvolutionStage } from './types';

export const XP_PER_LEVEL = 100;
export const TICK_RATE_MS = 5000; // Stat decay every 5 seconds
export const SAVE_KEY = 'evopet_game_state_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_meal', title: 'First Meal', description: 'Fed your pet for the first time.', unlocked: false, icon: '🍕' },
  { id: 'happy_pet', title: 'Joyful Heart', description: 'Reach 100% happiness.', unlocked: false, icon: '💖' },
  { id: 'evolution_baby', title: 'Hatched!', description: 'Evolved into a Baby pet.', unlocked: false, icon: '🐣' },
  { id: 'level_10', title: 'Experienced Owner', description: 'Reached Level 10.', unlocked: false, icon: '⭐' },
  { id: 'legendary', title: 'Mythical Bond', description: 'Evolved into the Legendary stage.', unlocked: false, icon: '👑' },
];

export const STAGE_THRESHOLDS = {
  [EvolutionStage.EGG]: 1,
  [EvolutionStage.BABY]: 5,
  [EvolutionStage.TEEN]: 15,
  [EvolutionStage.ADULT]: 30,
  [EvolutionStage.LEGENDARY]: 50,
};

export const STAT_DECAY = {
  hunger: 0.5,
  happiness: 0.3,
  energy: 0.2,
};
