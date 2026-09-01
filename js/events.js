export function bindEvents(elements, handlers) {
  Object.entries(handlers).forEach(([key, handler]) => {
    const target = elements[key];
    if (!target || typeof handler !== 'function') return;
    target.addEventListener('click', handler);
  });
}

export function bindKeydown(handler) {
  document.addEventListener('keydown', handler);
}
