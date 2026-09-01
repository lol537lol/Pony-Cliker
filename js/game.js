import { AUTOSAVE_INTERVAL_MS, COMBO_TIMEOUT_MS, ACHIEVEMENTS, loadState, saveState } from './state.js';
import { bindEvents, bindKeydown } from './events.js';
import { getUpgradeCost, getClickPower, getCriticalChance, getCriticalMultiplier, getComboMultiplier, getAutoIncome, purchaseUpgrade } from './upgrades.js';
import { evaluateAchievements } from './achievements.js';
import { handlePonyClick } from './clicker.js';
import { formatNumber, getXpRequirement, updateComboDisplay } from './ui.js';
import { notify } from './notifications.js';
import { updateStatistics } from './statistics.js';

const state = loadState();
const lastState = { lastAutosave: Date.now() };

const elements = {
  coinDisplay: document.getElementById('coinsDisplay'),
  levelDisplay: document.getElementById('levelDisplay'),
  xpText: document.getElementById('xpText'),
  xpBarFill: document.getElementById('xpBarFill'),
  multiplierDisplay: document.getElementById('multiplierDisplay'),
  upgradesList: document.getElementById('upgradesList'),
  achievementsList: document.getElementById('achievementsList'),
  achievementCount: document.getElementById('achievementCount'),
  statsList: document.getElementById('statsList'),
  collectionList: document.getElementById('collectionList'),
  floatingLayer: document.getElementById('floatingLayer'),
  comboDisplay: document.getElementById('comboDisplay'),
  ponyButton: document.getElementById('ponyButton'),
  settingsButton: document.getElementById('settingsButton'),
  modalRoot: document.getElementById('modalRoot'),
  toastContainer: document.getElementById('toastContainer')
};

function awardXp(amount) {
  state.xp += amount;
  while (state.xp >= state.xpRequired) {
    state.xp -= state.xpRequired;
    state.level += 1;
    state.xpRequired = getXpRequirement(state.level);
    state.statistics.highestLevel = Math.max(state.statistics.highestLevel, state.level);
    notify(elements.toastContainer, `Level Up! You reached level ${state.level}`, 'critical');
  }
}

function renderHUD() {
  elements.coinDisplay.textContent = formatNumber(state.coins);
  elements.levelDisplay.textContent = String(state.level);
  const xpPercent = Math.min(100, (state.xp / state.xpRequired) * 100);
  elements.xpText.textContent = `${formatNumber(state.xp)} / ${formatNumber(state.xpRequired)}`;
  elements.xpBarFill.style.width = `${xpPercent}%`;
  elements.multiplierDisplay.textContent = `x${(getComboMultiplier(state) * (state.clickPower / 1)).toFixed(1)}`;
}

function renderUpgrades() {
  const html = Object.entries({
    clickPower: 'Click Power',
    criticalChance: 'Critical Chance',
    criticalMultiplier: 'Critical Multiplier',
    comboPower: 'Combo Power',
    autoClicker: 'Pony Helper'
  }).map(([key, label]) => {
    const level = state.upgrades[key] || 0;
    const cost = getUpgradeCost(state, key);
    const affordable = state.coins >= cost;
    return `
      <div class="upgrade-item">
        <div>
          <h4>${label} Lv.${level}</h4>
          <p>${key === 'clickPower' ? 'Increase click income.' : key === 'criticalChance' ? 'Increase critical chance.' : key === 'criticalMultiplier' ? 'Increase critical reward.' : key === 'comboPower' ? 'Boost combo reward.' : 'Generate automatic coins.'}</p>
        </div>
        <div class="upgrade-controls">
          <div class="cost-chip">${formatNumber(cost)} coins</div>
          <button class="buy-button ${affordable ? '' : 'disabled'}" data-upgrade="${key}" type="button" ${affordable ? '' : 'disabled'}>Buy</button>
        </div>
      </div>
    `;
  }).join('');

  elements.upgradesList.innerHTML = html;
  elements.upgradesList.querySelectorAll('[data-upgrade]').forEach((button) => {
    button.addEventListener('click', () => {
      const bought = purchaseUpgrade(state, button.dataset.upgrade);
      if (!bought) {
        notify(elements.toastContainer, 'Not enough coins', 'warning');
        return;
      }
      notify(elements.toastContainer, `${button.dataset.upgrade} upgraded`, 'success');
      renderAll();
      saveState(state);
    });
  });
}

function renderAchievements() {
  const total = ACHIEVEMENTS.length;
  const unlocked = Object.keys(state.achievements).length;
  elements.achievementCount.textContent = `${unlocked} / ${total}`;

  elements.achievementsList.innerHTML = ACHIEVEMENTS.map((achievement) => {
    const unlockedNow = Boolean(state.achievements[achievement.id]);
    return `
      <div class="achievement-item ${unlockedNow ? 'unlocked' : ''}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div>
          <h4>${achievement.name}</h4>
          <p>${achievement.description}</p>
        </div>
      </div>
    `;
  }).join('');
}

function renderStats() {
  const stats = [
    ['Clicks', formatNumber(state.statistics.totalClicks)],
    ['Critical', formatNumber(state.statistics.criticalClicks)],
    ['Max combo', String(state.statistics.maxCombo)],
    ['Auto / sec', formatNumber(getAutoIncome(state))],
    ['Play time', `${Math.floor(state.statistics.playTime / 60)}m`],
    ['Highest level', String(state.statistics.highestLevel)]
  ];

  elements.statsList.innerHTML = stats.map(([label, value]) => `
    <div class="stat-item">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
    </div>
  `).join('');
}

function renderCollection() {
  const collection = [
    { label: 'Pony Helper', value: `Lv.${state.upgrades.autoClicker}` },
    { label: 'Critical chance', value: `${(getCriticalChance(state) * 100).toFixed(1)}%` },
    { label: 'Combo', value: `x${getComboMultiplier(state).toFixed(1)}` },
    { label: 'Total progress', value: `${Math.min(100, Math.round((Object.keys(state.achievements).length / ACHIEVEMENTS.length) * 100))}%` }
  ];

  elements.collectionList.innerHTML = collection.map((item) => `
    <div class="achievement-item">
      <div class="achievement-icon">✨</div>
      <div>
        <h4>${item.label}</h4>
        <p>${item.value}</p>
      </div>
    </div>
  `).join('');
}

function applyAchievementUnlocks() {
  const unlockedBefore = Object.keys(state.achievements).length;
  const unlockedNow = evaluateAchievements(state);

  if (unlockedNow > unlockedBefore) {
    const last = Object.keys(state.achievements).slice(-1)[0];
    const achievement = ACHIEVEMENTS.find((item) => item.id === last);
    if (achievement) notify(elements.toastContainer, `Achievement unlocked: ${achievement.name}`, 'success');
  }
}

function renderAll() {
  renderHUD();
  renderUpgrades();
  renderAchievements();
  renderStats();
  renderCollection();
  updateComboDisplay(elements.comboDisplay, state.combo);
}

function openSettingsModal() {
  elements.modalRoot.innerHTML = `
    <div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div class="modal-window">
        <div class="modal-header">
          <h3 id="settings-title">Settings</h3>
          <button class="dialog-close" type="button" aria-label="Close settings">×</button>
        </div>

        <div class="setting-list">
          <div class="toggle-row">
            <div class="label-wrap">
              <span>Sound</span>
              <small>Enable sound effects</small>
            </div>
            <button class="toggle ${state.settings.sound ? 'active' : ''}" data-setting="sound" type="button" aria-label="Toggle sound" aria-pressed="${state.settings.sound}"></button>
          </div>

          <div class="toggle-row">
            <div class="label-wrap">
              <span>Animations</span>
              <small>Floating text and motion</small>
            </div>
            <button class="toggle ${state.settings.animations ? 'active' : ''}" data-setting="animations" type="button" aria-label="Toggle animations" aria-pressed="${state.settings.animations}"></button>
          </div>

          <div class="toggle-row">
            <div class="label-wrap">
              <span>Particles</span>
              <small>Show burst effects</small>
            </div>
            <button class="toggle ${state.settings.particles ? 'active' : ''}" data-setting="particles" type="button" aria-label="Toggle particles" aria-pressed="${state.settings.particles}"></button>
          </div>

          <div class="toggle-row">
            <div class="label-wrap">
              <span>Reduced motion</span>
              <small>Minimize visual movement</small>
            </div>
            <button class="toggle ${state.settings.reducedMotion ? 'active' : ''}" data-setting="reducedMotion" type="button" aria-label="Toggle reduced motion" aria-pressed="${state.settings.reducedMotion}"></button>
          </div>

          <div class="toggle-row">
            <div class="label-wrap">
              <span>Autosave</span>
              <small>Save progress automatically</small>
            </div>
            <button class="toggle ${state.settings.autosave ? 'active' : ''}" data-setting="autosave" type="button" aria-label="Toggle autosave" aria-pressed="${state.settings.autosave}"></button>
          </div>
        </div>

        <div class="modal-actions">
          <button class="secondary-button" id="closeModalButton" type="button">Close</button>
          <button class="danger-button" id="resetProgressButton" type="button">Reset progress</button>
        </div>
      </div>
    </div>
  `;

  elements.modalRoot.querySelector('.dialog-close').addEventListener('click', closeSettingsModal);
  elements.modalRoot.querySelector('#closeModalButton').addEventListener('click', closeSettingsModal);
  elements.modalRoot.querySelector('#resetProgressButton').addEventListener('click', resetProgress);
  elements.modalRoot.querySelector('.modal-overlay').addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeSettingsModal();
  });

  elements.modalRoot.querySelectorAll('.toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.setting;
      state.settings[key] = !state.settings[key];
      openSettingsModal();
      saveState(state);
    });
  });
}

function closeSettingsModal() {
  elements.modalRoot.innerHTML = '';
}

function resetProgress() {
  const confirmed = window.confirm('Reset all progress?');
  if (!confirmed) return;
  const fresh = {
    ...state,
    coins: 0,
    totalCoins: 0,
    level: 1,
    xp: 0,
    xpRequired: getXpRequirement(1),
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
    }
  };

  Object.assign(state, fresh);
  saveState(state);
  renderAll();
  closeSettingsModal();
  notify(elements.toastContainer, 'Progress reset', 'warning');
}

function handleClick() {
  const reward = handlePonyClick(state, elements.ponyButton, elements.floatingLayer, ({ reward: gained, critical }) => {
    const xpGain = Math.round(gained * 0.75 + (critical ? 12 : 0));
    awardXp(xpGain);
    applyAchievementUnlocks();
    renderAll();
  });
  return reward;
}

function gameLoop() {
  const now = Date.now();
  const autoIncome = getAutoIncome(state);

  if (autoIncome > 0) {
    const gain = autoIncome / 10;
    state.coins += gain;
    state.totalCoins += gain;
    state.statistics.sessionCoins += gain;
    state.statistics.totalCoins += gain;
  }

  if (state.combo > 0 && now - state.lastClickAt > COMBO_TIMEOUT_MS) {
    state.combo = Math.max(0, state.combo - 1);
    if (state.combo === 0) state.lastClickAt = 0;
  }

  updateStatistics(state);
  state.statistics.autoIncome = autoIncome;

  if (state.settings.autosave && now - lastState.lastAutosave > AUTOSAVE_INTERVAL_MS) {
    saveState(state);
    lastState.lastAutosave = now;
  }

  renderAll();
}

function attachEvents() {
  elements.ponyButton.addEventListener('click', handleClick);
  elements.settingsButton.addEventListener('click', openSettingsModal);
  bindKeydown((event) => {
    if (event.key === 'Escape' && elements.modalRoot.innerHTML) {
      closeSettingsModal();
    }
  });
  window.addEventListener('beforeunload', () => saveState(state));
}

const easterTarget = document.createElement('button');
easterTarget.type = 'button';
easterTarget.textContent = '✦';
easterTarget.setAttribute('aria-label', 'Hidden pony secret');
easterTarget.style.position = 'fixed';
easterTarget.style.right = '22px';
easterTarget.style.bottom = '22px';
easterTarget.style.zIndex = '25';
easterTarget.style.background = 'rgba(255,255,255,0.04)';
easterTarget.style.color = '#f7d67a';
easterTarget.style.border = '1px solid rgba(255,255,255,0.08)';
easterTarget.style.borderRadius = '50%';
easterTarget.style.width = '42px';
easterTarget.style.height = '42px';
easterTarget.style.fontSize = '1.2rem';
easterTarget.style.boxShadow = '0 18px 34px rgba(0,0,0,0.22)';
easterTarget.addEventListener('click', () => {
  if (state.achievements.easter_egg) {
    notify(elements.toastContainer, 'The secret has already been found', 'warning');
    return;
  }
  state.achievements.easter_egg = { unlockedAt: Date.now() };
  notify(elements.toastContainer, 'Easter Egg Found!', 'critical');
  applyAchievementUnlocks();
  renderAll();
  saveState(state);
});
document.body.appendChild(easterTarget);

attachEvents();
renderAll();
setInterval(gameLoop, 100);
