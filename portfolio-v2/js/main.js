/* ================================================================
   VINAY GK — PORTFOLIO V2  |  main.js
   Features: sticky header · mobile nav · scroll-spy · skill bar
             trigger · reveal on scroll · form · back-to-top
   ================================================================ */

(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ── Year ─────────────────────────────────────────────────── */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Sticky header ────────────────────────────────────────── */
  const header  = $('#siteHeader');
  const backTop = $('#backTop');

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    backTop.classList.toggle('visible', y > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile nav ───────────────────────────────────────────── */
  const navToggle = $('#navToggle');
  const primaryNav = $('#primaryNav');

  const closeNav = () => {
    primaryNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  navToggle.addEventListener('click', () => {
    const open = primaryNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  $$('.nav-link').forEach(l => l.addEventListener('click', closeNav));

  // Close on outside click
  document.addEventListener('click', e => {
    if (
      primaryNav.classList.contains('open') &&
      !primaryNav.contains(e.target) &&
      !navToggle.contains(e.target)
    ) closeNav();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeNav();
  });

  /* ── Scroll-spy active link ───────────────────────────────── */
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l =>
            l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`)
          );
        }
      });
    },
    { rootMargin: '-30% 0px -65% 0px' }
  ).observe
    ? sections.forEach(s =>
        new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting)
              navLinks.forEach(l =>
                l.classList.toggle('active', l.getAttribute('href') === `#${s.id}`)
              );
          },
          { rootMargin: '-30% 0px -65% 0px' }
        ).observe(s)
      )
    : null;

  /* ── Reveal on scroll ─────────────────────────────────────── */
  const revealEls = $$('.reveal');
  const revealObs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  revealEls.forEach(el => revealObs.observe(el));

  /* ── Skill bars — pause then play when visible ────────────── */
  const bars = $$('.skill-bar-fill');
  bars.forEach(b => (b.style.animationPlayState = 'paused'));

  new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.animationPlayState = 'running';
        }
      });
    },
    { threshold: 0.5 }
  ).observe
    ? bars.forEach(b =>
        new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting) {
              b.style.animationPlayState = 'running';
            }
          },
          { threshold: 0.5 }
        ).observe(b)
      )
    : null;

  /* ── Contact form ─────────────────────────────────────────── */
  const form        = $('#contactForm');
  const formSuccess = $('#formSuccess');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      // Simulate async send — replace with EmailJS / Formspree
      setTimeout(() => {
        formSuccess.hidden = false;
        form.reset();
        btn.disabled = false;
        btn.textContent = 'Send Message';
        setTimeout(() => { formSuccess.hidden = true; }, 6000);
      }, 1000);
    });
  }

})();
