// ==========================================
// 1. DYNAMIC HEADER & FOOTER INJECTION
// ==========================================

// Fetch and inject Header
fetch('header.html')
  .then(response => response.text())
  .then(data => {
    const headerInclude = document.getElementById('header-include');
    if (headerInclude) {
      headerInclude.innerHTML = data;
      
      // CRITICAL: Re-execute scripts inside the injected header
      // (Browsers do not run scripts injected via innerHTML automatically)
      Array.from(headerInclude.querySelectorAll('script')).forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }
  })
  .catch(err => console.error('Error loading header:', err));

// Fetch and inject Footer
fetch('footer.html')
  .then(response => response.text())
  .then(data => {
    const footerInclude = document.getElementById('footer-include');
    if (footerInclude) {
      footerInclude.innerHTML = data;
      
      // Re-execute scripts inside the injected footer
      Array.from(footerInclude.querySelectorAll('script')).forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });

      // Footer Back-to-Top Button Logic
      const backTop = document.getElementById('toTop');
      if(backTop) {
        window.addEventListener('scroll', () => {
          if (window.scrollY > 500) {
            backTop.classList.add('show');
          } else {
            backTop.classList.remove('show');
          }
        }, { passive: true });
        backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
      }
    }
  })
  .catch(err => console.error('Error loading footer:', err));


// ==========================================
// 2. GLOBAL SCROLL ANIMATIONS & COUNTERS
// ==========================================

// Scroll Reveal Animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target); // Stop observing once it's visible
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Animated Counters
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = +el.dataset.target;
      let current = 0;
      const step = target / 70; // Speed of animation
      
      const updateCounter = () => {
        current += step;
        if (current < target) {
          el.textContent = Math.round(current);
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = target;
        }
      };
      
      updateCounter();
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// Sticky Header Shadow
const header = document.getElementById('header');
if(header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }, { passive: true });
}


// ==========================================
// 3. BULLETPROOF MOBILE MENU & ACCORDIONS
// ==========================================
// Using Event Delegation so it works instantly on injected HTML

document.addEventListener('click', function(e) {
  // Open Mobile Drawer
  const menuBtn = e.target.closest('#ham');
  if (menuBtn) {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('show');
    return;
  }

  // Close Mobile Drawer (via close button or clicking overlay)
  const closeBtn = e.target.closest('#closeDrawer');
  const overlayClick = e.target.closest('#overlay');
  if (closeBtn || overlayClick) {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
    return;
  }

  // Close drawer when a regular link inside it is clicked
  const drawerLink = e.target.closest('#drawer a:not(.acc-btn)');
  if (drawerLink) {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        overlay.classList.remove('show');
    }
  }

  // Handle Mobile Menu Accordion Toggles (Services, Company, etc.)
  const accBtn = e.target.closest('.acc-btn');
  if (accBtn) {
    const panel = accBtn.nextElementSibling;
    const span = accBtn.querySelector('span');
    const isOpen = panel.style.maxHeight && panel.style.maxHeight !== '0px';
    
    // Close all other open panels
    document.querySelectorAll('.acc-panel').forEach(x => x.style.maxHeight = null);
    document.querySelectorAll('.acc-btn span').forEach(s => s.textContent = '+');
    
    // Open the clicked one if it was closed
    if (!isOpen) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      if (span) span.textContent = '−';
    }
  }
});


// ==========================================
// 4. FAQ ACCORDION (For Contact/Why Zoftix Pages)
// ==========================================

document.addEventListener('click', function(e) {
  const faqTrigger = e.target.closest('.faq-q');
  if (!faqTrigger) return;

  const item = faqTrigger.closest('.faq-item');
  const answer = item.querySelector('.faq-a');
  const isActive = item.classList.contains('active');

  // Close all other FAQ items
  document.querySelectorAll('.faq-item').forEach(otherItem => {
    if (otherItem !== item) {
      otherItem.classList.remove('active');
      const otherAnswer = otherItem.querySelector('.faq-a');
      if (otherAnswer) otherAnswer.style.maxHeight = '0px';
    }
  });

  // Toggle current FAQ item
  if (!isActive) {
    item.classList.add('active');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  } else {
    item.classList.remove('active');
    answer.style.maxHeight = '0px';
  }
});

// Auto-open first FAQ if it exists
window.addEventListener('load', () => {
  const firstFaq = document.querySelector('.faq-item.open');
  if(firstFaq) {
    const firstAnswer = firstFaq.querySelector('.faq-a');
    if(firstAnswer) firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
  }
});


// ==========================================
// 5. FORM SUBMISSION LOGIC (Zoftix Lead Forms)
// ==========================================

const leadForm = document.getElementById('leadForm');
if(leadForm) {
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = leadForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    if(submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Submitting...';
    }

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    let isValid = true;

    if(!nameInput.value.trim()) { nameInput.style.borderColor = '#dc2626'; isValid = false; }
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailInput.value)) { emailInput.style.borderColor = '#dc2626'; isValid = false; }

    if(!isValid) {
      if(submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
      }
      return;
    }

    // --- Dummy success simulation ---
    // Replace this block with your actual fetch() to Google Apps Script or backend
    setTimeout(() => {
      const formWrap = document.getElementById('formWrap');
      const formSuccess = document.getElementById('formSuccess');
      
      if(formWrap) formWrap.style.display = 'none';
      if(formSuccess) formSuccess.style.display = 'block';
      
      leadForm.reset();
      
      if(submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
      }
    }, 800);
  });
}


// ==========================================
// 6. AUTOMATIC FAVICON INJECTION
// ==========================================

const faviconLink = document.createElement('link');
faviconLink.rel = 'icon';
faviconLink.type = 'image/svg+xml';
// Zoftix Z Logo SVG embedded
faviconLink.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="%232288e1"/><path d="M28 32h44l-26 18h26v12H28l26-18H28z" fill="white"/></svg>';
document.head.appendChild(faviconLink);
