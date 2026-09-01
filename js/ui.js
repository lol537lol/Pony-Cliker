export function formatNumber(value) {
  const absValue = Math.abs(value);
  const units = ['', 'K', 'M', 'B', 'T'];
  let unitIndex = 0;
  let scaled = absValue;

  while (scaled >= 1000 && unitIndex < units.length - 1) {
    scaled /= 1000;
    unitIndex += 1;
  }

  if (scaled >= 100) return `${scaled.toFixed(0)}${units[unitIndex]}`;
  if (scaled >= 10) return `${scaled.toFixed(1).replace(/\.0$/, '')}${units[unitIndex]}`;
  if (scaled >= 1) return `${scaled.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')}${units[unitIndex]}`;
  return `${value.toFixed(0)}`;
}

export function getXpRequirement(level) {
  return Math.round(100 * Math.pow(1.54, level - 1));
}

export function createFloatingText(layer, text, type = 'coin', x = 50, y = 50) {
  const el = document.createElement('div');
  el.className = `float-text ${type}`;
  el.textContent = text;
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

export function createBurstParticles(layer) {
  const count = 14;
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement('div');
    particle.className = 'particles';
    const size = 6 + Math.random() * 8;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = '50%';
    particle.style.top = '50%';
    particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 140}px`);
    particle.style.setProperty('--dy', `${(-80 - Math.random() * 100)}px`);
    particle.style.background = i % 2 === 0 ? 'rgba(255, 200, 100, 0.9)' : 'rgba(148, 160, 255, 0.9)';
    layer.appendChild(particle);
    setTimeout(() => particle.remove(), 920);
  }
}

export function showToast(container, message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

export function updateComboDisplay(element, combo) {
  if (combo > 0) {
    element.textContent = `Combo x${combo}`;
    element.classList.add('visible');
  } else {
    element.classList.remove('visible');
  }
}
