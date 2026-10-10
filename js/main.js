(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── mobile menu ── */
  const btn = $('.menu-btn');
  const links = $('.nav-links');
  if (btn && links) {
    const setOpen = (open) => {
      links.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    btn.addEventListener('click', () => setOpen(!links.classList.contains('open')));
    links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.nav')) setOpen(false); });
  }

  /* ── pointer-follow light on every glass surface and button ── */
  document.addEventListener('pointermove', (e) => {
    if (!(e.target instanceof Element)) return;
    const el = e.target.closest('.btn, .glass');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', e.clientX - r.left + 'px');
    el.style.setProperty('--my', e.clientY - r.top + 'px');
  }, { passive: true });

  /* ── hero task queue: one looping sequence ── */
  const rows = $$('[data-queue] li');
  if (rows.length) {
    const setAll = (s) => rows.forEach((r) => r.setAttribute('data-s', s));
    if (reduce) setAll('done');
    else {
      let i = 0;
      const tick = () => {
        if (i >= rows.length) { i = 0; setTimeout(() => { setAll('todo'); setTimeout(tick, 700); }, 2400); return; }
        const row = rows[i];
        row.setAttribute('data-s', 'doing');
        setTimeout(() => { row.setAttribute('data-s', 'done'); i += 1; setTimeout(tick, 250); }, 1100);
      };
      setAll('todo');
      setTimeout(tick, 600);
    }
  }

  /* ── footer year ── */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ── contact form → LazyForms API ── */
  const form = $('#contact-form');
  if (form) {
    const msg = $('#form-msg');
    const submit = $('button[type="submit"]', form);
    const showError = (text) => { msg.textContent = text; msg.hidden = false; msg.className = 'msg err'; };

    // preselect service from ?service=…
    const wanted = new URLSearchParams(location.search).get('service');
    const sel = $('#service');
    if (wanted && sel) { const opt = [...sel.options].find((o) => o.value.toLowerCase() === wanted.toLowerCase()); if (opt) sel.value = opt.value; }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.hidden = true;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const label = submit.textContent;
      submit.disabled = true; submit.textContent = 'Sending…';
      try {
        const body = new URLSearchParams(new FormData(form)).toString();
        const res = await fetch('https://api.lazyforms.com/f/73c56d26-630a-43fc-bb4f-2ab1cf6ca817', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        });
        if (!res.ok) throw new Error('bad status ' + res.status);
        // Show inline success panel, then redirect to thanks page
        const done = $('#form-done');
        form.hidden = true;
        done.hidden = false;
        done.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        setTimeout(() => { window.location.href = 'thanks.html'; }, 2000);
      } catch (err) {
        submit.disabled = false; submit.textContent = label;
        showError('Could not send right now. Please message me on WhatsApp (0328 0402045) or email info.mfahad1@gmail.com — I reply fast.');
      }
    });
  }
})();
