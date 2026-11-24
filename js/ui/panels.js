// Slide-over panels (bag, menu, search, filters) with a shared scrim,
// scroll lock, Escape-to-close and a simple focus trap.
import { $ } from '../utils.js';

const registry = new Map();
let current = null;
let returnFocus = null;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function registerPanel(name, el, hooks = {}) {
  registry.set(name, { el, ...hooks });
  el.setAttribute('aria-hidden', 'true');
  el.inert = true;
}

export function openPanel(name, trigger = document.activeElement) {
  const p = registry.get(name);
  if (!p) return;
  if (current && current !== name) closePanel({ restore: false });
  current = name;
  returnFocus = trigger;
  p.onOpen?.();
  p.el.inert = false;
  p.el.setAttribute('aria-hidden', 'false');
  p.el.classList.add('is-open');
  $('#scrim').classList.add('is-on');
  document.documentElement.classList.add('is-locked');
  requestAnimationFrame(() => (p.el.querySelector('[data-autofocus]') ?? p.el.querySelector(FOCUSABLE))?.focus({ preventScroll: true }));
}

export function closePanel({ restore = true } = {}) {
  if (!current) return;
  const p = registry.get(current);
  p.el.classList.remove('is-open');
  p.el.setAttribute('aria-hidden', 'true');
  p.el.inert = true;
  p.onClose?.();
  current = null;
  $('#scrim').classList.remove('is-on');
  document.documentElement.classList.remove('is-locked');
  if (restore && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
}

export const isOpen = (name) => current === name;

export function initPanels() {
  $('#scrim').addEventListener('click', () => closePanel());
  document.addEventListener('keydown', (e) => {
    if (!current) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closePanel();
    } else if (e.key === 'Tab') {
      const items = [...registry.get(current).el.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
