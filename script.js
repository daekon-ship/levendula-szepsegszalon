/* Levendula Szépségszalon – interactions (no dependencies) */
document.documentElement.classList.add('js');
if (/[?&]static/.test(window.location.search)) document.documentElement.classList.add('static');

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header state ---------- */
  var header = document.querySelector('.site-header');
  var lastY = 0;
  var onScroll = function () {
    var y = window.scrollY;
    if (y > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
    /* header slides away when scrolling down fast, returns on scroll up */
    if (y > 320 && y > lastY + 6) header.classList.add('hides');
    else if (y < lastY - 4 || y <= 320) header.classList.remove('hides');
    lastY = y;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    doc.style.setProperty('--p', max > 0 ? Math.min(y / max, 1).toFixed(4) : 0);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.querySelector('.mobile-menu');
  if (menu) menu.removeAttribute('hidden');

  var setMenu = function (open) {
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  toggle.addEventListener('click', function () {
    setMenu(!document.body.classList.contains('menu-open'));
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- hero entrance choreography ---------- */
  /* elements get .pre (hidden state) in CSS only when .js is present;
     after load we swap to .in with staggered timing for a cinematic entry */
  var heroSeq = document.querySelectorAll('.hero-seq');
  if (!reduceMotion && !document.documentElement.classList.contains('static')) {
    document.body.classList.add('intro-pending');
    heroSeq.forEach(function (el) { el.classList.add('pre'); });
    /* wait for hero image decode so entrance never flashes a half-image */
    var heroImg = document.querySelector('.hero-media img');
    var start = function () {
      requestAnimationFrame(function () {
        document.body.classList.remove('intro-pending');
        heroSeq.forEach(function (el) {
          var d = parseFloat(el.getAttribute('data-seq') || '1');
          setTimeout(function () {
            el.classList.add('in');
            el.classList.remove('pre');
          }, d * 140);
        });
      });
    };
    if (heroImg && !heroImg.complete) {
      heroImg.addEventListener('load', start, { once: true });
      setTimeout(start, 1400); /* failsafe */
    } else {
      start();
    }
  } else {
    heroSeq.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- scroll reveals (staged masks + lifts) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    /* biztosíték: a médiaképek soha nem maradhatnak láthatatlanok.
       Ha bármi miatt nem sült el a reveal (gyors görgetés, observer-hiba),
       a betöltés után 2,5 mp-rel mindenképp megjelenítjük őket. */
    window.addEventListener('load', function () {
      setTimeout(function () {
        revealEls.forEach(function (el) {
          if (el.classList.contains('r-media') && !el.classList.contains('in')) el.classList.add('in');
        });
      }, 2500);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- subtle parallax on media (compositor-only transforms) ---------- */
  if (!reduceMotion) {
    var pxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if (pxEls.length) {
      var ticking = false;
      var parallax = function () {
        var vh = window.innerHeight;
        pxEls.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          /* progress -0.5..0.5 across viewport */
          var p = (r.top + r.height / 2 - vh / 2) / vh;
          var speed = parseFloat(el.getAttribute('data-parallax')) || 0.08;
          el.style.transform = 'translateY(' + (p * speed * 100).toFixed(2) + 'px) scale(1.08)';
        });
        ticking = false;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
      }, { passive: true });
      parallax();
    }
  }

  /* ---------- services: floating preview image (desktop) ---------- */
  var floatEl = document.querySelector('.service-float');
  var floatImg = floatEl ? floatEl.querySelector('img') : null;
  var index = document.querySelector('.service-index');
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (floatEl && index && canHover) {
    var fx = 0, fy = 0, cx = 0, cy = 0, rafId = 0;
    var loop = function () {
      cx += (fx - cx) * 0.16;
      cy += (fy - cy) * 0.16;
      floatEl.style.left = cx.toFixed(1) + 'px';
      floatEl.style.top = cy.toFixed(1) + 'px';
      if (Math.abs(fx - cx) > 0.3 || Math.abs(fy - cy) > 0.3) {
        rafId = requestAnimationFrame(loop);
      } else {
        rafId = 0; /* settle: no leaked render loop */
      }
    };
    var ensureRaf = function () { if (!rafId) rafId = requestAnimationFrame(loop); };
    index.addEventListener('mousemove', function (e) {
      fx = e.clientX; fy = e.clientY;
      ensureRaf();
    });
    index.querySelectorAll('.service-row').forEach(function (row) {
      row.addEventListener('mouseenter', function (e) {
        fx = e.clientX; fy = e.clientY;
        var src = row.getAttribute('data-img');
        if (src && floatImg.getAttribute('src') !== src) floatImg.setAttribute('src', src);
        floatEl.classList.add('on');
      });
      row.addEventListener('mouseleave', function () {
        floatEl.classList.remove('on');
      });
    });
    window.addEventListener('blur', function () {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    });
  }

  /* ---------- mobil árlista fülek ---------- */
  var priceGrid = document.querySelector('.price-grid');
  var priceTabs = document.querySelector('.price-tabs');
  if (priceGrid && priceTabs) {
    var pBlocks = priceGrid.querySelectorAll('[data-block]');
    var pTabs = priceTabs.querySelectorAll('.ptab');
    var setPriceTab = function (id) {
      pBlocks.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-block') === id); });
      pTabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === id;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    };
    pTabs.forEach(function (t) {
      t.addEventListener('click', function () { setPriceTab(t.getAttribute('data-tab')); });
    });
    setPriceTab('1');
    priceGrid.classList.add('tab-mode');
  }

  /* ---------- fix mobil gyors-CTA sáv ---------- */
  /* Megjelenik a hero után; ELREJTŐZIK, amíg a kapcsolat szekció vagy a lábléc látható,
     és menü nyitva mellett is rejtett. Így semmilyen tartalmat nem takar. */
  var ctaBar = document.querySelector('.cta-bar');
  if (ctaBar) {
    var heroEl = document.querySelector('.hero');
    var showAfter = heroEl ? Math.round(heroEl.offsetHeight * 0.55) : 400;
    var footerEl = document.querySelector('.site-footer');
    var contactEl = document.querySelector('.contact');
    var pastHero = false;
    var overFooter = false;
    var ctaUpdate = function () {
      ctaBar.classList.toggle('show', pastHero && !overFooter);
    };
    /* pozíció-alapú ellenőrzés minden frame-ben (nem csak IO-ra hagyatkozunk) */
    var ctaOnScroll = function () {
      pastHero = window.scrollY > showAfter;
      if (footerEl || contactEl) {
        var vh = window.innerHeight;
        var hidden = false;
        [footerEl, contactEl].forEach(function (el) {
          if (!el) return;
          var r = el.getBoundingClientRect();
          if (r.top < vh && r.bottom > 0) hidden = true;
        });
        overFooter = hidden;
      }
      ctaUpdate();
    };
    window.addEventListener('scroll', ctaOnScroll, { passive: true });
    window.addEventListener('resize', ctaOnScroll, { passive: true });
    ctaOnScroll();
    /* IO csak tartalék, ha a getBoundingClientRect-mérés nem elég pontos (pl. programozott scroll) */
    if ('IntersectionObserver' in window && (footerEl || contactEl)) {
      var ctaIo = new IntersectionObserver(function () { ctaOnScroll(); }, { threshold: 0.05 });
      if (footerEl) ctaIo.observe(footerEl);
      if (contactEl) ctaIo.observe(contactEl);
    }
  }

  /* ---------- active nav highlight ---------- */
  var navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  var sections = [];
  navLinks.forEach(function (a) {
    var s = document.querySelector(a.getAttribute('href'));
    if (s) sections.push({ link: a, el: s });
  });
  if ('IntersectionObserver' in window && sections.length) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var hit = sections.find(function (s) { return s.el === en.target; });
        if (hit && en.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          hit.link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navIo.observe(s.el); });
  }
})();
