import { loadState as loadPersistedState, saveState as persistState, STORAGE_KEY, createDefaultState } from './state.js';

export function loadGame() {
  return loadPersistedState();
}

export function saveGame(state) {
  persistState(state);
}

export function resetSave() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getDefaultState() {
  return createDefaultState();
}
