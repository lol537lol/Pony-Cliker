import { UPGRADE_META } from './state.js';

export function getUpgradeCost(state, id) {
  const meta = UPGRADE_META[id];
  const level = state.upgrades[id] || 0;
  return Math.floor(meta.baseCost * Math.pow(meta.costMultiplier, level));
}

export function getClickPower(state) {
  return state.clickPower + state.upgrades.clickPower * 1.5 + state.level * 0.25;
}

export function getCriticalChance(state) {
  return Math.min(0.86, state.criticalChance + state.upgrades.criticalChance * 0.04);
}

export function getCriticalMultiplier(state) {
  return state.criticalMultiplier + state.upgrades.criticalMultiplier * 0.8;
}

export function getComboMultiplier(state) {
  const comboBonus = Math.min(state.combo, 30) * 0.06;
  return 1 + comboBonus + state.upgrades.comboPower * 0.18;
}

export function getAutoIncome(state) {
  return state.upgrades.autoClicker * 1.2;
}

export function purchaseUpgrade(state, id) {
  const meta = UPGRADE_META[id];
  const level = state.upgrades[id] || 0;
  if (level >= meta.maxLevel) return false;

  const cost = getUpgradeCost(state, id);
  if (state.coins < cost) return false;

  state.coins -= cost;
  state.upgrades[id] += 1;
  state.statistics.totalUpgrades += 1;

  if (id === 'clickPower') state.clickPower += meta.effect;
  if (id === 'criticalChance') state.criticalChance += meta.effect;
  if (id === 'criticalMultiplier') state.criticalMultiplier += meta.effect;

  return true;
}
