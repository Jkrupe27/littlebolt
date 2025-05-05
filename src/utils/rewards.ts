export interface RewardTier {
  tier: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  chance: number;
  fx: string;
  reward: {
    type: 'points' | 'multiplier' | 'powerBoost' | 'cosmeticUnlock';
    value?: number;
    id?: string;
  };
  flavor: string;
}

export const rewardTiers: RewardTier[] = [
  {
    tier: 'Common',
    chance: 0.60,
    fx: 'subtleParticles',
    reward: { type: 'points', value: 100 },
    flavor: 'A glimmer of stardust!'
  },
  {
    tier: 'Rare',
    chance: 0.25,
    fx: 'blueGlowTrail',
    reward: { type: 'multiplier', value: 1.5 },
    flavor: 'Cosmic boost unlocked!'
  },
  {
    tier: 'Epic',
    chance: 0.10,
    fx: 'purplePulse',
    reward: { type: 'powerBoost', id: 'precisionBoost' },
    flavor: 'Pulse of precision flows through you!'
  },
  {
    tier: 'Legendary',
    chance: 0.05,
    fx: 'goldenFlash',
    reward: { type: 'cosmeticUnlock', id: 'goldenBoltSkin' },
    flavor: 'The Glizzy Gods smile... Legendary Unlocked!'
  }
];