/* ============================================
   MAIN.JS – Interactive behaviors
   ============================================ */

/* ------ Sticky header shadow ------ */
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

/* ------ Mobile nav toggle ------ */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

// Close nav when a link is clicked
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

/* ------ Active nav link on scroll ------ */
const sections  = document.querySelectorAll('section[id]');
const allLinks  = document.querySelectorAll('.nav-link');

const observerNav = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      allLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(sec => observerNav.observe(sec));

/* ------ Typed text animation ------ */
const typedEl = document.getElementById('typed');
const phrases  = [
  'Frontend Developer',
  'UI/UX Enthusiast',
  'Creative Coder',
  'Web Designer',
  'Problem Solver'
];
let phraseIdx = 0, charIdx = 0, deleting = false;

function typeEffect() {
  const current = phrases[phraseIdx];

  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeEffect, 1800);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }
  }

  setTimeout(typeEffect, deleting ? 60 : 100);
}

typeEffect();

/* ------ Skill bar animation on scroll ------ */
const skillFills = document.querySelectorAll('.skill-fill');

const observerSkills = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      observerSkills.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

skillFills.forEach(fill => observerSkills.observe(fill));

/* ------ Scroll-reveal for cards ------ */
const revealEls = document.querySelectorAll(
  '.about-card, .project-card, .skill-item, .contact-form, .contact-info'
);

const styleReveal = document.createElement('style');
styleReveal.textContent = `
  .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
`;
document.head.appendChild(styleReveal);

revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.1}s`;
});

const observerReveal = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observerReveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => observerReveal.observe(el));

/* ------ Back to top button ------ */
const backBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  backBtn.classList.toggle('visible', window.scrollY > 400);
});

backBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ------ Contact form submit ------ */
const form       = document.querySelector('.contact-form');
const formStatus = document.getElementById('form-status');

form.addEventListener('submit', e => {
  e.preventDefault();

  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const subject = form.subject.value.trim();
  const message = form.message.value.trim();

  // Basic validation
  if (!name || !email || !subject || !message) {
    showStatus('⚠️ Please fill in all fields.', 'error');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showStatus('⚠️ Please enter a valid email address.', 'error');
    return;
  }

  // Simulate sending (replace with actual fetch/API call)
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending… ⏳';

  setTimeout(() => {
    showStatus('✅ Message sent successfully! I\'ll be in touch soon.', 'success');
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message 🚀';
  }, 1500);
});

function showStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className   = `form-status ${type}`;
  setTimeout(() => {
    formStatus.textContent = '';
    formStatus.className   = 'form-status';
  }, 5000);
}

/* ------ Smooth scroll for all anchor links ------ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
