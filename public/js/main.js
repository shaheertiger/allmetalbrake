// Mobile nav toggle
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
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
  // Forms with a real `action` (e.g. FormSubmit) submit natively — skip them.
  if (form.tagName === 'FORM' && form.getAttribute('action')) return;
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

// FAQ accordion. Answers stay in the HTML (search engines read them);
// they are only hidden visually until the question is opened.
document.querySelectorAll('.faq-item').forEach((item, i) => {
  const q = item.querySelector('.faq-question');
  const a = item.querySelector('.faq-answer');
  if (!q || !a) return;
  a.id = a.id || `faq-answer-${i}`;
  q.setAttribute('role', 'button');
  q.setAttribute('tabindex', '0');
  q.setAttribute('aria-controls', a.id);
  const sync = () => q.setAttribute('aria-expanded', String(item.classList.contains('open')));
  const toggle = () => { item.classList.toggle('open'); sync(); };
  q.addEventListener('click', toggle);
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
  sync();
});
document.documentElement.classList.add('js');

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
