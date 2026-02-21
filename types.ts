
export enum PetType {
  FIRE = 'Fire',
  WATER = 'Water',
  NATURE = 'Nature'
}

export enum EvolutionStage {
  EGG = 'Egg',
  BABY = 'Baby',
  TEEN = 'Teen',
  ADULT = 'Adult',
  LEGENDARY = 'Legendary'
}

export interface PetStats {
  hunger: number;
  happiness: number;
  energy: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface GameState {
  petName: string;
  petType: PetType;
  stage: EvolutionStage;
  level: number;
  xp: number;
  stats: PetStats;
  achievements: Achievement[];
  lastTick: number;
  adopted: boolean;
}
