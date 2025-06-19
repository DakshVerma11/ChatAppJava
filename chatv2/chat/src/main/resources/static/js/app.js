/**
 * ChatZero Application JavaScript
 * Handles all general page functionality (index, login, register, forgot-password, logout)
 */

(function() {
  'use strict';

  // Page detection
  const isIndexPage = document.body.classList.contains('index-page') || window.location.pathname === '/';
  const isLoginPage = window.location.pathname.includes('/login');
  const isRegisterPage = window.location.pathname.includes('/register');
  const isForgotPasswordPage = window.location.pathname.includes('/forgot-password');
  const isChatPage = document.body.classList.contains('chat-page');

  // Don't run on chat page
  if (isChatPage) {
    return;
  }

  console.log('🚀 Initializing ChatZero App.js');

  // ===== CAPTCHA FUNCTIONALITY =====
  function validateCaptcha(formType) {
    if (typeof grecaptcha === 'undefined') {
      return true; // No CAPTCHA required
    }

    const captchaResponse = grecaptcha.getResponse();
    const errorDiv = document.getElementById('captcha-error-' + formType);
    
    if (!captchaResponse || captchaResponse.length === 0) {
      if (errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
    return true;
  }

  function captchaCallback() {
    // Find any captcha error div and hide it
    const errorDivs = document.querySelectorAll('[id^="captcha-error-"]');
    errorDivs.forEach(div => {
      div.style.display = 'none';
    });
  }

  function initializeCaptcha() {
    if (typeof grecaptcha === 'undefined') {
      return;
    }

    // Find and render any reCAPTCHA elements
    document.querySelectorAll('[data-sitekey]').forEach(element => {
      const sitekey = element.getAttribute('data-sitekey');
      if (sitekey && element.id) {
        try {
          grecaptcha.render(element.id, {
            'sitekey': sitekey,
            'callback': captchaCallback
          });
          console.log('✅ reCAPTCHA initialized for', element.id);
        } catch (error) {
          console.error('❌ reCAPTCHA initialization failed:', error);
        }
      }
    });
  }

  // ===== FORM VALIDATION =====
  function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input[required]');
      
      // Real-time validation
      inputs.forEach(input => {
        input.addEventListener('blur', function() {
          validateInput(this);
        });
        
        input.addEventListener('input', function() {
          clearValidationError(this);
        });
      });

      // Form submission handling
      form.addEventListener('submit', function(e) {
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Store original text
        if (submitBtn && !submitBtn.hasAttribute('data-original-text')) {
          submitBtn.setAttribute('data-original-text', submitBtn.textContent);
        }

        // Add loading state
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Loading...';
          
          // Re-enable after timeout in case of errors
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
          }, 5000);
        }
      });
    });
  }

  function validateInput(input) {
    if (!input.value.trim()) {
      input.style.borderColor = '#ef4444';
      input.style.boxShadow = '0 0 0 1px #ef4444';
    } else if (input.type === 'email' && !isValidEmail(input.value)) {
      input.style.borderColor = '#ef4444';
      input.style.boxShadow = '0 0 0 1px #ef4444';
    } else {
      clearValidationError(input);
    }
  }

  function clearValidationError(input) {
    input.style.borderColor = '';
    input.style.boxShadow = '';
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ===== HOME PAGE FUNCTIONALITY =====
  function initializeHomePage() {
    if (!isIndexPage) return;

    console.log('🏠 Initializing home page features');

    // Smooth button hover effects
    const buttons = document.querySelectorAll('.btn, .actions a');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.02)';
        this.style.transition = 'transform 0.3s ease';
      });
      
      button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });

    // Typing animation for main heading
    const heading = document.querySelector('h1');
    if (heading) {
      const text = heading.textContent;
      heading.textContent = '';
      
      let i = 0;
      const typeWriter = () => {
        if (i < text.length) {
          heading.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, 100);
        }
      };
      
      setTimeout(typeWriter, 500);
    }

    // Fade-in animations
    const elements = document.querySelectorAll('.wrapper > *');
    elements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 200);
    });
  }

  // ===== AUTH PAGES FUNCTIONALITY =====
  function initializeAuthPages() {
    if (!isLoginPage && !isRegisterPage && !isForgotPasswordPage) return;

    console.log('🔐 Initializing authentication page features');

    // Enhanced input focus effects
    const inputFields = document.querySelectorAll('.input-field');
    inputFields.forEach(field => {
      const input = field.querySelector('input');
      const label = field.querySelector('label');
      
      if (input && label) {
        // Check if input has value on load
        if (input.value.trim()) {
          label.style.top = '0';
          label.style.fontSize = '12px';
          label.style.color = 'rgba(255, 255, 255, 0.8)';
        }

        input.addEventListener('focus', function() {
          label.style.top = '0';
          label.style.fontSize = '12px';
          label.style.color = '#4ade80';
          field.style.borderColor = '#4ade80';
        });

        input.addEventListener('blur', function() {
          if (!this.value.trim()) {
            label.style.top = '50%';
            label.style.fontSize = '16px';
            label.style.color = 'rgba(255, 255, 255, 0.7)';
          } else {
            label.style.color = 'rgba(255, 255, 255, 0.8)';
          }
          field.style.borderColor = '';
        });
      }
    });

    // Password strength indicator for register page
    if (isRegisterPage) {
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput) {
        const strengthIndicator = createPasswordStrengthIndicator();
        passwordInput.parentNode.insertBefore(strengthIndicator, passwordInput.nextSibling);

        passwordInput.addEventListener('input', function() {
          updatePasswordStrength(this.value, strengthIndicator);
        });
      }
    }
  }

  function createPasswordStrengthIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'password-strength';
    indicator.style.cssText = `
      margin-top: 8px;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      display: none;
    `;
    return indicator;
  }

  function updatePasswordStrength(password, indicator) {
    if (!password) {
      indicator.style.display = 'none';
      return;
    }

    indicator.style.display = 'block';
    
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength++;
    else feedback.push('At least 8 characters');

    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('One uppercase letter');

    if (/[a-z]/.test(password)) strength++;
    else feedback.push('One lowercase letter');

    if (/\d/.test(password)) strength++;
    else feedback.push('One number');

    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push('One special character');

    const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#16a34a'];
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

    indicator.style.backgroundColor = colors[strength] + '20';
    indicator.style.borderLeft = `4px solid ${colors[strength]}`;
    indicator.style.color = colors[strength];
    
    if (strength < 3) {
      indicator.textContent = `${labels[strength]} - Need: ${feedback.join(', ')}`;
    } else {
      indicator.textContent = `${labels[strength]} password`;
    }
  }

  // ===== NOTIFICATIONS =====
  function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      z-index: 10000;
      max-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Hide notification
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  }

  // ===== UTILITY FUNCTIONS =====
  function smoothScrollTo(element) {
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // ===== GLOBAL FUNCTIONS (for inline onclick handlers) =====
  window.validateCaptcha = validateCaptcha;
  window.showNotification = showNotification;

  // ===== INITIALIZATION =====
  function initialize() {
    console.log('📱 App.js initialization started');
    
    // Setup form validation for all pages
    setupFormValidation();
    
    // Page-specific initialization
    initializeHomePage();
    initializeAuthPages();
    
    console.log('✅ App.js initialization completed');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Initialize CAPTCHA when window loads (for external script compatibility)
  window.addEventListener('load', initializeCaptcha);

})();

