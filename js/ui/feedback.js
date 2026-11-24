// Toasts, scroll reveals and the "fly to bag" micro-interaction.
import { $, esc, reducedMotion } from '../utils.js';
import { icon } from './icons.js';

export function toast(message, { action = null, href = null, tone = 'default' } = {}) {
  const root = $('#toast-root');
  const el = document.createElement('div');
  el.className = `toast toast--${tone}`;
  el.innerHTML = `<span class="toast__icon">${tone === 'error' ? icon.info : icon.check}</span><span>${esc(message)}</span>${
    action ? `<a class="toast__action" href="${href}">${esc(action)}</a>` : ''
  }`;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  setTimeout(() => {
    el.classList.remove('is-in');
    setTimeout(() => el.remove(), 400);
  }, 3200);
}

let observer;
export function reveal(root = document) {
  if (!('IntersectionObserver' in window) || reducedMotion()) {
    root.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }
  observer ??= new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          observer.unobserve(e.target);
        }
      }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  root.querySelectorAll('.reveal:not(.is-visible)').forEach((el, i) => {
    el.style.setProperty('--d', `${(i % 6) * 60}ms`);
    observer.observe(el);
  });
}

/** Animate a pink bubble from the clicked button into the bag icon. */
export function flyToBag(fromEl, colour = '#FF4F9A') {
  const target = document.querySelector('[data-bag-target]');
  if (!fromEl || !target || reducedMotion()) return;
  const a = fromEl.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const dot = document.createElement('span');
  dot.className = 'fly-dot';
  dot.style.background = colour;
  dot.style.left = `${a.left + a.width / 2 - 10}px`;
  dot.style.top = `${a.top + a.height / 2 - 10}px`;
  document.body.appendChild(dot);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  dot
    .animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(1.2)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(.3)`, opacity: 0.6 },
      ],
      { duration: 700, easing: 'cubic-bezier(.5,0,.3,1)' },
    )
    .finished.then(() => {
      dot.remove();
      target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
    });
}
