/* ===== VINAY GK | MAIN JS ===== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. NAVBAR MOBILE TOGGLE ── */
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.classList.toggle('is-active', isOpen);
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
        navToggle.classList.remove('is-active');
      });
    });
  }

  /* ── 2. SCROLL TO TOP BUTTON ── */
  const scrollTopBtn = document.getElementById('scrollTop');

  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('show', window.scrollY > 400);
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── 3. NAVBAR SCROLL SHADOW ── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.boxShadow = window.scrollY > 10
        ? '0 2px 20px rgba(0,0,0,0.08)'
        : 'none';
    });
  }

  /* ── 4. ACTIVE NAV LINK ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__nav a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  /* ── 5. SCROLL REVEAL ANIMATION ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.skills__card, .project-card, .contact__detail, .about__stat').forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  /* ── 6. SKILLS BAR ANIMATION ── */
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skills__bar-fill').forEach(bar => {
          const targetWidth = bar.style.width;
          bar.style.width = '0';
          setTimeout(() => { bar.style.width = targetWidth; }, 100);
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skills__card').forEach(card => barObserver.observe(card));

  /* ── 7. PROJECT FILTER ── */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('#projectsGrid .project-card');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        projectCards.forEach(card => {
          const categories = card.dataset.category || '';
          const match = filter === 'all' || categories.includes(filter);
          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          if (match) {
            card.style.opacity   = '1';
            card.style.transform = 'scale(1)';
            card.style.display   = 'flex';
          } else {
            card.style.opacity   = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              if (!card.dataset.category.includes(btn.dataset.filter) && btn.dataset.filter !== 'all') {
                card.style.display = 'none';
              }
            }, 300);
          }
        });
      });
    });
  }

  /* ── 8. CONTACT FORM VALIDATION ── */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const formError   = document.getElementById('formError');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const firstName  = contactForm.firstName?.value.trim();
      const lastName   = contactForm.lastName?.value.trim();
      const email      = contactForm.email?.value.trim();
      const subject    = contactForm.subject?.value.trim();
      const message    = contactForm.message?.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!firstName || !lastName || !email || !subject || !message || !emailRegex.test(email)) {
        formError.style.display   = 'block';
        formSuccess.style.display = 'none';
        setTimeout(() => { formError.style.display = 'none'; }, 4000);
        return;
      }

      formSuccess.style.display = 'block';
      formError.style.display   = 'none';
      contactForm.reset();
      setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
    });
  }

  /* ── 9. SMOOTH SCROLL FOR ANCHOR LINKS ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 10. TYPING EFFECT on Hero subtitle ── */
  const typingTarget = document.querySelector('.hero__subtitle');
  if (typingTarget) {
    const originalText = typingTarget.textContent;
    typingTarget.textContent = '';
    let i = 0;
    const type = () => {
      if (i < originalText.length) {
        typingTarget.textContent += originalText[i++];
        setTimeout(type, 18);
      }
    };
    setTimeout(type, 800);
  }

});
