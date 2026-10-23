(function () {
  'use strict';

  // Static-site form backend (GitHub Pages has no server).
  // FormSubmit forwards submissions to this inbox; the first submission triggers
  // a one-time activation email to info@deedease.com. To switch providers
  // (e.g. Formspree: https://formspree.io/f/<id>), change this URL only.
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/info@deedease.com';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function setStatus(form, text, kind) {
    var el = form.querySelector('.form-status');
    if (!el) return;
    el.textContent = text;
    el.className = 'form-status' + (kind ? ' ' + kind : '');
  }

  function validate(form) {
    var firstInvalid = null;
    form.querySelectorAll('[required]').forEach(function (field) {
      var value = field.type === 'checkbox' ? field.checked : field.value.trim();
      var ok = field.type === 'email' ? EMAIL_RE.test(field.value.trim()) : Boolean(value);
      field.classList.toggle('is-invalid', !ok);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function collect(form, type) {
    var data = { form_type: type, page: location.href, submitted_at: new Date().toISOString() };
    new FormData(form).forEach(function (value, key) {
      data[key] = typeof value === 'string' ? value.trim() : value;
    });
    data._subject = type === 'waitlist'
      ? 'Deedease waitlist signup: ' + data.email
      : 'Deedease ' + (data.interest || 'early access') + ' lead: ' + (data.name || data.email);
    data._template = 'table';
    data._captcha = 'false';
    if (data.email) data._replyto = data.email;
    return data;
  }

  function handleSubmit(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var type = form.getAttribute('data-form');

    var honey = form.querySelector('input[name="_honey"]');
    if (honey && honey.value) return;

    if (!validate(form)) {
      setStatus(form, 'Please fill in the required fields with valid details.', 'err');
      return;
    }

    var button = form.querySelector('button[type="submit"]');
    var originalLabel = button.innerHTML;
    button.disabled = true;
    button.textContent = 'Submitting…';
    setStatus(form, '', '');

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(collect(form, type))
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok || String(body.success) === 'false') {
            throw new Error(body.message || 'Request failed');
          }
        });
      })
      .then(function () {
        form.reset();
        setStatus(
          form,
          type === 'waitlist'
            ? "You're on the list! We'll be in touch before launch."
            : "Thanks! Our team will reach out about early access shortly.",
          'ok'
        );
      })
      .catch(function () {
        setStatus(
          form,
          'Something went wrong. Please try again or email info@deedease.com.',
          'err'
        );
      })
      .finally(function () {
        button.disabled = false;
        button.innerHTML = originalLabel;
      });
  }

  document.querySelectorAll('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', handleSubmit);
    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('is-invalid')) {
        e.target.classList.remove('is-invalid');
        e.target.removeAttribute('aria-invalid');
      }
    });
  });
})();
