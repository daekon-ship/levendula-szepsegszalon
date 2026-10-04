/* Levendula Szépségszalon – interactions (no dependencies) */
document.documentElement.classList.add('js');
if (/[?&]static/.test(window.location.search)) document.documentElement.classList.add('static');

(function () {
  'use strict';

  /* ---------- header state ---------- */
  var header = document.querySelector('.site-header');
  var onScroll = function () {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
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

  /* ---------- scroll reveals ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- services: floating preview image (desktop) ---------- */
  var floatEl = document.querySelector('.service-float');
  var floatImg = floatEl ? floatEl.querySelector('img') : null;
  var index = document.querySelector('.service-index');
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (floatEl && index && canHover) {
    index.addEventListener('mousemove', function (e) {
      floatEl.style.left = e.clientX + 'px';
      floatEl.style.top = e.clientY + 'px';
    });
    index.querySelectorAll('.service-row').forEach(function (row) {
      row.addEventListener('mouseenter', function (e) {
        floatEl.style.left = e.clientX + 'px';
        floatEl.style.top = e.clientY + 'px';
        var src = row.getAttribute('data-img');
        if (src && floatImg.getAttribute('src') !== src) floatImg.setAttribute('src', src);
        floatEl.classList.add('on');
      });
      row.addEventListener('mouseleave', function () {
        floatEl.classList.remove('on');
      });
    });
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
