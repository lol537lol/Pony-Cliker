import { COMBO_TIMEOUT_MS } from './state.js';
import { getClickPower, getComboMultiplier, getCriticalChance, getCriticalMultiplier } from './upgrades.js';
import { createBurstParticles, createFloatingText } from './ui.js';

export function handlePonyClick(state, ponyButton, floatingLayer, callback) {
  const now = Date.now();
  state.statistics.totalClicks += 1;
  state.lastClickAt = now;

  if (state.combo > 0 && now - state.lastClickAt <= COMBO_TIMEOUT_MS) {
    state.combo += 1;
  } else {
    state.combo = 1;
  }

  state.maxCombo = Math.max(state.maxCombo, state.combo);
  state.statistics.maxCombo = Math.max(state.statistics.maxCombo, state.combo);

  const critical = Math.random() < getCriticalChance(state);
  const baseReward = Math.max(1, getClickPower(state));
  const comboMultiplier = getComboMultiplier(state);
  const reward = Math.round(baseReward * comboMultiplier * (critical ? getCriticalMultiplier(state) : 1));

  state.coins += reward;
  state.totalCoins += reward;
  state.statistics.sessionCoins += reward;
  state.statistics.totalCoins += reward;
  state.statistics.criticalClicks += critical ? 1 : 0;

  if (critical) {
    createBurstParticles(floatingLayer);
    createFloatingText(floatingLayer, `CRITICAL +${reward}`, 'critical', 50, 50);
    ponyButton.classList.add('critical');
    setTimeout(() => ponyButton.classList.remove('critical'), 180);
  } else {
    createFloatingText(floatingLayer, `+${reward}`, 'coin', 50, 50);
  }

  if (state.combo > 1) {
    createFloatingText(floatingLayer, `COMBO x${state.combo}`, 'combo', 50, 38);
  }

  ponyButton.classList.add('pressed');
  setTimeout(() => ponyButton.classList.remove('pressed'), 120);

  if (typeof callback === 'function') callback({ reward, critical });
  return reward;
}
