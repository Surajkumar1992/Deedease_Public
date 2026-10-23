(function () {
  'use strict';

  // Static-site form backend (GitHub Pages has no server): Web3Forms.
  // Get a free access key at https://web3forms.com (enter info@deedease.com),
  // then paste it below. Submissions are emailed to that inbox.
  var WEB3FORMS_ACCESS_KEY = 'edfe1f31-c9ff-4769-b61b-5213a82e9f20';
  var FORM_ENDPOINT = 'https://api.web3forms.com/submit';
  var CONTACT_EMAIL = 'info@deedease.com';
  // Bump together with the "Last updated" date in privacy.html.
  var PRIVACY_POLICY_VERSION = '2026-10-23';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var LABELS = {
    name: 'Name', email: 'Email', phone: 'Phone', city: 'City', role: 'Role',
    interest: 'Interested in', company: 'Company', message: 'Message'
  };

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function setStatus(form, text, kind, mailto) {
    var el = form.querySelector('.form-status');
    if (!el) return;
    el.textContent = text;
    el.className = 'form-status' + (kind ? ' ' + kind : '');
    if (mailto) {
      el.appendChild(document.createTextNode(' '));
      var a = document.createElement('a');
      a.href = mailto;
      a.textContent = 'Send by email instead';
      el.appendChild(a);
    }
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

  function readFields(form) {
    var fields = {};
    new FormData(form).forEach(function (value, key) {
      if (key === 'botcheck' || key === 'consent') return;
      if (typeof value === 'string' && value.trim()) fields[key] = value.trim();
    });
    return fields;
  }

  function subjectFor(type, f) {
    return type === 'waitlist'
      ? 'Deedease waitlist signup: ' + f.email
      : 'Deedease ' + (f.interest || 'early access') + ' lead: ' + (f.name || f.email);
  }

  function buildPayload(form, type) {
    var f = readFields(form);
    var data = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: subjectFor(type, f),
      from_name: 'Deedease Website',
      replyto: f.email,
      form_type: type === 'waitlist' ? 'Waitlist' : 'Early access / pilot lead',
      page: location.href,
      botcheck: false
    };
    Object.keys(f).forEach(function (k) { data[LABELS[k] || k] = f[k]; });
    data['Consent'] = 'Yes: ' + (type === 'waitlist'
      ? 'clicked "Join the early-access waitlist"'
      : 'ticked early-access consent box') + ' (Privacy Policy ' + PRIVACY_POLICY_VERSION + ')';
    data['Consent given at'] = new Date().toISOString();
    return data;
  }

  function mailtoFor(form, type) {
    var f = readFields(form);
    var body = Object.keys(f).map(function (k) { return (LABELS[k] || k) + ': ' + f[k]; }).join('\n');
    return 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent(subjectFor(type, f)) +
      '&body=' + encodeURIComponent(body);
  }

  function handleSubmit(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var type = form.getAttribute('data-form');

    var honey = form.querySelector('input[name="botcheck"]');
    if (honey && honey.value) return;

    if (!validate(form)) {
      setStatus(form, 'Please fill in the required fields with valid details.', 'err');
      return;
    }

    if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY.indexOf('YOUR_') === 0) {
      setStatus(form, 'Online sign-up is being set up.', 'err', mailtoFor(form, type));
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
      body: JSON.stringify(buildPayload(form, type))
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok || body.success !== true) {
            throw new Error(body.message || ('HTTP ' + res.status));
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
      .catch(function (err) {
        if (window.console) console.error('Form submission failed:', err);
        setStatus(form, "We couldn't submit the form right now.", 'err', mailtoFor(form, type));
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
