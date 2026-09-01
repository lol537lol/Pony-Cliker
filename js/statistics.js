export function updateStatistics(state) {
  state.statistics.playTime += 0.1;
  state.statistics.highestLevel = Math.max(state.statistics.highestLevel, state.level);
}
