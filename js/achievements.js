import { ACHIEVEMENTS } from './state.js';

export function evaluateAchievements(state) {
  let unlockedCount = 0;
  ACHIEVEMENTS.forEach((achievement) => {
    if (state.achievements[achievement.id]) {
      unlockedCount += 1;
      return;
    }

    if (achievement.check(state)) {
      state.achievements[achievement.id] = { unlockedAt: Date.now() };
      unlockedCount += 1;
    }
  });

  state.statistics.achievementsUnlocked = unlockedCount;
  return unlockedCount;
}
