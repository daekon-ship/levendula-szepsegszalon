/* Levendula Szépségszalon – interakciók */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mqMobile = window.matchMedia('(max-width:1000px)');
  var ft = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + '\u00a0Ft'; };

  /* ---------- hero load sequence ---------- */
  var hero = $('.hero');
  if (hero) {
    var img = $('.hero-photo img');
    var go = function () { requestAnimationFrame(function () { hero.classList.add('is-loaded'); }); };
    if (img && !img.complete) { img.addEventListener('load', go); img.addEventListener('error', go); setTimeout(go, 1200); } else { go(); }
  }

  /* ---------- header ---------- */
  var header = $('.site-header');
  var mbar = $('.m-bar');
  var onScroll = function () {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (mbar) {
      var on = y > (hero ? hero.offsetHeight * 0.6 : 300);
      mbar.classList.toggle('is-on', on);
      mbar.setAttribute('aria-hidden', on ? 'false' : 'true');
      $$('a,button', mbar).forEach(function (el) { el.tabIndex = on ? 0 : -1; });
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* current section in nav */
  var navLinks = $$('.main-nav a');
  if ('IntersectionObserver' in window && navLinks.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var t = $(a.getAttribute('href')); if (t) io.observe(t); });
  }

  /* mobile menu */
  var toggle = $('.menu-toggle'), mm = $('.mobile-menu');
  if (toggle && mm) {
    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
      mm.hidden = !open;
    };
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    $$('a', mm).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- treatment builder ---------- */
  var tabs = $$('.b-tab'), panels = $$('.b-panel');
  var showCat = function (cat, focus) {
    tabs.forEach(function (t) {
      var on = t.dataset.cat === cat;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
      if (on && mqMobile.matches) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
    panels.forEach(function (p) { var on = p.dataset.cat === cat; p.hidden = !on; p.classList.toggle('is-active', on); });
  };
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showCat(t.dataset.cat); });
    t.addEventListener('keydown', function (e) {
      var d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      showCat(tabs[(i + d + tabs.length) % tabs.length].dataset.cat, true);
    });
  });
  $$('[data-goto]').forEach(function (a) {
    a.addEventListener('click', function () { showCat(a.dataset.goto); });
  });

  var items = $$('.t-item');
  var note = $('#uzenet'), noteCard = $('.note-card'), list = $('.note-list');
  var empty = $('.note-empty'), totalRow = $('.note-total'), sum = $('.note-sum'), hint = $('.note-hint');
  var send = $('.note-send'), nameIn = $('.note-name input');
  var whens = $$('.note-when input');
  var mOpen = $('.m-open'), mLabel = $('.m-label');

  items.forEach(function (b, i) { b.dataset.idx = i; });
  var nameOf = function (b) {
    var n = $('.t-name', b).cloneNode(true);
    $$('small,.tag', n).forEach(function (x) { x.remove(); });
    return n.textContent.trim().replace(/\s+/g, ' ');
  };
  var catOf = function (b) { return b.closest('.b-panel').dataset.cat; };

  var render = function () {
    var sel = items.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; });
    list.innerHTML = '';
    var total = 0, from = false, ask = false;
    sel.forEach(function (b) {
      var p = +b.dataset.price || 0;
      total += p;
      if (b.dataset.from) from = true;
      if (b.dataset.ask) ask = true;
      var li = document.createElement('li');
      var nm = document.createElement('span'); nm.textContent = nameOf(b);
      var pr = document.createElement('b'); pr.textContent = $('.t-price', b).textContent.trim();
      var rm = document.createElement('button'); rm.type = 'button'; rm.textContent = '×';
      rm.setAttribute('aria-label', nameOf(b) + ' törlése');
      rm.addEventListener('click', function () { b.setAttribute('aria-pressed', 'false'); render(); });
      li.appendChild(nm); li.appendChild(pr); li.appendChild(rm);
      list.appendChild(li);
    });
    empty.hidden = sel.length > 0;
    totalRow.hidden = sel.length === 0;
    sum.textContent = (from || ask ? 'kb. ' : '') + ft(total);
    var h = [];
    if (from) h.push('A „-tól” árak a köröm állapotától függnek.');
    if (ask) h.push('Az UV-LED pilla árát Bogi megírja.');
    hint.textContent = h.join(' ');
    hint.hidden = !h.length;

    /* counters on tabs */
    tabs.forEach(function (t) {
      var c = sel.filter(function (b) { return catOf(b) === t.dataset.cat; }).length;
      var el = $('.b-count', t); el.textContent = c; el.classList.toggle('has', c > 0);
    });

    /* mobile bar label */
    if (mLabel) mLabel.textContent = sel.length ? (sel.length + ' kezelés · ' + sum.textContent) : 'Időpontot kérek';

    /* compose mail */
    var lines = ['Szia Bogi!', '', 'Ezekre szeretnék időpontot kérni:'];
    sel.forEach(function (b) { lines.push('– ' + nameOf(b) + ' (' + $('.t-price', b).textContent.trim() + ')'); });
    if (sel.length) lines.push('', 'Összesen: ' + sum.textContent.replace(/ /g, ' '));
    var w = whens.filter(function (x) { return x.checked; }).map(function (x) { return x.value; });
    if (w.length) lines.push('', 'Nekem ' + w.join(', ') + ' lenne jó.');
    lines.push('', 'Köszönöm!');
    if (nameIn && nameIn.value.trim()) lines.push(nameIn.value.trim());
    var subj = 'Időpontkérés' + (nameIn && nameIn.value.trim() ? ' – ' + nameIn.value.trim() : '');
    send.href = 'mailto:bogibense@gmail.com?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(lines.join('\n'));
    send.classList.toggle('is-off', sel.length === 0);
    send.setAttribute('aria-disabled', sel.length === 0 ? 'true' : 'false');
  };

  items.forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      render();
      if (on && noteCard && !mqMobile.matches) {
        noteCard.classList.remove('bump'); void noteCard.offsetWidth; noteCard.classList.add('bump');
      }
    });
  });
  whens.forEach(function (x) { x.addEventListener('change', render); });
  if (nameIn) nameIn.addEventListener('input', render);
  if (send) send.addEventListener('click', function (e) { if (send.classList.contains('is-off')) e.preventDefault(); });

  /* mobile sheet */
  var backdrop = document.createElement('div');
  backdrop.className = 'note-backdrop';
  document.body.appendChild(backdrop);
  var lastFocus = null;
  var openSheet = function () {
    if (!mqMobile.matches) { note.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    lastFocus = document.activeElement;
    note.classList.add('is-open'); backdrop.classList.add('is-on');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () { var c = $('.note-close'); if (c) c.focus(); }, 60);
  };
  var closeSheet = function () {
    note.classList.remove('is-open'); backdrop.classList.remove('is-on');
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  if (mOpen) mOpen.addEventListener('click', function () {
    var any = items.some(function (b) { return b.getAttribute('aria-pressed') === 'true'; });
    if (any) openSheet(); else $('#kezelesek').scrollIntoView({ behavior: 'smooth' });
  });
  backdrop.addEventListener('click', closeSheet);
  var nc = $('.note-close'); if (nc) nc.addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && note.classList.contains('is-open')) closeSheet(); });
  mqMobile.addEventListener && mqMobile.addEventListener('change', function () { if (!mqMobile.matches) closeSheet(); });

  render();

  /* ---------- gallery filter ---------- */
  var chips = $$('.w-filter .chip'), works = $$('.w-item');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var f = c.dataset.f;
      works.forEach(function (w) {
        var show = f === 'all' || w.dataset.k === f;
        w.classList.toggle('is-hidden', !show);
        if (show) { w.classList.remove('pop'); void w.offsetWidth; w.classList.add('pop'); }
      });
    });
  });

  /* ---------- lightbox ---------- */
  var lb = $('.lb'), lbImg = $('.lb img'), lbCap = $('.lb figcaption');
  var group = [], gi = 0, lbLast = null;
  var lbShow = function () {
    var a = group[gi];
    var im = $('img', a);
    lbImg.src = a.getAttribute('href');
    lbImg.alt = im ? im.alt : '';
    lbCap.textContent = a.dataset.cap || (im ? im.alt : '');
  };
  var lbOpen = function (set, i) {
    group = set; gi = i; lbLast = document.activeElement;
    lbShow(); lb.hidden = false; document.documentElement.style.overflow = 'hidden';
    $('.lb-close').focus();
  };
  var lbClose = function () { lb.hidden = true; document.documentElement.style.overflow = ''; if (lbLast) lbLast.focus(); };
  var bindLb = function (sel) {
    $$(sel).forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var set = $$(sel).filter(function (x) { return !x.classList.contains('is-hidden'); });
        lbOpen(set, set.indexOf(a));
      });
    });
  };
  if (lb) {
    bindLb('.w-item'); bindLb('.cert');
    $('.lb-close').addEventListener('click', lbClose);
    $('.lb-prev').addEventListener('click', function () { gi = (gi - 1 + group.length) % group.length; lbShow(); });
    $('.lb-next').addEventListener('click', function () { gi = (gi + 1) % group.length; lbShow(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') lbClose();
      if (e.key === 'ArrowLeft') $('.lb-prev').click();
      if (e.key === 'ArrowRight') $('.lb-next').click();
    });
  }

  /* ---------- intercom ---------- */
  var ic = $('.intercom'), msg = $('.ic-msg'), acts = $('.ic-actions');
  $$('.ic-key').forEach(function (k) {
    k.addEventListener('click', function () {
      $$('.ic-key').forEach(function (x) { x.classList.remove('is-lit', 'is-wrong'); });
      if (k.dataset.n === '44') {
        k.classList.add('is-lit');
        ic.classList.remove('ring'); void ic.offsetWidth; ic.classList.add('ring');
        msg.textContent = 'Bzzz… Bogi hallja! Hívd fel, vagy válaszd ki a kezelést, és írj neki.';
        acts.hidden = false;
      } else {
        k.classList.add('is-wrong');
        var suf = { '41': '41-es', '42': '42-es', '43': '43-as', '45': '45-ös', '46': '46-os' };
        msg.textContent = 'A ' + (suf[k.dataset.n] || k.dataset.n) + ' nem Bogi csengője. A 44-est keresd.';
        acts.hidden = true;
      }
    });
  });
})();
