// Enhanced JavaScript for Konnect Africa Website

class WebsiteManager {
  constructor() {
    this.isScrolling = false;
    this.lastScrollTop = 0;
    this.init();
  }

  init() {
    this.setupMobileNavigation();
    this.setupScrollEffects();
    this.setupAnimations();
    this.setupSmoothScrolling();
    this.setupLazyLoading();
    this.setupThemeToggle();
    this.setupBackToTop();
    this.setupPerformanceOptimizations();
  }

  // Enhanced Mobile Navigation
  setupMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-item a');

    if (hamburger && navMenu) {
      const closeMenu = () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open navigation menu');
      };

      hamburger.addEventListener('click', () => {
        const isOpen = !navMenu.classList.contains('active');
        hamburger.classList.toggle('active', isOpen);
        navMenu.classList.toggle('active', isOpen);
        document.body.classList.toggle('nav-open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        hamburger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      });

      // Close mobile menu when clicking on a link
      navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
          closeMenu();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
      });
    }
  }

  // Enhanced Scroll Effects
  setupScrollEffects() {
    const header = document.querySelector('header');
    let ticking = false;

    const updateHeader = () => {
      const scrollTop = window.pageYOffset;
      
      if (scrollTop > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      this.lastScrollTop = scrollTop;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
  }

  // Enhanced Animations
  setupAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.animate-fadeInUp, .animate-slideInLeft, .animate-slideInRight, .animate-scaleIn');
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      observer.observe(el);
    });
  }

  // Enhanced Smooth Scrolling
  setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const headerHeight = document.querySelector('header').offsetHeight;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Enhanced Lazy Loading
  setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  // Enhanced Theme Toggle
  setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or default to system preference
    const currentTheme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      });
    }

    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  // Enhanced Back to Top Button
  setupBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '↑';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTop);

    // Show/hide back to top button
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    // Smooth scroll to top
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Enhanced Performance Optimizations
  setupPerformanceOptimizations() {
    // Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 150);
      this.isScrolling = true;
    }, { passive: true });

  }
}

// Enhanced Form Validation
class FormValidator {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    if (this.form) {
      this.init();
    }
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.setupRealTimeValidation();
  }

  setupRealTimeValidation() {
    const inputs = this.form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Email validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (field.type === 'tel' && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
      }
    }

    this.showFieldError(field, isValid, errorMessage);
    return isValid;
  }

  showFieldError(field, isValid, message) {
    const errorElement = field.parentNode.querySelector('.error-message');
    
    if (!isValid) {
      field.classList.add('error');
      if (!errorElement) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        field.parentNode.appendChild(error);
      } else {
        errorElement.textContent = message;
      }
    } else {
      field.classList.remove('error');
      if (errorElement) {
        errorElement.remove();
      }
    }
  }

  clearError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const inputs = this.form.querySelectorAll('input, textarea');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    if (isValid) {
      this.submitForm();
    }
  }

  submitForm() {
    const submitButton = this.form.querySelector('button[type="submit"]');
    if (this.form.id !== 'contact-form') {
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      submitButton.classList.add('loading');
      window.setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        submitButton.classList.remove('loading');
        this.showNotification('Form submitted successfully!', 'success');
        this.form.reset();
      }, 2000);
      return;
    }

    const formData = new FormData(this.form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const subject = String(formData.get('subject') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'Not provided'}`,
      '',
      message
    ].join('\n');
    const mailto = `mailto:konnectafricanconsult24@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const status = this.form.querySelector('#contact-form-status');

    if (status) {
      status.textContent = 'Your email app should open with your message ready to send. If it does not, use the direct email link below.';
    }

    if (submitButton) {
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Opening email app...';
      window.setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }, 1200);
    }

    window.location.href = mailto;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Enhanced Notification System
class NotificationSystem {
  static show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" aria-label="Close notification">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto-hide
    const hideTimeout = setTimeout(() => {
      this.hide(notification);
    }, duration);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      clearTimeout(hideTimeout);
      this.hide(notification);
    });
  }
  
  static hide(notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WebsiteManager();
  
  // Initialize form validators
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    new FormValidator(`#${form.id}`);
  });
  
  // Add CSS for new components
  const style = document.createElement('style');
  style.textContent = `
    .back-to-top {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: var(--transition);
      z-index: 1000;
      font-size: 1.2rem;
      font-weight: bold;
    }
    
    .back-to-top.visible {
      opacity: 1;
      visibility: visible;
    }
    
    .back-to-top:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-heavy);
    }
    
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-heavy);
      padding: 1rem;
      transform: translateX(100%);
      transition: var(--transition);
      z-index: 10000;
      max-width: 400px;
    }
    
    .notification.show {
      transform: translateX(0);
    }
    
    .notification-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    
    .notification-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-secondary);
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: var(--transition);
    }
    
    .notification-close:hover {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }
    
    .notification-success {
      border-left: 4px solid var(--success-color);
    }
    
    .notification-error {
      border-left: 4px solid var(--error-color);
    }
    
    .notification-warning {
      border-left: 4px solid var(--warning-color);
    }
    
    .notification-info {
      border-left: 4px solid var(--primary-color);
    }
    
    .error-message {
      color: var(--error-color);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    input.error,
    textarea.error {
      border-color: var(--error-color) !important;
      box-shadow: 0 0 0 2px rgba(245, 87, 108, 0.2);
    }
    
    .nav-open {
      overflow: hidden;
    }
    
    @media (max-width: 768px) {
      .notification {
        left: 20px;
        right: 20px;
        max-width: none;
        transform: translateY(-100%);
      }
      
      .notification.show {
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
});
