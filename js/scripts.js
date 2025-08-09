/**
 * Modern Portfolio JavaScript
 * Handles theme toggle, navigation, smooth scrolling, and animations
 */

class PortfolioApp {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.initTheme();
        this.initNavigation();
        this.initScrollEffects();
        this.initIntersectionObserver();
    }

    bindEvents() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navbar = document.querySelector('.navbar');
        
        if (mobileToggle && navbar) {
            mobileToggle.addEventListener('click', () => {
                navbar.classList.toggle('open');
                this.updateAriaAttributes(mobileToggle, navbar);
            });
        }

        // Navigation links
        this.setupSmoothScrolling();

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar?.contains(e.target) && navbar?.classList.contains('open')) {
                navbar.classList.remove('open');
                if (mobileToggle) {
                    mobileToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navbar?.classList.contains('open')) {
                navbar.classList.remove('open');
                if (mobileToggle) {
                    mobileToggle.setAttribute('aria-expanded', 'false');
                    mobileToggle.focus();
                }
            }
        });
    }

    initTheme() {
        // Check for saved theme preference or default to dark mode
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Announce theme change for screen readers
        this.announceThemeChange(newTheme);
    }

    announceThemeChange(theme) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Theme changed to ${theme} mode`;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    initNavigation() {
        // Set active navigation link based on current section
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Remove active class from all links
                    navLinks.forEach(link => link.classList.remove('active'));
                    
                    // Add active class to current section link
                    const activeLink = document.querySelector(`a[href="#${entry.target.id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, {
            rootMargin: '-50% 0px -50% 0px'
        });

        sections.forEach(section => observer.observe(section));
    }

    setupSmoothScrolling() {
        // Handle smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId === '#' || targetId === '#page-top') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = window.innerWidth <= 768 ? 80 : 0;
                    const elementPosition = targetElement.offsetTop - headerOffset;
                    
                    window.scrollTo({
                        top: elementPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    const navbar = document.querySelector('.navbar');
                    if (navbar?.classList.contains('open')) {
                        navbar.classList.remove('open');
                    }

                    // Update focus for accessibility
                    targetElement.focus();
                }
            });
        });
    }

    initScrollEffects() {
        // Add scroll-based animations
        const animatedElements = document.querySelectorAll('.timeline-content, .skill-level');
        
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = '0s';
                    entry.target.style.animationPlayState = 'running';
                    
                    // Trigger skill level animations
                    if (entry.target.classList.contains('skill-level')) {
                        entry.target.style.transform = 'scaleX(1)';
                    }
                }
            });
        }, {
            threshold: 0.1
        });

        animatedElements.forEach(element => scrollObserver.observe(element));
    }

    initIntersectionObserver() {
        // Enhanced intersection observer for fade-in animations
        const fadeElements = document.querySelectorAll('.hero-text, .hero-visual, .experience-card, .education-card, .skill-category, .project-card');
        
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100); // Stagger animations
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        fadeElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            fadeObserver.observe(element);
        });
    }

    updateAriaAttributes(button, menu) {
        const isExpanded = menu.classList.contains('open');
        button.setAttribute('aria-expanded', isExpanded.toString());
        menu.setAttribute('aria-hidden', (!isExpanded).toString());
    }
}

// Utility functions for performance and accessibility
const PortfolioUtils = {
    // Debounce function for performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if user prefers reduced motion
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // Add screen reader only text
    addSROnlyText(element, text) {
        const srText = document.createElement('span');
        srText.className = 'sr-only';
        srText.textContent = text;
        element.appendChild(srText);
    }
};

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PortfolioApp());
} else {
    new PortfolioApp();
}

// Handle window resize events
window.addEventListener('resize', PortfolioUtils.debounce(() => {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768) {
        const navbar = document.querySelector('.navbar');
        if (navbar?.classList.contains('open')) {
            navbar.classList.remove('open');
        }
    }
}, 250));

// Enhanced focus management for better accessibility
document.addEventListener('keydown', (e) => {
    // Skip to main content functionality
    if (e.key === 'Tab' && !e.shiftKey && document.activeElement === document.body) {
        const skipLink = document.createElement('a');
        skipLink.href = '#about';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only sr-only-focusable';
        skipLink.style.position = 'absolute';
        skipLink.style.top = '0';
        skipLink.style.left = '0';
        skipLink.style.zIndex = '9999';
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        skipLink.focus();
        
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('#about').focus();
            document.body.removeChild(skipLink);
        });
        
        skipLink.addEventListener('blur', () => {
            if (document.body.contains(skipLink)) {
                document.body.removeChild(skipLink);
            }
        });
    }
});

// Add CSS classes for screen reader only content
const srOnlyCSS = `
.sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0,0,0,0) !important;
    white-space: nowrap !important;
    border: 0 !important;
}

.sr-only-focusable:focus {
    position: static !important;
    width: auto !important;
    height: auto !important;
    padding: 0.5rem 1rem !important;
    margin: 0 !important;
    overflow: visible !important;
    clip: auto !important;
    white-space: normal !important;
    background: var(--primary-color) !important;
    color: white !important;
    text-decoration: none !important;
    font-weight: bold !important;
}
`;

// Inject screen reader CSS
const styleElement = document.createElement('style');
styleElement.textContent = srOnlyCSS;
document.head.appendChild(styleElement);

// Service Worker registration for offline functionality (progressive web app)
if ('serviceWorker' in navigator && !navigator.userAgent.includes('localhost')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
