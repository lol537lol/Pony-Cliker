import { showToast } from './ui.js';

export function notify(container, message, type = 'success') {
  showToast(container, message, type);
}
