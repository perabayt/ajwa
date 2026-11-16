/* =========================================================
   AJWA Hotels — etkileşim katmanı · v2
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  html.classList.add('js');

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mobile = () => innerWidth <= 760;
  const hasGsap = typeof gsap !== 'undefined';
  const ROOMS = window.AJWA_ROOMS || [];
  const AM = window.AJWA_AM || {};
  let AR = window.AJWA_AR || {};
  let lang = ({ en: 'en', ar: 'ar' })[store.get('ajwa-lang')] || 'tr';
  const L = () => (lang === 'en' ? 1 : lang === 'ar' ? 2 : 0);
  /* Arapça: üçüncü değer verilmişse o, yoksa İngilizce metnin sözlük karşılığı */
  const T = (tr, en, ar) => (lang === 'en' ? en : lang === 'ar' ? (ar ?? AR[en] ?? en) : tr);
  /* [tr, en] dizilerine Arapça üçüncü öğeyi ekle (data.js değişmeden kalır) */
  const withAr = arr => { if (Array.isArray(arr) && arr.length >= 2) arr[2] = AR[arr[1]] ?? arr[1]; return arr; };
  const fillAr = () => { ROOMS.forEach(r => ['name', 'group', 'bed', 'view', 'tag', 'desc', 'who'].forEach(f => withAr(r[f]))); Object.values(AM).forEach(withAr); };
  fillAr();
  /* Arapça sözlük ve yazı tipleri yalnız gerektiğinde yüklenir (Türkçe/İngilizce açılışta 0 bayt) */
  const AR_FONTS = 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@300;400;500;700&display=swap';
  const loadAr = done => {
    if (!document.querySelector(`link[href="${AR_FONTS}"]`)) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = AR_FONTS; document.head.appendChild(l); }
    if (window.AJWA_AR) { AR = window.AJWA_AR; fillAr(); return done(); }
    const sc = document.createElement('script'); sc.src = 'js/ar.js';
    sc.onload = () => { AR = window.AJWA_AR || {}; fillAr(); HOTELS.forEach(h => withAr(h.alt)); done(); };
    sc.onerror = () => done();
    document.head.appendChild(sc);
  };
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const img = (n, s) => `img/${n}${s ? '-s' : ''}.webp`;
  const pad2 = n => String(n).padStart(2, '0');
  const ARROW = '<svg viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const onView = (el, cb, threshold = .35) => new IntersectionObserver(es => es.forEach(e => cb(e.isIntersecting)), { threshold }).observe(el);

  /* Zamanlayıcı: duraklatılabilir, kalan süreyi hatırlar */
  class Auto {
    constructor(dur, fire) { this.dur = dur; this.fire = fire; this.why = new Set(); this.rem = dur; this.t = null; this.t0 = performance.now(); }
    restart() { clearTimeout(this.t); this.rem = this.dur; this.t0 = performance.now(); if (!this.why.size) this.t = setTimeout(() => this.fire(), this.rem); }
    pause(r) { if (!this.why.size) { clearTimeout(this.t); this.rem -= performance.now() - this.t0; } this.why.add(r); }
    resume(r) { if (!this.why.delete(r) || this.why.size) return; this.t0 = performance.now(); this.t = setTimeout(() => this.fire(), Math.max(200, this.rem)); }
    get paused() { return this.why.size > 0; }
  }

  /* ---------------- Yumuşak kaydırma ---------------- */
  let lenis = null;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: t => 1 - Math.pow(1 - t, 3.2), smoothWheel: true });
    if (hasGsap) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  const scrollTo = (target, opts = {}) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, ...opts });
    else typeof target === 'number' ? window.scrollTo({ top: target }) : $(target)?.scrollIntoView();
  };
  let locked = false;
  const lock = on => { locked = on; if (lenis) on ? lenis.stop() : lenis.start(); document.body.style.overflow = on ? 'hidden' : ''; };

  /* ---------------- Dil ---------------- */
  const splitWords = (el, cls) => {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = cls;
          if (cls === 'ln') { const i = document.createElement('span'); i.textContent = part; w.appendChild(i); } else w.textContent = part;
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
  };
  const shows = [];
  const langHooks = [];
  function applyLang(first) {
    html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-en]').forEach(el => { if (el.dataset.tr === undefined) el.dataset.tr = el.innerHTML; el.innerHTML = lang === 'en' ? el.dataset.en : lang === 'ar' ? (AR[el.dataset.en] ?? el.dataset.en) : el.dataset.tr; });
    /* yalnız Arapçada değişen özel adlar (TR ve EN'de aynı) */
    $$('[data-ar]:not([data-en])').forEach(el => { if (el.dataset.tr === undefined) el.dataset.tr = el.innerHTML; el.innerHTML = lang === 'ar' ? el.dataset.ar : el.dataset.tr; });
    $$('.lang button').forEach(b => b.classList.toggle('is-on', b.dataset.lang === lang));
    $$('[data-cursor]').forEach(el => (el.dataset.cursor = T('Keşfet', 'Discover')));
    document.title = T('AJWA Hotels — İstanbul ve Kapadokya\'nın Eşsiz Mücevherleri', 'AJWA Hotels — Luxury Hotels in Istanbul and Cappadocia');
    renderCaves();
    shows.forEach(s => s.render(false));
    langHooks.forEach(f => f());
    closePop(); forms.forEach(f => f._sync());
    if (!first) { rails.forEach(r => r !== caveAuto && r.build()); setupSplits(true); window.ScrollTrigger?.refresh(); }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('.lang button');
    if (!b || b.dataset.lang === lang) return;
    const set = () => { lang = b.dataset.lang; store.set('ajwa-lang', lang); applyLang(false); };
    b.dataset.lang === 'ar' && !window.AJWA_AR ? loadAr(set) : set();
  });

  /* ---------------- Metin animasyonları ---------------- */
  let wordTweens = [];
  function setupSplits(instant) {
    wordTweens.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
    wordTweens = [];
    $$('.js-lines').forEach(el => {
      splitWords(el, 'ln');
      const inner = $$('.ln > span', el);
      if (!hasGsap || reduce || instant) return;
      gsap.set(inner, { yPercent: 110 });
      wordTweens.push(gsap.to(inner, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: .045, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
    });
    $$('.js-words').forEach(el => {
      splitWords(el, 'w');
      const words = $$('.w', el);
      if (!hasGsap || reduce) { words.forEach(w => (w.style.opacity = 1)); return; }
      wordTweens.push(gsap.to(words, { opacity: 1, stagger: .08, ease: 'none', scrollTrigger: { trigger: el.closest('section') || el, start: 'top 85%', end: 'top 18%', scrub: .6 } }));
    });
  }

  /* ---------------- Saat ---------------- */
  const clock = $('.js-clock');
  const tick = () => { if (clock) clock.textContent = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' }).format(new Date()); };
  tick(); setInterval(tick, 15000);

  /* ---------------- Rezervasyon ---------------- */
  const iso = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  function bookingUrl({ hotel, inD, outD, a, c }) {
    if (hotel === 'cappadocia') return `https://be.synxis.com/?adult=${a}&arrive=${inD}&chain=10237&child=${c}&currency=EUR&depart=${outD}&hotel=47061&level=hotel&locale=${lang === 'tr' ? 'tr-TR' : 'en-US'}&productcurrency=EUR&rooms=1`;
    return `https://ajwasultanahmet.barboon.net/search-result?checkIn=${inD}&checkOut=${outD}&adultCount=${a}&childCount=${c}&roomCount=1&adultCountRoom1=${a}&childCountRoom1=${c}&promotionCode=&language=${lang === 'tr' ? 'TR' : 'EN'}&currency=${lang === 'tr' ? 'TRY' : 'EUR'}`;
  }
  const parseISO = s => { if (!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const loc = () => (lang === 'en' ? 'en-GB' : lang === 'ar' ? 'ar-u-nu-latn' : 'tr-TR');
  const HOTELS = [
    { v: 'sultanahmet', ad: 'AJWA Sultanahmet', alt: ['İstanbul · Tarihi yarımada', 'Istanbul · Historic peninsula'] },
    { v: 'homes', ad: 'AJWA Homes', alt: ['İstanbul · Tarihi konaklar', 'Istanbul · Historic residences'] },
    { v: 'cappadocia', ad: 'AJWA Cappadocia', alt: ['Kapadokya · Mustafapaşa', 'Cappadocia · Mustafapaşa'] }
  ];
  HOTELS.forEach(h => withAr(h.alt));
  const forms = [];

  /* Açılır panel (takvim ve otel listesi): tarayıcının beyaz yerel seçicileri yerine temaya uygun */
  const pop = $('.pop');
  const picker = { form: null, kind: null, view: null, pick: 'in', anchor: null };
  function closePop() { if (!picker.kind) return; pop.classList.remove('is-open'); pop.setAttribute('aria-hidden', 'true'); picker.anchor?.classList.remove('is-active'); picker.kind = null; }
  function placePop() {
    const a = picker.anchor.getBoundingClientRect(), m = innerWidth <= 760;
    if (m) { Object.assign(pop.style, { left: '12px', right: '12px', top: 'auto', bottom: '12px', width: 'auto' }); return; }
    const w = pop.offsetWidth, h = pop.offsetHeight;
    const below = a.bottom + 10 + h < innerHeight - 8;
    Object.assign(pop.style, { right: 'auto', bottom: 'auto', width: '', left: clamp(lang === 'ar' ? a.right - w : a.left, 12, innerWidth - w - 12) + 'px', top: (below ? a.bottom + 10 : Math.max(12, a.top - h - 10)) + 'px' });
  }
  function openPop(form, kind, anchor) {
    closePop();
    Object.assign(picker, { form, kind, anchor });
    anchor.classList.add('is-active');
    if (kind !== 'hotel') {
      picker.pick = kind;
      const base = parseISO(form.elements.in.value) || new Date();
      picker.view = new Date(base.getFullYear(), base.getMonth(), 1);
    }
    renderPop();
    pop.classList.add('is-open'); pop.setAttribute('aria-hidden', 'false');
    placePop();
  }
  function renderPop() {
    const f = picker.form;
    if (picker.kind === 'hotel') {
      pop.className = 'pop pop--list is-open';
      pop.innerHTML = `<p class="pop__t">${T('Otel seçin', 'Choose a hotel')}</p>` + HOTELS.map(h => `<button type="button" class="pop__opt${f.elements.hotel.value === h.v ? ' is-on' : ''}" data-hotel-v="${h.v}"><b>${h.ad}</b><small>${h.alt[L()]}</small><i aria-hidden="true"></i></button>`).join('');
      return;
    }
    pop.className = 'pop pop--cal is-open';
    const inD = parseISO(f.elements.in.value), outD = parseISO(f.elements.out.value);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const months = innerWidth > 760 ? 2 : 1;
    const wd = [...Array(7)].map((_, k) => lang === 'ar' ? new Intl.DateTimeFormat(loc(), { weekday: 'long' }).format(new Date(2024, 0, 1 + k)).replace(/^ال/, '').slice(0, 2) : new Intl.DateTimeFormat(loc(), { weekday: 'short' }).format(new Date(2024, 0, 1 + k)).slice(0, 2));
    let html = `<div class="cal__head"><button type="button" class="cal__nav" data-cal="-1" aria-label="${T('Önceki ay', 'Previous month')}"${picker.view <= new Date(today.getFullYear(), today.getMonth(), 1) ? ' disabled' : ''}>‹</button>
      <p class="cal__hint">${picker.pick === 'in' ? T('Giriş tarihini seçin', 'Select your check-in date') : T('Çıkış tarihini seçin', 'Select your check-out date')}</p>
      <button type="button" class="cal__nav" data-cal="1" aria-label="${T('Sonraki ay', 'Next month')}">›</button></div><div class="cal__months">`;
    for (let m = 0; m < months; m++) {
      const first = new Date(picker.view.getFullYear(), picker.view.getMonth() + m, 1);
      const lead = (first.getDay() + 6) % 7, days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      html += `<div class="cal__m"><p class="cal__mt">${new Intl.DateTimeFormat(loc(), { month: 'long', year: 'numeric' }).format(first)}</p><div class="cal__g">${wd.map(w => `<span class="cal__wd">${w}</span>`).join('')}${'<span></span>'.repeat(lead)}`;
      for (let d = 1; d <= days; d++) {
        const dt = new Date(first.getFullYear(), first.getMonth(), d), t = dt.getTime();
        const c = ['cal__d'];
        if (dt < today) c.push('is-past');
        if (+dt === +today) c.push('is-today');
        if (inD && t === inD.getTime()) c.push('is-in');
        if (outD && t === outD.getTime()) c.push('is-out');
        if (inD && outD && t > inD.getTime() && t < outD.getTime()) c.push('is-range');
        html += `<button type="button" class="${c.join(' ')}" data-d="${iso(dt)}"${dt < today ? ' disabled' : ''}>${d}</button>`;
      }
      html += '</div></div>';
    }
    const n = inD && outD ? Math.round((outD - inD) / 864e5) : 0;
    html += `</div><div class="cal__foot"><span>${n ? `<b>${n}</b> ${T('gece', n === 1 ? 'night' : 'nights', n === 1 ? 'ليلة' : n === 2 ? 'ليلتان' : n <= 10 ? 'ليالٍ' : 'ليلة')}` : T('Çıkış tarihini seçin', 'Select your check-out date')}</span><button type="button" class="btn btn--gold cal__ok"${n ? '' : ' disabled'}>${T('Tamam', 'Done')}</button></div>`;
    pop.innerHTML = html;
  }
  pop.addEventListener('mouseover', e => {
    if (picker.kind === 'hotel' || picker.pick !== 'out') return;
    const b = e.target.closest('.cal__d'); const inD = parseISO(picker.form.elements.in.value); if (!b || !inD) return;
    const h = parseISO(b.dataset.d);
    $$('.cal__d', pop).forEach(x => { const t = parseISO(x.dataset.d); x.classList.toggle('is-hover', h > inD && t > inD && t <= h); });
  });
  pop.addEventListener('click', e => {
    const f = picker.form; if (!f) return;
    const o = e.target.closest('[data-hotel-v]');
    if (o) { f._setHotel(o.dataset.hotelV); closePop(); return; }
    const nav = e.target.closest('[data-cal]');
    if (nav) { picker.view = new Date(picker.view.getFullYear(), picker.view.getMonth() + +nav.dataset.cal, 1); renderPop(); return; }
    if (e.target.closest('.cal__ok')) { closePop(); return; }
    const d = e.target.closest('.cal__d'); if (!d || d.disabled) return;
    const v = parseISO(d.dataset.d), inD = parseISO(f.elements.in.value);
    if (picker.pick === 'in' || !inD || v <= inD) {
      f.elements.in.value = d.dataset.d;
      const outD = parseISO(f.elements.out.value);
      if (!outD || outD <= v) f.elements.out.value = '';
      picker.pick = 'out';
      f._sync(); renderPop(); placePop();
      if (picker.anchor) { picker.anchor.classList.remove('is-active'); picker.anchor = f.querySelector('[data-pick="out"]'); picker.anchor.classList.add('is-active'); }
    } else {
      f.elements.out.value = d.dataset.d; f._sync(); renderPop();
      setTimeout(closePop, 260);
    }
  });
  document.addEventListener('pointerdown', e => { if (picker.kind && !pop.contains(e.target) && !e.target.closest('[data-pick]')) closePop(); }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && picker.kind) { e.stopImmediatePropagation(); closePop(); } }, true);
  window.addEventListener('resize', closePop);
  window.addEventListener('scroll', () => { if (picker.kind && !locked) closePop(); }, { passive: true });

  function wireForm(form) {
    const fin = form.elements.in, fout = form.elements.out, today = new Date();
    fin.value = iso(addDays(today, 14)); fout.value = iso(addDays(today, 17));
    const fmt = (el, v) => {
      const d = parseISO(v);
      $('b', el).textContent = d ? new Intl.DateTimeFormat(loc(), { day: 'numeric', month: 'short', year: 'numeric' }).format(d) : T('Seçin', 'Select a date');
      $('small', el).textContent = d ? new Intl.DateTimeFormat(loc(), { weekday: 'long' }).format(d) : '';
    };
    form._sync = () => {
      fmt(form.querySelector('[data-pick="in"]'), fin.value); fmt(form.querySelector('[data-pick="out"]'), fout.value);
      $('[data-pick="hotel"] b', form).textContent = (HOTELS.find(h => h.v === form.elements.hotel.value) || HOTELS[0]).ad;
    };
    form._setHotel = v => { form.elements.hotel.value = v; form._sync(); };
    form._sync();
    form.addEventListener('click', e => {
      const p = e.target.closest('[data-pick]');
      if (p) { if (picker.kind && picker.anchor === p) closePop(); else openPop(form, p.dataset.pick, p); return; }
      const b = e.target.closest('[data-step]'); if (!b) return;
      const [k, d] = b.dataset.step.split(':');
      const o = form.querySelector(`output[name="${k}"]`), lim = k === 'a' ? [1, 8] : [0, 4];
      o.value = o.textContent = clamp(+o.textContent + +d, lim[0], lim[1]);
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!fin.value || !fout.value) { openPop(form, fin.value ? 'out' : 'in', form.querySelector(`[data-pick="${fin.value ? 'out' : 'in'}"]`)); return; }
      window.open(bookingUrl({ hotel: form.elements.hotel.value, inD: fin.value, outD: fout.value, a: form.querySelector('output[name="a"]').textContent, c: form.querySelector('output[name="c"]').textContent }), '_blank', 'noopener');
    });
    forms.push(form);
  }
  const heroForm = $('.js-bookform'), sheet = $('.sheet');
  const sheetForm = heroForm.cloneNode(true);
  sheetForm.querySelector('.bookbar__note')?.remove();
  $('.sheet__form').appendChild(sheetForm);
  wireForm(heroForm); wireForm(sheetForm);
  const roomEl = $('.room');
  const openSheet = hotel => { if (hotel) sheetForm._setHotel(hotel); sheet.classList.add('is-open'); sheet.setAttribute('aria-hidden', 'false'); lock(true); };
  const closeSheet = () => { closePop(); sheet.classList.remove('is-open'); sheet.setAttribute('aria-hidden', 'true'); if (!roomEl.classList.contains('is-open')) lock(false); };
  document.addEventListener('click', e => { const b = e.target.closest('.js-book'); if (b) { closeMenu(); openSheet(b.dataset.hotel); } });
  $('.sheet__veil').addEventListener('click', closeSheet);
  $('.sheet__x').addEventListener('click', closeSheet);

  /* ---------------- Vakit ve kıble ----------------
     Diyanet yöntemi: imsak 18°, yatsı 17°, ikindi gölge katsayısı 1, temkinler (dk): güneş −7, öğle +5, ikindi +4, akşam +7.
     api.aladhan.com method=13 ile karşılaştırıldı (tools/vakit-test.mjs): ±2 dk. Türkiye saati sabit UTC+3. */
  const PRAY = (() => {
    const R = Math.PI / 180;
    const sin = d => Math.sin(d * R), cos = d => Math.cos(d * R), tan = d => Math.tan(d * R);
    const asin = x => Math.asin(x) / R, acos = x => Math.acos(x) / R, atan2 = (y, x) => Math.atan2(y, x) / R, acot = x => Math.atan(1 / x) / R;
    const fix = (a, b) => { a -= b * Math.floor(a / b); return a < 0 ? a + b : a; };
    function times(y, m, d, lat, lng) {
      if (m <= 2) { y--; m += 12; }
      const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
      const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 - lng / 360;
      const sun = t => {
        const D = jd + t - 2451545, g = fix(357.529 + .98560028 * D, 360), q = fix(280.459 + .98564736 * D, 360);
        const L = fix(q + 1.915 * sin(g) + .02 * sin(2 * g), 360), e = 23.439 - .00000036 * D;
        return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - fix(atan2(cos(e) * sin(L), cos(L)) / 15, 24) };
      };
      const noon = t => fix(12 - sun(t / 24).eqt, 24);
      const at = (ang, t, ccw) => { const { decl } = sun(t / 24); const T = acos((-sin(ang) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat))) / 15; return noon(t) + (ccw ? -T : T); };
      const asr = t => { const { decl } = sun(t / 24); return at(-acot(1 + tan(Math.abs(lat - decl))), t); };
      let t = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, maghrib: 18, isha: 18 };
      for (let k = 0; k < 2; k++) t = { fajr: at(18, t.fajr, 1), sunrise: at(.833, t.sunrise, 1), dhuhr: noon(t.dhuhr), asr: asr(t.asr), maghrib: at(.833, t.maghrib), isha: at(17, t.isha) };
      const tk = { sunrise: -7, dhuhr: 5, asr: 4, maghrib: 7 };
      return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, Math.round((v + 3 - lng / 15) * 60 + (tk[k] || 0))]));
    }
    const qibla = (lat, lng) => fix(atan2(sin(39.8262 - lng), cos(lat) * tan(21.4225) - sin(lat) * cos(39.8262 - lng)), 360);
    return { times, qibla };
  })();
  (() => {
    const sec = $('.faith'); if (!sec) return;
    const CITY = {
      ist: { lat: 41.0068, lng: 28.9718, ad: ['İstanbul · Sultanahmet', 'Istanbul · Sultanahmet', 'إسطنبول · السلطان أحمد'] },
      cap: { lat: 38.5786, lng: 34.8956, ad: ['Kapadokya · Mustafapaşa', 'Cappadocia · Mustafapaşa', 'كابادوكيا · مصطفى باشا'] }
    };
    const NAMES = { fajr: ['İmsak', 'Fajr', 'الفجر'], sunrise: ['Güneş', 'Sunrise', 'الشروق'], dhuhr: ['Öğle', 'Dhuhr', 'الظهر'], asr: ['İkindi', 'Asr', 'العصر'], maghrib: ['Akşam', 'Maghrib', 'المغرب'], isha: ['Yatsı', 'Isha', 'العشاء'] };
    const DIRS = [['kuzey', 'north', 'الشمال'], ['kuzeydoğu', 'north-east', 'الشمال الشرقي'], ['doğu', 'east', 'الشرق'], ['güneydoğu', 'south-east', 'الجنوب الشرقي'], ['güney', 'south', 'الجنوب'], ['güneybatı', 'south-west', 'الجنوب الغربي'], ['batı', 'west', 'الغرب'], ['kuzeybatı', 'north-west', 'الشمال الغربي']];
    let city = 'ist';
    const hm = m => `${pad2(Math.floor(m / 60) % 24)}:${pad2(m % 60)}`;
    const trNow = () => { const d = new Date(Date.now() + 3 * 3600e3); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), min: d.getUTCHours() * 60 + d.getUTCMinutes(), date: d }; };
    const arc = $('.faith__arc'), list = $('.faith__times'), nextEl = $('.faith__next'), dateEl = $('.faith__date');
    const X = f => 300 - 270 * Math.cos(Math.PI * f), Y = f => 196 - 156 * Math.sin(Math.PI * f);
    function render() {
      const c = CITY[city], n = trNow(), t = PRAY.times(n.y, n.m, n.d, c.lat, c.lng), k = L();
      const keys = Object.keys(NAMES);
      let next = keys.find(x => t[x] > n.min), left;
      if (next) left = t[next] - n.min;
      else { const tm = new Date(n.date.getTime() + 864e5); next = 'fajr'; left = PRAY.times(tm.getUTCFullYear(), tm.getUTCMonth() + 1, tm.getUTCDate(), c.lat, c.lng).fajr + 1440 - n.min; }
      const cur = [...keys].reverse().find(x => t[x] <= n.min);
      list.innerHTML = keys.map(x => `<li class="${x === next ? 'is-next' : ''}${x === cur ? ' is-now' : ''}"><span>${NAMES[x][k]}</span><b>${hm(t[x])}</b></li>`).join('');
      const h = Math.floor(left / 60), mm = left % 60;
      const dur = lang === 'ar' ? `${h ? h + ' س ' : ''}${mm} د` : lang === 'en' ? `${h ? h + ' h ' : ''}${mm} min` : `${h ? h + ' sa ' : ''}${mm} dk`;
      nextEl.innerHTML = T(`${NAMES[next][0]} vaktine <b>${dur}</b>`, `${NAMES[next][1]} in <b>${dur}</b>`, `${NAMES[next][2]} بعد <b>${dur}</b>`);
      const day = new Date(Date.UTC(n.y, n.m - 1, n.d, 12));
      const greg = new Intl.DateTimeFormat(loc(), { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long', timeZone: 'UTC' }).format(day);
      let hijri = '';
      try { hijri = new Intl.DateTimeFormat((lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-GB' : 'tr-TR') + '-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(day); } catch (e) {}
      dateEl.innerHTML = `<span>${c.ad[k]}</span><span>${greg}${hijri ? ' · ' + hijri : ''}</span>`;
      // gün yayı: imsaktan yatsıya; ufuk çizgisi güneş doğuşu ile batışı arasında
      const span = t.isha - t.fajr, f = x => (t[x] - t.fajr) / span;
      const fr = f('sunrise'), fs = f('maghrib');
      const dots = keys.map(x => `<circle class="faith__dot${x === next ? ' is-next' : ''}" cx="${X(f(x)).toFixed(1)}" cy="${Y(f(x)).toFixed(1)}" r="${x === next ? 6 : 4}"/>`).join('');
      const fn = (n.min - t.fajr) / span, up = fn >= 0 && fn <= 1;
      const sunXY = up ? [X(fn), Y(fn)] : [300, 196];
      arc.innerHTML = `<path class="faith__path" d="M30,196 A270,156 0 0 1 570,196"/>
        <path class="faith__day" d="M${X(fr).toFixed(1)},${Y(fr).toFixed(1)} A270,156 0 0 1 ${X(fs).toFixed(1)},${Y(fs).toFixed(1)}"/>
        <line class="faith__hz" x1="0" y1="${((Y(fr) + Y(fs)) / 2).toFixed(1)}" x2="600" y2="${((Y(fr) + Y(fs)) / 2).toFixed(1)}"/>${dots}
        ${up ? `<g class="faith__sun" transform="translate(${sunXY[0].toFixed(1)},${sunXY[1].toFixed(1)})"><circle r="15"/><circle r="8"/></g>` : `<g class="faith__moon" transform="translate(300,150)"><path d="M6,-12 A13,13 0 1 0 6,12 A10,10 0 1 1 6,-12Z"/></g>`}`;
      const q = PRAY.qibla(c.lat, c.lng);
      $('.faith__needle').style.transform = `rotate(${q.toFixed(1)}deg)`;
      $('.faith__qdeg').textContent = `${Math.round(q)}°`;
      $('.faith__qdir').textContent = DIRS[Math.round(q / 45) % 8][k];
    }
    $$('.faith__tabs button').forEach(b => b.addEventListener('click', () => { city = b.dataset.city; $$('.faith__tabs button').forEach(x => x.classList.toggle('is-on', x === b)); render(); }));
    render();
    langHooks.push(render);
    let iv; onView(sec, v => { clearInterval(iv); if (v) { render(); iv = setInterval(render, 30000); } }, .05);
  })();

  /* ---------------- Oda bulucu ---------------- */
  (() => {
    const fx = $('.finder'); if (!fx) return;
    // her oda için uygunluk puanları (0–3): çift, aile, arkadaş/grup, yalnız/iş, manzara, ferahlık, karakter, dinginlik
    const S = {
      'deluxe-vertical-twin': [1, 0, 3, 3, 0, 1, 1, 3], 'deluxe-vertical-king': [3, 0, 0, 3, 0, 1, 1, 3],
      'deluxe-street-twin': [1, 0, 3, 3, 2, 1, 1, 1], 'deluxe-street-king': [3, 0, 0, 3, 2, 1, 1, 1],
      'deluxe-sea-king': [3, 0, 0, 2, 3, 2, 2, 2], 'family-suite': [0, 3, 2, 0, 0, 3, 1, 3],
      'corner-suite-street': [3, 1, 0, 1, 2, 3, 3, 1], 'corner-suite-sea': [3, 1, 0, 1, 3, 3, 3, 2], 'sultan-suite': [3, 2, 0, 1, 3, 3, 3, 2],
      'kervansaray-premium': [2, 3, 1, 1, 1, 3, 2, 3], 'kervansaray-deluxe': [2, 2, 1, 1, 1, 2, 2, 3], 'kervansaray-superior': [1, 0, 3, 3, 2, 1, 1, 3],
      'sakura-junior': [3, 2, 0, 0, 3, 2, 2, 2], 'sakura-deluxe': [3, 0, 1, 1, 3, 1, 2, 2], 'sakura-superior': [2, 0, 1, 3, 1, 1, 1, 2],
      'carsi-junior': [2, 1, 3, 0, 1, 2, 3, 2], 'carsi-superior': [1, 0, 3, 3, 1, 1, 3, 2],
      'kilic-arslan': [1, 3, 3, 0, 2, 3, 3, 2], 'danismend-gazi': [2, 3, 2, 0, 1, 3, 3, 2], 'kadi-burhaneddin': [2, 3, 3, 0, 1, 3, 3, 2],
      'karamanoglu-ibrahim': [1, 3, 2, 0, 3, 3, 3, 2], 'nevsehirli-damat-ibrahim-pasa': [3, 1, 1, 0, 2, 3, 3, 2], 'alaeddin-ali-bey': [3, 0, 0, 1, 1, 2, 3, 3],
      'suleyman-celebi': [3, 1, 0, 0, 1, 3, 3, 2], 'merzifonlu-kara-mustafa-pasa': [3, 0, 0, 1, 2, 2, 3, 3], 'eretna-bey': [3, 1, 0, 0, 2, 2, 3, 2], 'nasireddin-mehmed': [3, 0, 0, 1, 1, 2, 3, 3]
    };
    const PARTY = { couple: 0, family: 1, friends: 2, solo: 3 }, WANT = { view: 4, space: 5, character: 6, calm: 7 };
    const sel = { where: 'any', party: 'couple', want: 'character' };
    const out = $('.finder__out');
    function render() {
      const list = ROOMS.filter(r => S[r.id] && (sel.where === 'any' || r.hotel === sel.where))
        .map(r => ({ r, p: S[r.id][PARTY[sel.party]] * 2 + S[r.id][WANT[sel.want]] * 2 + (r.size || 40) / 200 + (r.cave && sel.want === 'character' ? .5 : 0) }))
        .sort((a, b) => b.p - a.p).slice(0, 3);
      out.innerHTML = list.map(({ r }, i) => `<button class="fr" data-room="${r.id}" style="--d:${i * 90}ms">
          <span class="fr__img"><img src="${img(r.imgs[0], true)}" alt=""></span>
          <span class="fr__b"><small>${pad2(i + 1)} · ${r.hotel === 'sultanahmet' ? 'AJWA Sultanahmet' : 'AJWA Cappadocia'}</small><b>${r.name[L()]}</b><em>${r.tag[L()]}</em>
          <span class="fr__m">${[r.size ? r.size + ' ' + T('m²', 'm²', 'م²') : '', r.cave ? T('Mağara süit', 'Cave suite') : r.view ? r.view[L()] : r.group[L()]].filter(Boolean).join(' · ')}</span></span>
          <span class="fr__go">${ARROW}</span></button>`).join('');
    }
    fx.addEventListener('click', e => {
      const c = e.target.closest('[data-f]'); if (c) { sel[c.dataset.f] = c.dataset.v; $$(`[data-f="${c.dataset.f}"]`, fx).forEach(x => x.classList.toggle('is-on', x === c)); render(); return; }
      if (e.target.closest('[data-room]')) close();
    });
    const open = hotel => {
      if (hotel) { sel.where = hotel; $$('[data-f="where"]', fx).forEach(x => x.classList.toggle('is-on', x.dataset.v === hotel)); }
      render(); fx.classList.add('is-open'); fx.setAttribute('aria-hidden', 'false'); lock(true);
    };
    const close = () => { fx.classList.remove('is-open'); fx.setAttribute('aria-hidden', 'true'); if (!roomEl.classList.contains('is-open')) lock(false); };
    document.addEventListener('click', e => { const b = e.target.closest('.js-finder'); if (b) { closeMenu(); open(b.dataset.hotel); } });
    $('.finder .sheet__veil').addEventListener('click', close);
    $('.finder .sheet__x').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && fx.classList.contains('is-open') && !roomEl.classList.contains('is-open')) close(); });
    langHooks.push(() => fx.classList.contains('is-open') && render());
  })();

  /* ---------------- Otomatik kayan raylar ---------------- */
  const rails = [];
  class AutoRail {
    constructor(el) {
      this.el = el; this.speed = +el.dataset.auto || 32; this.pos = 0; this.why = new Set(); this.self = false;
      el.addEventListener('mouseenter', () => fine && this.why.add('hover'));
      el.addEventListener('mouseleave', () => this.why.delete('hover'));
      el.addEventListener('touchstart', () => { this.why.add('touch'); clearTimeout(this.rt); }, { passive: true });
      el.addEventListener('touchend', () => { this.rt = setTimeout(() => { this.pos = this.cur(); this.why.delete('touch'); }, 2600); });
      el.addEventListener('scroll', () => { if (!this.self && Math.abs(this.cur() - this.pos) > 2) this.pos = this.cur(); this.self = false; }, { passive: true });
      let down = false, sx = 0, sl = 0, moved = 0;
      el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = this.cur(); el.classList.add('is-drag'); this.why.add('drag'); });
      window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); this.set(sl - this.sg * dx); });
      window.addEventListener('pointerup', () => { if (!down) return; down = false; el.classList.remove('is-drag'); this.why.delete('drag'); if (moved > 6) { el.dataset.drag = 1; setTimeout(() => delete el.dataset.drag, 60); } });
      onView(el, v => (v ? this.why.delete('off') : this.why.add('off')), .05);
      // görseller ray ekrana bir ekran kala yüklenir
      new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { o.disconnect(); this.awake = true; this.wake(); } }, { rootMargin: '120% 0px' }).observe(el);
      this.build();
      rails.push(this);
    }
    build() {
      $$('.is-clone', this.el).forEach(c => c.remove());
      this.sg = getComputedStyle(this.el).direction === 'rtl' ? -1 : 1;
      const orig = [...this.el.children];
      this.span = 0;
      if (!orig.length) return;
      const add = () => orig.forEach(c => { const k = c.cloneNode(true); k.classList.add('is-clone'); k.setAttribute('aria-hidden', 'true'); $$('a,button', k).concat(k.matches('a,button') ? [k] : []).forEach(x => (x.tabIndex = -1)); this.el.appendChild(k); });
      add();
      this.span = Math.abs(this.el.children[orig.length].offsetLeft - orig[0].offsetLeft);
      let guard = 0;
      while (this.el.scrollWidth < this.span + this.el.clientWidth * 1.3 && guard++ < 4) add();
      this.wake();
      this.set(0);
    }
    wake() { if (!this.awake) return; $$('img[data-src]', this.el).forEach(im => { if (im.dataset.srcset) { im.srcset = im.dataset.srcset; im.removeAttribute('data-srcset'); } im.src = im.dataset.src; im.removeAttribute('data-src'); }); }
    cur() { return this.el.scrollLeft * (this.sg || 1); }
    set(v) { if (this.span > 0) { v %= this.span; if (v < 0) v += this.span; } this.pos = v; this.self = true; this.el.scrollLeft = v * (this.sg || 1); }
    step(dt) { if (this.why.size || reduce || !this.span) return; this.set(this.pos + this.speed * dt); }
    nudge(dir) {
      const w = (this.el.firstElementChild?.getBoundingClientRect().width || 300) + (parseFloat(getComputedStyle(this.el).columnGap) || 30);
      this.why.add('nudge'); const o = { v: this.pos };
      if (hasGsap) gsap.to(o, { v: this.pos + dir * w, duration: .9, ease: 'power3.inOut', onUpdate: () => this.set(o.v), onComplete: () => setTimeout(() => this.why.delete('nudge'), 1800) });
      else { this.set(this.pos + dir * w); this.why.delete('nudge'); }
    }
  }
  let lastT = performance.now();
  const railLoop = t => { const dt = Math.min(.05, (t - lastT) / 1000); lastT = t; rails.forEach(r => r.step(dt)); requestAnimationFrame(railLoop); };
  requestAnimationFrame(railLoop);

  /* ---------------- Mağara süitleri (taş çerçeveli) ---------------- */
  const caveRail = $('.caves__rail');
  let caveAuto = null;
  function renderCaves() {
    if (!caveRail) return;
    const caves = ROOMS.filter(r => r.cave);
    caveRail.innerHTML = caves.map((r, i) => `
      <button class="cave" data-room="${r.id}" data-cursor="${T('Keşfet', 'Discover')}">
        <div class="cave__frame">
          <div class="cave__photo"><img data-src="${img(r.imgs[0], true)}" alt="${r.name[L()]}" draggable="false"></div>
          <img class="cave__fr" data-src="img/frame-cave.webp" alt="" draggable="false">
          <span class="cave__plate">${ROMAN[i]}</span>
        </div>
        <div class="cave__body"><span class="cave__who">${r.who[L()]}</span><h4>${r.name[L()]}</h4><span class="cave__m">${r.size ? r.size + ' ' + T('m²', 'm²', 'م²') + ' · ' : ''}${T('Mağara süit', 'Cave suite')}</span></div>
      </button>`).join('');
    caveAuto?.build();
  }
  $('.cnav--n')?.addEventListener('click', () => caveAuto?.nudge(1));
  $('.cnav--p')?.addEventListener('click', () => caveAuto?.nudge(-1));

  /* ---------------- Oda vitrini ---------------- */
  class Show {
    constructor(sec) {
      this.sec = sec; this.hotel = sec.dataset.hotel;
      this.rooms = ROOMS.filter(r => r.hotel === this.hotel && !r.cave);
      this.stage = $('.show__stage', sec); this.card = $('.show__card', sec); this.thumbs = $('.show__thumbs', sec);
      this.i = 0; this.dur = 7000; this.tok = 0;
      // kemerle açılan geçiş için kırpma yolu + altın kenar
      this.cid = 'showArch-' + this.hotel;
      this.stage.insertAdjacentHTML('afterend', `<svg class="show__fx" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true"><defs><clipPath id="${this.cid}" clipPathUnits="objectBoundingBox"><path/></clipPath></defs><path class="show__edge" vector-effect="non-scaling-stroke"/></svg>`);
      this.clip = $(`#${this.cid} path`); this.edge = $('.show__edge', sec);
      sec.style.setProperty('--dur', this.dur + 'ms');
      this.auto = new Auto(this.dur, () => this.go(this.i + 1));
      this.auto.why.add('off');
      const pause = on => { on ? this.auto.pause('hover') : this.auto.resume('hover'); this.sync(); };
      [this.card, this.thumbs].forEach(el => { el.addEventListener('mouseenter', () => fine && pause(true)); el.addEventListener('mouseleave', () => fine && pause(false)); });
      onView(sec, v => { v ? this.auto.resume('off') : this.auto.pause('off'); this.sync(); }, .55);
      this.thumbs.addEventListener('click', e => {
        const b = e.target.closest('.st'); if (!b) return;
        const r = b.getBoundingClientRect(), s = this.sec.getBoundingClientRect();
        this.go(+b.dataset.k, [(r.left + r.width / 2 - s.left) / s.width * 100, (r.top - s.top) / s.height * 100]);
      });
      this.card.addEventListener('click', e => {
        const b = e.target.closest('[data-g]'); if (!b) return;
        this.paint(img(this.rooms[this.i].imgs[+b.dataset.g]), [50, 50]);
        $$('[data-g]', this.card).forEach(x => x.classList.toggle('is-on', x === b));
        this.auto.restart();
      });
      let x0 = null;
      this.stage.addEventListener('touchstart', e => (x0 = e.touches[0].clientX), { passive: true });
      this.stage.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) this.go(this.i + (dx < 0 ? 1 : -1)); x0 = null; });
      this.render(true);
      shows.push(this);
    }
    sync() { this.sec.classList.toggle('is-paused', this.auto.paused); }
    render(first) {
      const twin = this.hotel === 'sultanahmet';
      this.thumbs.innerHTML = this.rooms.map((x, k) => `<button class="st${k === this.i ? ' is-on' : ''}" data-k="${k}"><div class="st__img"><img src="${img(x.imgs[0], true)}" alt="" loading="lazy"></div><span class="st__t"><b>${pad2(k + 1)}</b>${x.name[L()]}${twin && x.bed && /Deluxe/.test(x.name[1]) ? ' · ' + x.bed[L()] : ''}</span><span class="st__bar"><i></i></span></button>`).join('');
      this.fill(false);
      if (first) new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { o.disconnect(); if (!$('.show__layer', this.stage)) this.paint(img(this.rooms[this.i].imgs[0]), null); } }, { rootMargin: '100% 0px' }).observe(this.sec);
    }
    fill(animate) {
      const old = $$('.anim', this.card), tok = ++this.tok;
      if (hasGsap && animate && !reduce && old.length) {
        gsap.killTweensOf(old);
        gsap.to(old, { opacity: 0, y: -12, duration: .32, ease: 'power2.in', stagger: .025, onComplete: () => tok === this.tok && this.build(true) });
      } else this.build(animate);
    }
    build(animate) {
      const r = this.rooms[this.i], n = this.rooms.length, specs = [];
      if (r.size) specs.push(`<div><b>${r.size} ${T('m²', 'm²', 'م²')}</b><span>${T('Alan', 'Size')}</span></div>`);
      if (r.bed) specs.push(`<div><b>${r.bed[L()]}</b><span>${T('Yatak', 'Bed')}</span></div>`);
      if (r.view) specs.push(`<div><b>${r.view[L()]}</b><span>${T('Manzara', 'View', 'الإطلالة')}</span></div>`);
      this.card.innerHTML = `
        <div class="sc__top anim"><span class="sc__idx">${pad2(this.i + 1)} <small>/ ${pad2(n)}</small></span><span>${r.group[L()]}</span></div>
        <h4 class="sc__name anim">${r.name[L()]}</h4>
        <p class="sc__tag anim">${r.tag[L()]}</p>
        <div class="sc__specs anim">${specs.join('')}</div>
        <p class="sc__desc anim">${r.desc[L()]}</p>
        ${r.imgs.length > 1 ? `<div class="sc__gal anim">${r.imgs.slice(0, 6).map((g, k) => `<button data-g="${k}" class="${k === 0 ? 'is-on' : ''}" aria-label="${k + 1}"><img src="${img(g, true)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
        <ul class="sc__am anim">${r.am.slice(0, 4).map(k => `<li>${AM[k] ? AM[k][L()] : k}</li>`).join('')}</ul>
        <div class="sc__btns anim"><button class="btn btn--gold js-room" data-room="${r.id}"><span>${T('Odayı keşfedin', 'Explore the room')}</span>${ARROW}</button><button class="btn btn--glass js-book" data-hotel="${this.hotel}">${T('Ayırtın', 'Reserve')}</button></div>`;
      this.fit();
      const els = $$('.anim', this.card);
      if (hasGsap && animate && !reduce) { gsap.set(els, { opacity: 0, y: 18 }); gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .055, delay: .15 }); }
      else els.forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; });
    }
    // Kart her ekrana sığar: yarım/ezik satır yok. Sırayla: olanaklar, galeri, açıklama 3→2→1 satır, açıklama, alt başlık.
    fit() {
      const c = this.card, d = $('.sc__desc', c);
      $$('.is-sigmaz', c).forEach(e => e.classList.remove('is-sigmaz'));
      if (d) delete d.dataset.l;
      if (mobile()) return;
      const adim = [
        () => $('.sc__am', c)?.classList.add('is-sigmaz'),
        () => $('.sc__gal', c)?.classList.add('is-sigmaz'),
        () => d && (d.dataset.l = '2'),
        () => d && (d.dataset.l = '1'),
        () => d?.classList.add('is-sigmaz'),
        () => $('.sc__tag', c)?.classList.add('is-sigmaz'),
      ];
      for (let i = 0; i < adim.length && c.scrollHeight > c.clientHeight + 1; i++) adim[i]();
    }
    // Kemer yolu: l/r/t/b kutu, k=1 tam kemer, k=0 dikdörtgen
    archD({ l, r, t, b, k }) {
      const h = b - t, w = r - l, f = n => n.toFixed(4);
      return `M${f(l)},${f(b)} V${f(t + h * .3 * k)} C${f(l)},${f(t + h * .1 * k)} ${f(l + w * .3)},${f(t + h * .06 * k)} ${f(l + w / 2)},${f(t)} C${f(l + w * .7)},${f(t + h * .06 * k)} ${f(r)},${f(t + h * .1 * k)} ${f(r)},${f(t + h * .3 * k)} V${f(b)} Z`;
    }
    paint(src, origin) {
      const prevTl = this.tl; if (prevTl) prevTl.progress(1);
      const layers = $$('.show__layer', this.stage), prev = layers[layers.length - 1];
      const layer = document.createElement('div');
      layer.className = 'show__layer';
      layer.innerHTML = `<img src="${src}" alt="">`;
      this.stage.appendChild(layer);
      const im = layer.firstChild;
      const kenBurns = () => hasGsap && !reduce && gsap.fromTo(im, { scale: 1.04 }, { scale: 1.12, duration: 11, ease: 'none' });
      const done = () => { layer.style.clipPath = ''; $$('.show__layer', this.stage).filter(l => l !== layer).forEach(l => { hasGsap && gsap.killTweensOf([l, l.firstChild]); l.remove(); }); };
      if (!origin || !hasGsap || reduce || !prev) { done(); kenBurns(); return; }
      const cx = clamp(origin[0] / 100, .2, .8), aspect = this.stage.clientWidth / Math.max(1, this.stage.clientHeight);
      const hh = .5, ww = hh * .62 / aspect;
      const o = { l: cx - ww / 2, r: cx + ww / 2, t: .26, b: .26 + hh, k: 1 };
      const draw = () => { const d = this.archD(o); this.clip.setAttribute('d', d); this.edge.setAttribute('d', d); };
      draw();
      layer.style.clipPath = `url(#${this.cid})`;
      const run = () => {
        this.tl = gsap.timeline({ onComplete: () => { done(); this.tl = null; } })
          .to(o, { l: 0, r: 1, t: 0, b: 1, duration: 1.9, ease: 'expo.inOut', onUpdate: draw }, 0)
          .to(o, { k: 0, duration: 1.3, ease: 'power2.in', onUpdate: draw }, .55)
          .fromTo(im, { scale: 1.28 }, { scale: 1.04, duration: 2.4, ease: 'expo.out' }, 0)
          .to(prev, { filter: 'brightness(.45) saturate(.8)', scale: 1.04, duration: 1.8, ease: 'power2.inOut' }, 0)
          .fromTo(this.edge, { opacity: 0 }, { opacity: 1, duration: .35 }, .05)
          .to(this.edge, { opacity: 0, duration: .7 }, 1.15)
          .add(() => kenBurns(), 1.9);
      };
      im.complete ? run() : (im.onload = run, im.onerror = run);
    }
    go(k, origin) {
      const n = this.rooms.length;
      this.i = (k + n) % n;
      $$('.st', this.thumbs).forEach((b, j) => { b.classList.remove('is-on'); if (j === this.i) { void b.offsetWidth; b.classList.add('is-on'); } });
      if (mobile()) { const t = $$('.st', this.thumbs)[this.i]; if (t) { const a = t.getBoundingClientRect(), b = this.thumbs.getBoundingClientRect(); this.thumbs.scrollBy({ left: lang === 'ar' ? a.right - b.right + 20 : a.left - b.left - 20, behavior: 'smooth' }); } }
      this.fill(true);
      this.paint(img(this.rooms[this.i].imgs[0]), origin || [50, 50]);
      this.auto.restart();
    }
  }
  $$('.show').forEach(s => new Show(s));
  { let ft; const yeniden = () => shows.forEach(s => s.fit()); window.addEventListener('resize', () => { clearTimeout(ft); ft = setTimeout(yeniden, 120); }); document.fonts?.ready.then(yeniden); }

  /* ---------------- Oda paneli ---------------- */
  let slideI = 0, cur = null;
  function showSlide(i) {
    const imgs = $$('.room__slides img');
    slideI = (i + imgs.length) % imgs.length;
    imgs.forEach((im, k) => im.classList.toggle('is-on', k === slideI));
    $('.rg-c').textContent = `${slideI + 1} / ${imgs.length}`;
    $('.room__gnav').style.display = imgs.length > 1 ? '' : 'none';
  }
  function openRoom(id, noHash) {
    const r = ROOMS.find(x => x.id === id); if (!r) return;
    cur = r;
    $('.room__hotel').textContent = `${r.hotel === 'sultanahmet' ? 'AJWA Sultanahmet' : 'AJWA Cappadocia'} · ${r.cave ? T('Mağara Süit', 'Cave Suite') : r.group[L()]}`;
    $('.room__name').textContent = r.name[L()];
    $('.room__tag').textContent = r.tag[L()];
    const specs = [];
    if (r.size) specs.push(`<div><dt>${r.size}</dt><dd>${T('m²', 'm²', 'م²')}</dd></div>`);
    if (r.bed) specs.push(`<div><dt style="font-size:1.3rem">${r.bed[L()]}</dt></div>`);
    if (r.view) specs.push(`<div><dt style="font-size:1.3rem">${r.view[L()]}</dt><dd>${T('manzara', 'view')}</dd></div>`);
    if (r.cave) specs.push(`<div><dt style="font-size:1.3rem">${T('Volkanik kaya', 'Carved from volcanic rock')}</dt></div>`);
    $('.room__specs').innerHTML = specs.join('');
    $('.room__desc').textContent = r.desc[L()];
    $('.room__note').textContent = r.cave ? T(`Adını aldığı isim: ${r.name[0]} — ${r.who[0]}. Her mağara süiti farklı bir hikâyenin evidir.`, `Named after ${r.name[1]} — ${r.who[1]}. Each cave suite is home to a different story.`, `يحمل اسم ${r.name[2]} — ${r.who[2]}. ولكلّ جناحٍ كهفي حكايته.`) : '';
    $('.room__am').innerHTML = r.am.map(k => `<li>${AM[k] ? AM[k][L()] : k}</li>`).join('');
    $('.room__slides').innerHTML = r.imgs.map((n, i) => `<img src="${img(n)}" alt="${r.name[L()]}" ${i ? 'loading="lazy"' : ''}>`).join('');
    const same = ROOMS.filter(x => x.hotel === r.hotel);
    const nx = same[(same.indexOf(r) + 1) % same.length];
    const nxt = $('.room__next'); nxt.textContent = `${T('Sonraki', 'Next')}: ${nx.name[L()]} ${lang === 'ar' ? '←' : '→'}`; nxt.dataset.next = nx.id;
    showSlide(0);
    $('.room__body').scrollTop = 0;
    roomEl.classList.add('is-open'); roomEl.setAttribute('aria-hidden', 'false'); lock(true);
    if (!noHash) history.replaceState(null, '', '#oda/' + id);
  }
  const closeRoom = () => { roomEl.classList.remove('is-open'); roomEl.setAttribute('aria-hidden', 'true'); lock(false); history.replaceState(null, '', location.pathname); };
  $('.room__veil').addEventListener('click', closeRoom);
  $('.room__x').addEventListener('click', closeRoom);
  $('.rg-n').addEventListener('click', () => showSlide(slideI + 1));
  $('.rg-p').addEventListener('click', () => showSlide(slideI - 1));
  $('.room__next').addEventListener('click', e => { e.preventDefault(); openRoom(e.currentTarget.dataset.next); });
  $('.js-book-room').addEventListener('click', () => { const h = cur?.hotel; closeRoom(); openSheet(h); });
  (() => { let x0 = null; const g = $('.room__gal'); g.addEventListener('touchstart', e => (x0 = e.touches[0].clientX), { passive: true }); g.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) showSlide(slideI + (dx < 0 ? 1 : -1)); x0 = null; }); })();
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-room]');
    if (b && !b.closest('[data-drag]')) { e.preventDefault(); openRoom(b.dataset.room); }
  });

  /* ---------------- Işık kutusu ---------------- */
  const lb = $('.lb');
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-zoom]'); if (!f || f.closest('[data-drag]')) return;
    const im = f.querySelector('img'); $('img', lb).src = (im.currentSrc || im.src).replace('-s.webp', '.webp'); $('img', lb).alt = im.alt;
    lb.classList.add('is-open'); lock(true);
  });
  lb.addEventListener('click', () => { lb.classList.remove('is-open'); lock(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (lb.classList.contains('is-open')) return lb.click(); if (roomEl.classList.contains('is-open')) closeRoom(); else if (sheet.classList.contains('is-open')) closeSheet(); else closeMenu(); }
    if (roomEl.classList.contains('is-open')) { if (e.key === 'ArrowRight') showSlide(slideI + 1); if (e.key === 'ArrowLeft') showSlide(slideI - 1); }
  });

  /* ---------------- Menü ---------------- */
  const menuBtn = $('.hdr__menu'), menu = $('.menu');
  $('.menu__side').appendChild($('.hdr .lang').cloneNode(true));
  function closeMenu() { if (!document.body.classList.contains('menu-open')) return; document.body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); lock(false); }
  menuBtn.addEventListener('click', () => {
    if (document.body.classList.contains('menu-open')) return closeMenu();
    document.body.classList.add('menu-open'); menuBtn.setAttribute('aria-expanded', 'true'); menu.setAttribute('aria-hidden', 'false'); lock(true);
  });
  const menuImg = $('.menu__img img');
  $$('.menu__list a').forEach(a => {
    a.addEventListener('mouseenter', () => { menuImg.style.opacity = 0; setTimeout(() => { menuImg.srcset = ''; menuImg.src = img(a.dataset.img, true); menuImg.style.opacity = 1; }, 220); });
    a.addEventListener('click', e => { const h = a.getAttribute('href'); if (!h.startsWith('#')) { closeMenu(); return; } e.preventDefault(); closeMenu(); setTimeout(() => scrollTo(h), 350); });
  });
  $$('a[href^="#"]:not(.menu__list a)').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href'); if (h.length < 2 && h !== '#top') return;
    e.preventDefault(); scrollTo(h === '#top' ? 0 : h);
  }));

  /* ---------------- İmleç & sedef ---------------- */
  if (fine && !reduce) {
    document.body.classList.add('has-cursor');
    const c = $('.cursor'), ring = $('.cursor__ring'), dot = $('.cursor__dot'), label = $('.cursor__label');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    const loop = () => { rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('pointerover', e => {
      const big = e.target.closest('[data-cursor]'), zoom = e.target.closest('[data-zoom]'), lnk = e.target.closest('a,button,select,input,label');
      c.classList.toggle('is-big', !!(big || zoom));
      label.textContent = big ? big.dataset.cursor : zoom ? T('Büyüt', 'View', 'تكبير') : '';
      c.classList.toggle('is-link', !big && !zoom && !!lnk);
    });
  }
  document.addEventListener('pointermove', e => {
    const s = e.target.closest?.('.sheen'); if (!s) return;
    const r = s.getBoundingClientRect();
    s.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    s.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  }, { passive: true });

  /* ---------------- Sultan süiti slayt ---------------- */
  (() => {
    const imgs = $$('.sultan__img'), dots = $('.sultan__dots'); let i = 0, t;
    if (!dots) return;
    dots.innerHTML = imgs.map((_, k) => `<button aria-label="${k + 1}"></button>`).join('');
    const go = k => {
      i = (k + imgs.length) % imgs.length;
      imgs.forEach((im, j) => im.classList.toggle('is-on', j === i));
      $$('button', dots).forEach((b, j) => { b.classList.remove('is-on'); if (j === i) { void b.offsetWidth; b.classList.add('is-on'); } });
      clearTimeout(t); t = setTimeout(() => go(i + 1), 5000);
    };
    dots.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go($$('button', dots).indexOf(b)); });
    go(0);
  })();

  /* ---------------- Ayrıcalıklar akordeonu ---------------- */
  (() => {
    const sec = $('.priv'); if (!sec) return;
    const ps = $$('.acc__p', sec); let i = 0, ht;
    const auto = new Auto(7000, () => set(i + 1));
    auto.why.add('off');
    const sync = () => sec.classList.toggle('is-paused', auto.paused);
    function set(k) {
      i = (k + ps.length) % ps.length;
      ps.forEach((p, j) => { p.classList.remove('is-on'); if (j === i) { void p.offsetWidth; p.classList.add('is-on'); } });
      auto.restart();
    }
    ps.forEach((p, j) => {
      p.addEventListener('click', () => j !== i && set(j));
      p.addEventListener('mouseenter', () => { if (!fine) return; clearTimeout(ht); ht = setTimeout(() => j !== i && set(j), 220); });
      p.addEventListener('mouseleave', () => clearTimeout(ht));
    });
    $('.acc', sec).addEventListener('mouseenter', () => { if (fine) { auto.pause('hover'); sync(); } });
    $('.acc', sec).addEventListener('mouseleave', () => { if (fine) { auto.resume('hover'); sync(); } });
    onView(sec, v => { v ? auto.resume('off') : auto.pause('off'); sync(); }, .5);
  })();

  /* ---------------- Alt sayfalar: oda listesi, oda sayfası, galeri ---------------- */
  const roomUrl = id => `oda-${id}.html`;
  const hotelName = r => (r.hotel === 'sultanahmet' ? 'AJWA Sultanahmet' : 'AJWA Cappadocia');
  const roomMeta = r => [r.size ? `${r.size} ${T('m²', 'm²', 'م²')}` : '', r.cave ? T('Mağara süit', 'Cave suite') : r.bed ? r.bed[L()] : '', r.view ? r.view[L()] : ''].filter(Boolean).join(' · ');
  const roomCard = r => `<a class="rc" href="${roomUrl(r.id)}" data-cat="${r.cave ? 'cave' : r.hotel}">
      <span class="rc__img wframe"><img src="${img(r.imgs[0], true)}" alt="${r.name[L()]}" loading="lazy"></span>
      <span class="rc__b"><small>${hotelName(r)} · ${r.cave ? T('Mağara süit', 'Cave suite') : r.group[L()]}</small><b>${r.name[L()]}</b><em>${r.tag[L()]}</em><span class="rc__m">${roomMeta(r)}</span></span></a>`;
  (() => {
    const grid = $('.rl__grid'); if (!grid) return;
    // odalar.html#sultanahmet | #cappadocia | #magara: süzgeç bağlantıdan seçilir
    let f = ({ '#sultanahmet': 'sultanahmet', '#cappadocia': 'cappadocia', '#magara': 'cave' })[location.hash] || 'all';
    $$('[data-rf]').forEach(x => x.classList.toggle('is-on', x.dataset.rf === f));
    const render = () => { grid.innerHTML = ROOMS.filter(r => f === 'all' || (f === 'cave' ? r.cave : r.hotel === f && !r.cave)).map(roomCard).join(''); };
    $$('[data-rf]').forEach(b => b.addEventListener('click', () => { f = b.dataset.rf; $$('[data-rf]').forEach(x => x.classList.toggle('is-on', x === b)); render(); }));
    render(); langHooks.push(render);
  })();
  (() => {
    const main = $('[data-room-page]'); if (!main) return;
    const r = ROOMS.find(x => x.id === main.dataset.roomPage); if (!r) return;
    let gi = 0, iso = null;
    const ISO = ['deluxe-vertical-king']; // izometrik 3B maketi hazır odalar
    const has3b = ISO.includes(r.id);
    // galeri: fotoğraflar ya da 3B maket (kütüphane yalnız maket seçilince yüklenir)
    const goster = g => {
      gi = g; iso?.kapat(); iso = null;
      const fig = $('.rp__main', main), not = $('.rp__3bnot', main);
      $$('[data-gi]', main).forEach(x => x.classList.toggle('is-on', x.dataset.gi === String(g)));
      if (not) not.hidden = g !== '3b';
      if (g !== '3b') { fig.setAttribute('data-zoom', ''); fig.classList.remove('is-3b'); fig.innerHTML = `<img src="${img(r.imgs[g])}" alt="${r.name[L()]}">`; return; }
      fig.removeAttribute('data-zoom'); fig.classList.add('is-3b');
      fig.innerHTML = `<div class="iso__stage" id="iso-stage"><p class="iso__yuk">${T('Maket hazırlanıyor…', 'Preparing the model…', 'جارٍ تجهيز المجسّم…')}</p></div>`;
      const st = $('#iso-stage', fig);
      import('./iso.js').then(m => m.kur(st, r.id, L())).then(x => { if (!st.isConnected || gi !== '3b') return x.kapat(); iso = x; })
        .catch(() => { st.innerHTML = `<p class="iso__yuk">${T('Maket yüklenemedi.', 'The model could not be loaded.', 'تعذّر تحميل المجسّم.')}</p>`; });
    };
    const render = () => {
      iso?.kapat(); iso = null;
      const same = ROOMS.filter(x => x.hotel === r.hotel), k = same.indexOf(r);
      const prev = same[(k - 1 + same.length) % same.length], next = same[(k + 1) % same.length];
      const more = [1, 2, 3].map(d => same[(k + d) % same.length]).filter(x => x !== r);
      const specs = [];
      if (r.size) specs.push(`<div><dt>${r.size}</dt><dd>${T('m²', 'm²', 'م²')}</dd></div>`);
      if (r.bed) specs.push(`<div><dt class="sm">${r.bed[L()]}</dt><dd>${T('Yatak', 'Bed')}</dd></div>`);
      if (r.view) specs.push(`<div><dt class="sm">${r.view[L()]}</dt><dd>${T('Manzara', 'View', 'الإطلالة')}</dd></div>`);
      if (r.cave) specs.push(`<div><dt class="sm">${T('Volkanik kaya', 'Carved from volcanic rock')}</dt></div>`);
      const ar = lang === 'ar' ? ['→', '←'] : ['←', '→'];
      main.innerHTML = `
        <nav class="rp__crumb"><a href="odalar.html">${T('Odalar ve süitler', 'Rooms and suites')}</a><span>/</span><span>${hotelName(r)}</span></nav>
        <div class="rp__grid">
          <div class="rp__gal">
            <figure class="rp__main wframe" data-zoom><img src="${img(r.imgs[gi === '3b' ? 0 : gi])}" alt="${r.name[L()]}"></figure>
            ${r.imgs.length > 1 || has3b ? `<div class="rp__thumbs">${r.imgs.map((g, i) => `<button class="${i === gi ? 'is-on' : ''}" data-gi="${i}" aria-label="${i + 1}"><img src="${img(g, true)}" alt="" loading="lazy"></button>`).join('')}${has3b ? `<button class="rp__3b" data-gi="3b" aria-label="${T('Odanın 3B maketi', 'The room in 3D', 'مجسّم الغرفة ثلاثي الأبعاد')}"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4.5 26.5 10.5v11L16 27.5 5.5 21.5v-11zM5.5 10.5 16 16.5l10.5-6M16 16.5v11"/></svg><span>${T('3B maket', '3D model', 'مجسّم 3D')}</span></button>` : ''}</div>` : ''}
            ${has3b ? `<p class="rp__3bnot" hidden>${T('Sürükleyerek çevirin. Tekerlek, iki parmak ya da + ile yakınlaşın; yakındayken sürükleyerek odada gezinin. Numaralara dokunun. Temsilî çizimdir; ölçüler yaklaşıktır.', 'Drag to turn. Zoom with the wheel, two fingers or +; when close, drag to move around. Tap the numbers. Illustrative model; dimensions are approximate.', 'اسحب للتدوير. كبّر بعجلة الفأرة أو بإصبعين أو +، ثم اسحب للتنقّل. اضغط على الأرقام. مجسّم توضيحي؛ المقاسات تقريبية.')}</p>` : ''}
          </div>
          <div class="rp__t">
            <p class="eyebrow">${hotelName(r)} · ${r.cave ? T('Mağara süit', 'Cave suite') : r.group[L()]}</p>
            <h1 class="display">${r.name[L()]}</h1>
            <p class="rp__tag">${r.tag[L()]}</p>
            <dl class="specs rp__specs">${specs.join('')}</dl>
            <p class="rp__desc">${r.desc[L()]}</p>
            ${r.cave ? `<p class="room__note">${T(`Adını aldığı isim: ${r.name[0]} — ${r.who[0]}. Her mağara süiti farklı bir hikâyenin evidir.`, `Named after ${r.name[1]} — ${r.who[1]}. Each cave suite is home to a different story.`, `يحمل اسم ${r.name[2]} — ${r.who[2]}. ولكلّ جناحٍ كهفي حكايته.`)}</p>` : ''}
            <h2 class="rp__h">${T('Olanaklar', 'In the room')}</h2>
            <ul class="room__am rp__am">${r.am.map(a => `<li>${AM[a] ? AM[a][L()] : a}</li>`).join('')}</ul>
            <div class="rp__btns"><button class="btn btn--gold js-book" data-hotel="${r.hotel}"><span>${T('Bu odayı ayırtın', 'Reserve this room')}</span>${ARROW}</button><a class="btn btn--line" href="odalar.html">${T('Tüm odalar', 'All rooms')}</a></div>
          </div>
        </div>
        <section class="rp__more">
          <div class="rp__mh"><h2 class="display-s">${T('Keşfedilecek <em>diğer odalar</em>', 'More rooms <em>to discover</em>')}</h2>
            <div class="rp__nav"><a href="${roomUrl(prev.id)}">${ar[0]} ${prev.name[L()]}</a><a href="${roomUrl(next.id)}">${next.name[L()]} ${ar[1]}</a></div></div>
          <div class="rl__grid rl__grid--3">${more.map(roomCard).join('')}</div>
        </section>`;
      document.title = `${r.name[L()]} — ${hotelName(r)}`;
      if (gi === '3b') goster('3b');
    };
    main.addEventListener('click', e => {
      const b = e.target.closest('[data-gi]'); if (!b) return;
      const g = b.dataset.gi === '3b' ? '3b' : +b.dataset.gi;
      if (g === gi) return;
      if (g === '3b' || gi === '3b') return goster(g);
      gi = g;
      $('.rp__main img', main).src = img(r.imgs[gi]);
      $$('[data-gi]', main).forEach(x => x.classList.toggle('is-on', x === b));
    });
    render(); langHooks.push(render);
  })();
  // Odalarımız hero'su: AJWA Sultanahmet binasının 3B maketi (sayfa kaydırmasıyla çakışmasın diye tekerlek yalnız Ctrl ile)
  (() => {
    const st = $('#bina-stage'); if (!st) return;
    let bina = null, secili = 'ajwa-sultanahmet', sira = 0, yukDil = null;
    // Sultanahmet / Kapadokya geçişi: eski maket kapanır, yenisi aynı sahnede kurulur (geç gelen yükleme eskisini ezmesin)
    const secler = [...document.querySelectorAll('.bina__sec button')];
    secler.forEach(b => b.addEventListener('click', () => {
      if (b.dataset.bina === secili) return; secili = b.dataset.bina; st.closest('.phero').dataset.maket = secili;   // telefonda sahne yüksekliği maketin biçimine uyar
      secler.forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      st.innerHTML = `<p class="iso__yuk">${T('Maket hazırlanıyor…', 'Preparing the model…', 'جارٍ تجهيز المجسّم…')}</p>`; yukle();
      requestAnimationFrame(() => window.ScrollTrigger?.refresh());   // sahne yüksekliği değişti: başlık animasyonlarının konumu yenilensin
    }));
    // yer düğmeleri: maketteki numaralı noktaların kısa adları; dokununca maket oraya uçar ve yakınlaşır
    const yerKutu = $('.bina__yerler');
    const yerler = x => {
      if (!yerKutu) return; yerKutu.innerHTML = '';
      x.etiketler.forEach((ad, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'bina__yer'; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = `<b>${i + 1}</b><span>${ad.split(' · ')[0]}</span>`; b.title = ad;
        b.addEventListener('click', () => x.git(i)); yerKutu.appendChild(b);
      });
      const t = document.createElement('button'); t.type = 'button'; t.className = 'bina__yer bina__yer--tum';
      t.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg><span>${T('Tümünü gör', 'See all', 'عرض الكل')}</span>`;
      t.addEventListener('click', () => x.sifirla()); yerKutu.appendChild(t);
    };
    const sec = i => yerKutu && [...yerKutu.querySelectorAll('.bina__yer:not(.bina__yer--tum)')].forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', k === i); });
    const yukle = () => { bina?.kapat(); bina = null; if (yerKutu) yerKutu.innerHTML = ''; const n = ++sira; yukDil = L(); import('./iso.js').then(m => m.kur(st, secili, L(), { gecerli: () => n === sira, tekerlekCtrl: true, sagaKaydir: innerWidth > 1100 ? .19 : .14, dpr: 1.5, dinamik: true, pay: innerWidth < 761 ? 1.02 : 1.06, secim: sec })).then(x => { if (!x) return; if (n !== sira) { x.kapat(); return; } bina = x; yerler(x); }).catch(() => { st.innerHTML = `<p class="iso__yuk">${T('Maket yüklenemedi.', 'The model could not be loaded.', 'تعذّر تحميل المجسّم.')}</p>`; }); };
    // sayfa tamamen yüklenip tarayıcı boşalınca başlar: ilk açılış ve kaydırma akıcı kalsın
    const basla = () => (window.requestIdleCallback || (f => setTimeout(f, 300)))(yukle, { timeout: 2000 });
    if (document.readyState === 'complete') basla(); else addEventListener('load', basla, { once: true });
    langHooks.push(() => { if (yukDil !== null && yukDil !== L()) yukle(); });   // yalnız dil gerçekten değişince (açılıştaki ikinci indirme kalktı)
  })();
  (() => {
    const g = $('.gal'); if (!g) return;
    $$('[data-gf]').forEach(b => b.addEventListener('click', () => {
      const f = b.dataset.gf;
      $$('[data-gf]').forEach(x => x.classList.toggle('is-on', x === b));
      $$('figure', g).forEach(fig => fig.classList.toggle('is-hide', f !== 'all' && fig.dataset.cat !== f));
      window.ScrollTrigger?.refresh();
    }));
  })();
  /* sayfa başlığı: alt sayfalar kendi adını taşır */
  const pageTitle = $('meta[name="ajwa-title"]');
  if (pageTitle) langHooks.push(() => { const t = pageTitle.content.split('|'); document.title = (lang === 'en' ? t[1] : lang === 'ar' ? (AR[t[1]] ?? t[1]) : t[0]) + ' — AJWA Hotels'; });

  /* ---------------- İlk çizim ---------------- */
  applyLang(true);
  $$('.rail[data-auto]').forEach(r => { const a = new AutoRail(r); if (r === caveRail) caveAuto = a; });
  setupSplits(false);
  const hash = location.hash.match(/^#oda\/(.+)$/);

  /* ---------------- Kahraman: kemer kapının çerçevesine oturur, sonra ekranı doldurur ---------------- */
  const heroSec = $('.hero'), pin = $('.hero__pin'), arch = $('.hero__arch'), himg = $('.hero__img'), hpath = $('#archHeroPath');
  const HOME = !!heroSec;
  const IMG_R = 1920 / 1024, DOOR = { x: 712 / 1920, y: 64 / 1024, w: 516 / 1920, h: 841 / 1024 }, DOOR_R = 516 / 841;
  let heroP = 0;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function heroLayout(p = heroP) {
    heroP = p;
    const W = pin.clientWidth, H = pin.clientHeight, m = W <= 760;
    const h0 = m ? Math.min(H * .5, W * .74 / DOOR_R) : H * .7, w0 = h0 * DOOR_R;
    const cy = H * (m ? .54 : .56);
    const b0 = { x: W / 2 - w0 / 2, y: cy - h0 / 2, w: w0, h: h0 };
    const e = ease(clamp(p / .78, 0, 1));
    const b = { x: lerp(b0.x, 0, e), y: lerp(b0.y, 0, e), w: lerp(b0.w, W, e), h: lerp(b0.h, H, e) };
    const ih0 = h0 / DOOR.h, iw0 = ih0 * IMG_R;
    const i0 = { x: b0.x - DOOR.x * iw0, y: b0.y - DOOR.y * ih0, w: iw0, h: ih0 };
    const iw1 = Math.max(W, H * IMG_R), ih1 = iw1 / IMG_R;
    const i1 = { x: clamp(W / 2 - .505 * iw1, W - iw1, 0), y: (H - ih1) / 2, w: iw1, h: ih1 };
    const im = { x: lerp(i0.x, i1.x, e), y: lerp(i0.y, i1.y, e), w: lerp(i0.w, i1.w, e), h: lerp(i0.h, i1.h, e) };
    Object.assign(arch.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px', transform: 'none', aspectRatio: 'auto' });
    Object.assign(himg.style, { left: (im.x - b.x) + 'px', top: (im.y - b.y) + 'px', width: im.w + 'px', height: im.h + 'px', objectFit: 'fill' });
    const k = 1 - ease(clamp(p / .7, 0, 1));
    hpath.setAttribute('d', `M0,1 V${(.30 * k).toFixed(4)} C0,${(.10 * k).toFixed(4)} 0.30,${(.06 * k).toFixed(4)} 0.5,0 C0.70,${(.06 * k).toFixed(4)} 1,${(.10 * k).toFixed(4)} 1,${(.30 * k).toFixed(4)} V1 Z`);
    pin.style.setProperty('--aw', w0 + 'px');
    pin.style.setProperty('--ah', h0 + 'px');
  }
  if (HOME) { heroLayout(0); window.addEventListener('resize', () => heroLayout()); }
  const goHash = () => { if (hash) openRoom(hash[1], true); else if (location.hash.length > 1 && /^#[\w-]+$/.test(location.hash) && $(location.hash)) setTimeout(() => scrollTo(location.hash, { immediate: true }), 60); };

  if (!hasGsap) { document.body.classList.remove('is-loading'); $('.loader')?.remove(); const bb = $('.hero .bookbar'); if (bb) bb.style.cssText = 'opacity:1;visibility:visible;transform:none'; goHash(); return; }

  /* ---------------- Üst bar: sabit, kompakt ---------------- */
  const hdr = $('.hdr');
  const hdrSync = y => hdr.classList.toggle('is-compact', !HOME || y > 40);
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => hdrSync(s.scroll()), onRefresh: s => hdrSync(s.scroll()) });

  /* ---------------- Açılış ---------------- */
  const loader = $('.loader'), seen = store.sget('ajwa-seen');
  if (!HOME) { document.body.classList.remove('is-loading'); requestAnimationFrame(() => { ScrollTrigger.refresh(); goHash(); }); }
  else {
  const intro = gsap.timeline({ paused: true });
  gsap.set('.hero__l > *', { yPercent: 110 });
  intro.fromTo(arch, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.8, ease: 'expo.out' }, 0)
    .to('.hero__l > *', { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: .12 }, .5)
    .from('.hero__meta, .hero__scroll', { opacity: 0, y: 14, duration: 1, stagger: .1 }, 1);
  const finishLoad = () => { document.body.classList.remove('is-loading'); store.sset('ajwa-seen', 1); ScrollTrigger.refresh(); goHash(); };
  if (reduce) { loader.remove(); finishLoad(); gsap.set('.hero__l > *', { yPercent: 0 }); }
  else {
    const star = $$('.loader__star path, .loader__star rect');
    star.forEach(p => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
    const tl = gsap.timeline({ onComplete: () => loader.remove() });
    tl.timeScale(seen ? 2.2 : 1);
    tl.to(star, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: .15 })
      .from('.loader__mark', { opacity: 0, scale: .6, duration: 1.1, ease: 'expo.out' }, .5)
      .from('.loader__word span', { yPercent: 110, duration: 1, ease: 'expo.out', stagger: .07 }, .8)
      .from('.loader__sub', { opacity: 0, letterSpacing: '.9em', duration: 1.2, ease: 'expo.out' }, 1.1)
      .to('.loader__star', { scale: 1.3, opacity: 0, duration: 1.2, ease: 'expo.in' }, 2.2)
      .to('.loader__inner', { opacity: 0, y: -30, duration: .8, ease: 'power3.in' }, 2.6)
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'expo.inOut' }, 3.0)
      .add(() => { intro.play(); finishLoad(); }, 3.1);
  }

  /* ---------------- Kahraman kaydırma ---------------- */
  const htl = gsap.timeline({ scrollTrigger: { trigger: heroSec, start: 'top top', end: 'bottom bottom', scrub: 1, onUpdate: s => heroLayout(s.progress), onRefresh: s => heroLayout(s.progress) } });
  htl.to('.hero__l--1', { xPercent: -40, opacity: 0, ease: 'power2.in', duration: .35 }, 0)
    .to('.hero__l--2', { xPercent: 40, opacity: 0, ease: 'power2.in', duration: .35 }, 0)
    .to('.hero__meta, .hero__scroll', { opacity: 0, duration: .2 }, 0)
    .to('.hero__shade', { opacity: 1, duration: .3 }, .45)
    .fromTo('.hero__after', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .25 }, .62)
    .to('.bookbar', { autoAlpha: 1, y: 0, duration: .2 }, .74)
    .to({}, { duration: .1 });
  }

  /* ---------------- Genel açılmalar ---------------- */
  ScrollTrigger.batch('.js-reveal', { start: 'top 92%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: .1 }) });
  $$('.js-count').forEach(el => {
    const to = +el.dataset.to, o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 94%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 2.2, ease: 'expo.out', onUpdate: () => (el.textContent = Math.round(o.v)) }) });
  });
  $$('.js-par').forEach(el => {
    const s = +el.dataset.speed || .1;
    gsap.fromTo(el, { yPercent: -s * 40 }, { yPercent: s * 40, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('.wing figure, .home figure, .intro__a, .zef__b').forEach(f => {
    gsap.from($$('img:not(.swap__b)', f), { opacity: 0, scale: 1.18, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: f, start: 'top 92%', once: true }, clearProps: 'opacity,scale' });
  });
  $$('.b, .afiya__thumbs figure, .zef__a, .zef__c').forEach(el => gsap.from(el, { opacity: 0, y: 40, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 96%', once: true } }));

  /* ---------------- Harita rotası ---------------- */
  (() => {
    const mask = $('.map__mask'), path = $('.map__path'), plane = $('.map__plane');
    if (!mask) return;
    const len = mask.getTotalLength(), o = { p: 0 };
    gsap.set(mask, { strokeDasharray: len, strokeDashoffset: len });
    const place = () => {
      const l = o.p * len, pt = path.getPointAtLength(l), pt2 = path.getPointAtLength(Math.min(len, l + 1));
      plane.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(${Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI})`);
      mask.style.strokeDashoffset = len * (1 - o.p);
      plane.style.opacity = o.p > .02 && o.p < .98 ? 1 : 0;
    };
    place();
    gsap.to(o, { p: 1, ease: 'none', onUpdate: place, scrollTrigger: { trigger: '.map', start: 'top 80%', end: 'center 45%', scrub: 1 } });
  })();

  window.addEventListener('load', () => { rails.forEach(r => r.build()); ScrollTrigger.refresh(); });
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => rails.forEach(r => r.build()), 250); });
})();
