import { useState } from 'react';
import { RewardTier, rewardTiers } from '../utils/rewards';

export const useRewardSystem = () => {
  const [lastReward, setLastReward] = useState<RewardTier | null>(null);
  const [rewardHistory, setRewardHistory] = useState<RewardTier[]>([]);

  const triggerReward = (): RewardTier => {
    const random = Math.random();
    let probabilitySum = 0;
    
    // Apply pity system - increase chances for higher tiers based on history
    const pityMultiplier = calculatePityMultiplier(rewardHistory);
    
    for (const tier of rewardTiers) {
      probabilitySum += tier.chance * pityMultiplier;
      if (random <= probabilitySum) {
        const reward = { ...tier };
        setLastReward(reward);
        setRewardHistory(prev => [...prev, reward]);
        return reward;
      }
    }
    
    // Fallback to common reward
    const defaultReward = { ...rewardTiers[0] };
    setLastReward(defaultReward);
    setRewardHistory(prev => [...prev, defaultReward]);
    return defaultReward;
  };

  const calculatePityMultiplier = (history: RewardTier[]): number => {
    if (history.length < 10) return 1;
    
    // Count consecutive non-legendary rewards
    let consecutiveNonLegendary = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].tier !== 'Legendary') {
        consecutiveNonLegendary++;
      } else {
        break;
      }
    }
    
    // Increase chances after every 10 non-legendary rewards
    return 1 + Math.floor(consecutiveNonLegendary / 10) * 0.1;
  };

  return {
    triggerReward,
    lastReward,
    rewardHistory
  };
};