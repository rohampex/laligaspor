// LaLiga Sports — IntersectionObserver scroll reveal system
// GPU-accelerated (transform + opacity only). Animates once. Respects prefers-reduced-motion.

(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let io;

  function reveal(el) {
    el.classList.add('is-revealed');
    el.classList.remove('reveal-hidden');
  }

  function prepare(el) {
    if (!el || el.dataset.revealInit) return;
    // Skip elements already visible or inside hero (hero has its own CSS stagger)
    if (el.classList.contains('is-revealed')) return;
    if (el.closest('.hero-content')) return;

    el.dataset.revealInit = '1';
    el.classList.add('reveal-hidden');
    io.observe(el);
  }

  function scan(root) {
    if (REDUCED) return;
    const scope = root || document;
    scope.querySelectorAll('[data-reveal], [data-anim]').forEach(prepare);
  }

  function init() {
    if (REDUCED) {
      // Immediately show everything — respect the user's preference
      document.querySelectorAll('[data-reveal], [data-anim]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);

        // Honour stagger: data-reveal-delay takes priority, then inline animation-delay
        const rawDelay = el.dataset.revealDelay
          || (el.style.animationDelay ? el.style.animationDelay.replace(/[^0-9]/g, '') : '0');
        const delay = parseInt(rawDelay, 10) || 0;

        // Clear any leftover animation-delay so it doesn't fire the old keyframe animation
        el.style.animationDelay = '';

        if (delay > 0) {
          setTimeout(() => reveal(el), delay);
        } else {
          reveal(el);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -48px 0px'
    });

    // Double rAF ensures DOM is painted before we kick off observations
    requestAnimationFrame(() => requestAnimationFrame(() => scan(document)));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API for pages that add content dynamically
  window.LLReveal = { scan, init };
})();
