// Mobile nav toggle
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    hamburger.classList.toggle('active');
  });
}

// Smooth scroll for anchor links (guard against bare "#" and missing targets)
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    let target;
    try { target = document.querySelector(href); } catch (_) { return; }
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Newsletter forms — wire up ALL on page (footer, sidebar, hero, etc.)
document.querySelectorAll('.newsletter-form').forEach(form => {
  const handle = e => {
    e.preventDefault();
    const input = form.querySelector('input');
    const btn = form.querySelector('button, .btn');
    if (!input || !btn) return;
    if (input.value) {
      const originalText = btn.textContent;
      const originalBg = btn.style.background;
      btn.textContent = 'Subscribed! ✓';
      btn.style.background = '#22c55e';
      input.value = '';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = originalBg;
      }, 3000);
    }
  };
  // Form element submits; non-form containers respond to button click
  if (form.tagName === 'FORM') {
    form.addEventListener('submit', handle);
  } else {
    const btn = form.querySelector('button, .btn');
    if (btn) btn.addEventListener('click', handle);
  }
});

// FAQ accordion — toggle .open on .faq-item when question is clicked
document.querySelectorAll('.faq-question').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    if (item) item.classList.toggle('open');
  });
});

// Animate elements on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.category-card, .review-card, .process-step, .tip-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  observer.observe(el);
});

// Active nav link based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');
if (sections.length && navLinks.length) {
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  });
}
