/* ============================================================
   RHINO WINDOW TINT — Site interactions
   ============================================================ */
(() => {
  'use strict';

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('menu-open');
    });
    document.querySelectorAll('.mobile-nav .nav-link').forEach(a => {
      a.addEventListener('click', () => document.body.classList.remove('menu-open'));
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const dur = parseInt(el.dataset.duration || '1400', 10);
        const start = performance.now();
        const step = now => {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target.toFixed(decimals);
        };
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => co.observe(el));
  }

  /* ---------- Tint visualizer ---------- */
  document.querySelectorAll('[data-visualizer]').forEach(viz => {
    const layer = viz.querySelector('.tint-layer');
    const pctEl = viz.querySelector('[data-tint-pct]');
    const buttons = viz.querySelectorAll('.controls button');
    const set = (pct, btn) => {
      // pct = VLT (light transmission). Lower = darker
      const opacity = 1 - (pct / 100);
      // tint color tinted slightly cool
      layer.style.background = `linear-gradient(180deg, rgba(2,4,10,${opacity * 0.95}) 0%, rgba(2,4,10,${opacity * 0.85}) 100%)`;
      if (pctEl) pctEl.textContent = pct + '%';
      buttons.forEach(b => b.classList.toggle('active', b === btn));
    };
    buttons.forEach(b => b.addEventListener('click', () => set(parseInt(b.dataset.pct, 10), b)));
    // initial
    const def = viz.querySelector('.controls button.active') || buttons[1];
    if (def) set(parseInt(def.dataset.pct, 10), def);
  });

  /* ---------- Reviews carousel: drag scroll ---------- */
  document.querySelectorAll('.reviews-strip').forEach(strip => {
    let isDown = false, startX = 0, scrollLeft = 0;
    strip.addEventListener('mousedown', e => {
      isDown = true;
      strip.style.cursor = 'grabbing';
      startX = e.pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
    });
    strip.addEventListener('mouseleave', () => { isDown = false; strip.style.cursor = ''; });
    strip.addEventListener('mouseup', () => { isDown = false; strip.style.cursor = ''; });
    strip.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - strip.offsetLeft;
      strip.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });
  });

  /* ---------- Gallery filter ---------- */
  document.querySelectorAll('[data-gallery]').forEach(g => {
    const filterBtns = g.querySelectorAll('.filters button');
    const items = g.querySelectorAll('.gallery-item');
    filterBtns.forEach(b => b.addEventListener('click', () => {
      filterBtns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const f = b.dataset.filter;
      items.forEach(it => {
        const cats = (it.dataset.cat || '').split(' ');
        const show = f === 'all' || cats.includes(f);
        it.style.display = show ? '' : 'none';
      });
    }));
  });

  /* ---------- Lightbox ---------- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('.lb-img');
    const close = lightbox.querySelector('.lb-close');
    document.querySelectorAll('.gallery-item').forEach(it => {
      it.addEventListener('click', () => {
        const thumb = it.querySelector('.thumb');
        const bg = thumb ? getComputedStyle(thumb).backgroundImage : '';
        if (lbImg) lbImg.style.backgroundImage = bg;
        lightbox.classList.add('open');
      });
    });
    const closeLB = () => lightbox.classList.remove('open');
    close && close.addEventListener('click', closeLB);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLB(); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close siblings (single-open accordion)
      item.parentElement.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ---------- Before/After compare slider ---------- */
  document.querySelectorAll('.compare').forEach(c => {
    const handle = c.querySelector('.handle');
    let active = false;
    const setPos = clientX => {
      const rect = c.getBoundingClientRect();
      let p = ((clientX - rect.left) / rect.width) * 100;
      p = Math.max(0, Math.min(100, p));
      c.style.setProperty('--pos', p + '%');
    };
    const start = e => { active = true; e.preventDefault(); };
    const move = e => {
      if (!active) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(x);
    };
    const end = () => { active = false; };
    handle && handle.addEventListener('mousedown', start);
    handle && handle.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move, { passive: true });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);
    c.addEventListener('click', e => { setPos(e.clientX); });
  });

  /* ---------- Multi-step quote form ---------- */
  document.querySelectorAll('[data-multistep]').forEach(form => {
    const steps = form.querySelectorAll('.form-step');
    const segs = form.querySelectorAll('.form-progress .seg');
    let idx = 0;

    const show = i => {
      idx = Math.max(0, Math.min(steps.length - 1, i));
      steps.forEach((s, n) => s.classList.toggle('active', n === idx));
      segs.forEach((s, n) => s.classList.toggle('active', n <= idx));
    };

    form.addEventListener('click', e => {
      const next = e.target.closest('[data-next]');
      const back = e.target.closest('[data-back]');
      const choice = e.target.closest('.choice');
      if (next) {
        const cur = steps[idx];
        const required = cur.querySelectorAll('[data-required]');
        let ok = true;
        const err = cur.querySelector('.form-error');
        if (err) err.textContent = '';
        required.forEach(r => {
          if (r.classList.contains('choice-grid')) {
            if (!r.querySelector('.choice.selected')) ok = false;
          } else if (!r.value || (r.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.value))) {
            ok = false; r.classList.add('invalid');
          } else {
            r.classList.remove('invalid');
          }
        });
        if (!ok) { if (err) err.textContent = 'Please complete the highlighted fields.'; return; }
        show(idx + 1);
      }
      if (back) show(idx - 1);
      if (choice) {
        const group = choice.parentElement;
        const multi = group.dataset.multi === 'true';
        if (!multi) group.querySelectorAll('.choice').forEach(c => c.classList.remove('selected'));
        choice.classList.toggle('selected');
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      // Replace with real backend submission. For now we display a thank-you state.
      form.querySelector('.form-shell').innerHTML = `
        <div class="form-success">
          <div class="check"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
          <h3 style="font-family:'Anton',sans-serif;text-transform:uppercase;font-size:48px;letter-spacing:-0.01em;line-height:1;margin-bottom:12px;">Quote received</h3>
          <p style="max-width:48ch;margin:0 auto;color:var(--ink-2);">Thanks — we got your details. A team member will reach out within one business day with your custom quote and next available appointment.</p>
          <div style="margin-top:24px;display:inline-flex;gap:12px;flex-wrap:wrap;justify-content:center;">
            <a class="btn btn-ghost" href="tel:+12252107353">Call (225) 210-7353</a>
            <a class="btn btn-primary" href="index.html">Back to home</a>
          </div>
        </div>`;
    });

    show(0);
  });

  /* ---------- Marquee duplication (clone children for seamless loop) ---------- */
  document.querySelectorAll('.marquee-track').forEach(track => {
    Array.from(track.children).forEach(child => {
      const clone = child.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });
})();

/* ============================================================
   GOOGLE REVIEWS HOOK
   To go live: replace fetchLiveReviews() with a server-side
   endpoint that proxies the Google Places API:
     GET /api/google-reviews?placeId=YOUR_PLACE_ID
   The endpoint should return JSON: { rating, total, reviews: [...] }
   Then the function below will hydrate any element with data-google-reviews.
   ============================================================ */
async function fetchLiveReviews() {
  // TODO: wire this to your backend proxy. Until then, returns null and
  // the static fallback markup remains visible.
  return null;
  /*
  const res = await fetch('/api/google-reviews');
  if (!res.ok) return null;
  return res.json();
  */
}

(async function hydrateReviews() {
  const target = document.querySelector('[data-google-reviews]');
  if (!target) return;
  const data = await fetchLiveReviews();
  if (!data) return;
  // Update aggregate
  const rating = document.querySelector('[data-google-rating]');
  const total = document.querySelector('[data-google-total]');
  if (rating) rating.textContent = data.rating.toFixed(1);
  if (total) total.textContent = data.total;
  // Replace cards
  target.innerHTML = data.reviews.map(r => `
    <article class="review-card">
      <div class="stars">${'★'.repeat(Math.round(r.rating))}</div>
      <blockquote>${r.text}</blockquote>
      <div class="who">
        <div class="av">${(r.author||'?').slice(0,1).toUpperCase()}</div>
        <div class="meta">
          <span class="name">${r.author}</span>
          <span class="src">Google · ${r.relativeTime || ''}</span>
        </div>
      </div>
    </article>`).join('');
})();
