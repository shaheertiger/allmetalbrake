/**
 * Price gate — blur all `.price-lock` prices until the visitor submits an
 * email. The email is sent to FormSubmit; once submitted, prices are revealed
 * and the choice is remembered in localStorage.
 */
(function () {
  var KEY = 'hfr_price_unlocked';
  var ENDPOINT = 'https://formsubmit.co/ajax/shaheertiger1@gmail.com';
  var root = document.documentElement;

  function isUnlocked() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function unlock() {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    root.classList.add('prices-unlocked');
    var m = document.querySelector('.price-gate-modal');
    if (m) m.remove();
  }

  if (isUnlocked()) { root.classList.add('prices-unlocked'); return; }

  var modal = null;
  function buildModal() {
    modal = document.createElement('div');
    modal.className = 'price-gate-modal';
    modal.innerHTML =
      '<div class="price-gate-card" role="dialog" aria-modal="true" aria-label="Unlock pricing">' +
        '<div class="pg-icon">🔒</div>' +
        '<h3>See the Pricing</h3>' +
        '<p>Enter your email to instantly reveal real-world prices across our reviews and guides. No spam — just honest pricing and the occasional deal alert.</p>' +
        '<form class="pg-form" novalidate>' +
          '<input type="email" class="pg-email" placeholder="you@email.com" required autocomplete="email" />' +
          '<button type="submit" class="pg-submit">Unlock Pricing →</button>' +
          '<div class="pg-err" aria-live="polite"></div>' +
        '</form>' +
        '<button type="button" class="pg-close">Maybe later</button>' +
        '<p class="pg-fine">We respect your privacy. Unsubscribe anytime.</p>' +
      '</div>';
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.remove();
    });
    modal.querySelector('.pg-close').addEventListener('click', function () { modal.remove(); });

    var form = modal.querySelector('.pg-form');
    var emailInput = modal.querySelector('.pg-email');
    var err = modal.querySelector('.pg-err');
    var btn = modal.querySelector('.pg-submit');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = emailInput.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err.textContent = 'Please enter a valid email address.';
        return;
      }
      err.textContent = '';
      btn.textContent = 'Unlocking…';
      btn.disabled = true;

      var payload = {
        email: email,
        _subject: 'New Home Fix Reviews pricing unlock',
        _template: 'table',
        _captcha: 'false'
      };
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .catch(function () { /* network/activation issues shouldn't trap the user */ })
        .finally(function () { unlock(); });
    });

    setTimeout(function () { emailInput.focus(); }, 50);
  }

  function openModal() {
    if (root.classList.contains('prices-unlocked')) return;
    if (modal && document.body.contains(modal)) { return; }
    buildModal();
  }

  function wire() {
    var locks = document.querySelectorAll('.price-lock');
    if (!locks.length) return;
    locks.forEach(function (el) {
      el.setAttribute('title', 'Enter your email to reveal pricing');
      el.addEventListener('click', openModal);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
