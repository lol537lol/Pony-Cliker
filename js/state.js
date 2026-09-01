const STORAGE_KEY = 'pony-clicker-save-v1';
const COMBO_TIMEOUT_MS = 1600;
const AUTOSAVE_INTERVAL_MS = 5000;

export const UPGRADE_META = {
  clickPower: {
    id: 'clickPower',
    name: 'Click Power',
    description: 'Increases the base coin gain from each click.',
    baseCost: 15,
    costMultiplier: 1.42,
    effect: 1,
    maxLevel: 100
  },
  criticalChance: {
    id: 'criticalChance',
    name: 'Critical Chance',
    description: 'Raises the chance of landing a critical hit.',
    baseCost: 30,
    costMultiplier: 1.62,
    effect: 0.02,
    maxLevel: 100
  },
  criticalMultiplier: {
    id: 'criticalMultiplier',
    name: 'Critical Multiplier',
    description: 'Improves the reward from critical hits.',
    baseCost: 50,
    costMultiplier: 1.7,
    effect: 0.4,
    maxLevel: 100
  },
  comboPower: {
    id: 'comboPower',
    name: 'Combo Power',
    description: 'Boosts your combo reward multiplier.',
    baseCost: 45,
    costMultiplier: 1.72,
    effect: 0.12,
    maxLevel: 100
  },
  autoClicker: {
    id: 'autoClicker',
    name: 'Pony Helper',
    description: 'Generates automatic coins every second.',
    baseCost: 60,
    costMultiplier: 1.85,
    effect: 1,
    maxLevel: 100
  }
};

export const ACHIEVEMENTS = [
  { id: 'first_coin', name: 'First Coin', icon: '🪙', description: 'Earn your first coin.', check: (state) => state.totalCoins >= 1 },
  { id: 'first_click', name: 'First Click', icon: '✨', description: 'Click the pony once.', check: (state) => state.statistics.totalClicks >= 1 },
  { id: 'coin_100', name: '100 Coins', icon: '💰', description: 'Reach 100 total coins.', check: (state) => state.totalCoins >= 100 },
  { id: 'coin_1000', name: '1,000 Coins', icon: '🌟', description: 'Reach 1,000 total coins.', check: (state) => state.totalCoins >= 1000 },
  { id: 'coin_10000', name: '10,000 Coins', icon: '🏆', description: 'Reach 10,000 total coins.', check: (state) => state.totalCoins >= 10000 },
  { id: 'click_master', name: 'Click Master', icon: '🖱️', description: 'Reach 500 clicks.', check: (state) => state.statistics.totalClicks >= 500 },
  { id: 'critical_master', name: 'Critical Master', icon: '💥', description: 'Land 25 critical hits.', check: (state) => state.statistics.criticalClicks >= 25 },
  { id: 'combo_master', name: 'Combo Master', icon: '⚡', description: 'Reach a max combo of 25.', check: (state) => state.statistics.maxCombo >= 25 },
  { id: 'millionaire', name: 'Millionaire', icon: '👑', description: 'Reach 1,000,000 total coins.', check: (state) => state.totalCoins >= 1000000 },
  { id: 'collector', name: 'Collector', icon: '🧺', description: 'Unlock every achievement badge.', check: (state) => Object.keys(state.achievements).length >= ACHIEVEMENTS.length },
  { id: 'easter_egg', name: 'Easter Egg', icon: '🐾', description: 'Discover the hidden pony secret.', check: (state) => Boolean(state.achievements.easter_egg) }
];

export function createDefaultState() {
  return {
    saveVersion: 1,
    coins: 0,
    totalCoins: 0,
    level: 1,
    xp: 0,
    xpRequired: 100,
    clickPower: 1,
    criticalChance: 0.08,
    criticalMultiplier: 2.5,
    combo: 0,
    maxCombo: 0,
    lastClickAt: 0,
    upgrades: {
      clickPower: 0,
      criticalChance: 0,
      criticalMultiplier: 0,
      comboPower: 0,
      autoClicker: 0
    },
    achievements: {},
    statistics: {
      totalClicks: 0,
      totalCoins: 0,
      sessionCoins: 0,
      criticalClicks: 0,
      maxCombo: 0,
      playTime: 0,
      totalUpgrades: 0,
      autoIncome: 0,
      highestLevel: 1,
      achievementsUnlocked: 0
    },
    settings: {
      sound: true,
      animations: true,
      particles: true,
      reducedMotion: false,
      autosave: true
    }
  };
}

export function safeNumber(value, defaultValue = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();

    const parsed = JSON.parse(raw);
    const fallback = createDefaultState();
    return {
      ...fallback,
      ...parsed,
      settings: { ...fallback.settings, ...(parsed.settings || {}) },
      upgrades: { ...fallback.upgrades, ...(parsed.upgrades || {}) },
      achievements: parsed.achievements || {},
      statistics: { ...fallback.statistics, ...(parsed.statistics || {}) }
    };
  } catch (error) {
    return createDefaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      saveVersion: 1,
      coins: safeNumber(state.coins),
      totalCoins: safeNumber(state.totalCoins),
      level: safeNumber(state.level, 1),
      xp: safeNumber(state.xp),
      xpRequired: safeNumber(state.xpRequired, 100),
      clickPower: safeNumber(state.clickPower, 1),
      criticalChance: safeNumber(state.criticalChance, 0.08),
      criticalMultiplier: safeNumber(state.criticalMultiplier, 2.5),
      combo: safeNumber(state.combo),
      maxCombo: safeNumber(state.maxCombo),
      lastClickAt: safeNumber(state.lastClickAt),
      upgrades: { ...state.upgrades },
      achievements: { ...state.achievements },
      statistics: { ...state.statistics },
      settings: { ...state.settings }
    }));
  } catch (error) {
    console.warn('Save failed:', error);
  }
}

export { STORAGE_KEY, COMBO_TIMEOUT_MS, AUTOSAVE_INTERVAL_MS };
