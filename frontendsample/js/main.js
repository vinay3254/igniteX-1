/**
 * Portfolio Website - Main JavaScript File
 * Handles navigation, animations, and interactive features
 */

// ============================================
// HAMBURGER MENU TOGGLE
// ============================================
/**
 * Initialize hamburger menu functionality
 * Toggles 'active' class on nav-menu when hamburger is clicked
 */
function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}

// ============================================
// SMOOTH SCROLL NAVIGATION
// ============================================
/**
 * Handle smooth scrolling for navigation links
 * Closes mobile menu after clicking a link
 */
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Get the target section
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // Smooth scroll to target
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile menu after clicking
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });
}

// ============================================
// SKILL BAR ANIMATION
// ============================================
/**
 * Animate skill progress bars when skills section becomes visible
 * Uses IntersectionObserver to trigger animation
 */
function initSkillAnimation() {
    const skillProgress = document.querySelectorAll('.skill-progress');

    // Create an Intersection Observer for skill animation
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBar = entry.target;
                const width = skillBar.getAttribute('data-width');
                skillBar.style.width = width + '%';
                // Unobserve after animation is triggered
                skillObserver.unobserve(skillBar);
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px'
    });

    // Observe all skill progress bars
    skillProgress.forEach(bar => {
        skillObserver.observe(bar);
    });
}

// ============================================
// SCROLL-BASED NAVBAR STYLING
// ============================================
/**
 * Add 'scrolled' class to header when page is scrolled
 * Creates a visual change in navbar on scroll (usually a shadow or background change)
 */
function initNavbarScrollEffect() {
    const header = document.querySelector('.header');

    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

// ============================================
// PROJECT CARD FADE-IN ANIMATION
// ============================================
/**
 * Add fade-in animation to project cards as they become visible
 * Uses IntersectionObserver to trigger animation
 */
function initProjectCardAnimation() {
    const projectCards = document.querySelectorAll('.project-card');

    // Create an Intersection Observer for project cards
    const projectObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                // Unobserve after animation is triggered
                projectObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px'
    });

    // Observe all project cards
    projectCards.forEach(card => {
        projectObserver.observe(card);
    });
}

// ============================================
// FORM SUBMISSION HANDLER
// ============================================
/**
 * Handle contact form submission
 * Displays success message and resets form
 */
function initFormHandler() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Show success message
            alert('Thanks for your message! I will get back to you soon.');

            // Reset the form
            contactForm.reset();
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================
/**
 * Initialize all interactive features when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    initHamburgerMenu();
    initSmoothScroll();
    initSkillAnimation();
    initNavbarScrollEffect();
    initProjectCardAnimation();
    initFormHandler();

    // Log initialization complete (optional, for debugging)
    console.log('Portfolio website initialized successfully!');
});
