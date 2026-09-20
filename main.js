// ==========================================
// 1. DYNAMIC HEADER INJECTION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const headerContainer = document.getElementById('header-include');
  if (headerContainer) {
    fetch('header.html')
      .then(response => response.text())
      .then(data => {
        headerContainer.innerHTML = data;
        
        // Now that header is loaded, attach scroll listener for sticky shadow
        const header = document.getElementById('header');
        if(header) {
          window.addEventListener('scroll', () => {
            if (window.scrollY > 20) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
          }, { passive: true });
        }
      })
      .catch(err => console.error('Error loading header:', err));
  }
});

// ==========================================
// 2. BULLETPROOF GLOBAL CLICK LOGIC (Event Delegation)
// ==========================================
// This works instantly on injected HTML without needing to re-run scripts

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

  // Handle Mobile Menu Accordion Toggles
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

  // Handle FAQ Accordion Toggles
  const faqTrigger = e.target.closest('.faq-q');
  if (faqTrigger) {
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
  }
  
  // Back to top button
  const toTopBtn = e.target.closest('#toTop');
  if(toTopBtn) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// ==========================================
// 3. GLOBAL SCROLL ANIMATIONS & COUNTERS
// ==========================================

// Scroll Reveal Animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
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
      const step = target / 70;
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

// Show/Hide Back to Top button on scroll
window.addEventListener('scroll', () => {
  const toTop = document.getElementById('toTop');
  if (toTop) {
    if (window.scrollY > 500) toTop.classList.add('show');
    else toTop.classList.remove('show');
  }
}, { passive: true });

// Preloader hide
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => preloader.classList.add('hide'), 700);
  }
});

// ==========================================
// 4. FORM SUBMISSION LOGIC
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

    // Dummy success simulation
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
// SIDE FOOTER TOGGLE LOGIC
// ==========================================
document.addEventListener('click', function(e) {
  // Open Side Footer
  if (e.target.closest('#sideFooterTrigger')) {
    const panel = document.getElementById('sideFooter');
    const overlay = document.getElementById('sfOverlay');
    if(panel) panel.classList.add('active');
    if(overlay) overlay.classList.add('active');
    return;
  }

  // Close Side Footer
  if (e.target.closest('#closeSideFooter') || e.target.closest('#sfOverlay')) {
    const panel = document.getElementById('sideFooter');
    const overlay = document.getElementById('sfOverlay');
    if(panel) panel.classList.remove('active');
    if(overlay) overlay.classList.remove('active');
    return;
  }
});
