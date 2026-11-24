/* =========================================================
   Поведение сайта: меню, скролл-анимации, модалка, мелочи
   ========================================================= */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Шапка и активная секция ---------- */
  const header = document.querySelector('.header');
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);

      let activeIndex = -1;
      sections.forEach((section, index) => {
        if (section.getBoundingClientRect().top <= 160) activeIndex = index;
      });
      navLinks.forEach((link, index) => link.classList.toggle('is-active', index === activeIndex));

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  function closeMenu() {
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Открыть меню');
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });

  /* ---------- Появление блоков при скролле ---------- */
  const revealElements = Array.from(document.querySelectorAll('.reveal'));

  revealElements.forEach((el) => {
    const delay = el.dataset.delay;
    if (delay) el.style.setProperty('--reveal-delay', delay + 'ms');
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Ротация роли в hero ---------- */
  const rotator = document.getElementById('roleRotator');
  if (rotator && !reduceMotion) {
    const roles = ['Unity Developer', 'Gameplay Programmer', 'Tools Developer'];
    let index = 0;
    setInterval(() => {
      rotator.style.opacity = '0';
      setTimeout(() => {
        index = (index + 1) % roles.length;
        rotator.textContent = roles[index];
        rotator.style.opacity = '1';
      }, 220);
    }, 2800);
    rotator.style.transition = 'opacity .22s ease';
  }

  /* ---------- Галерея кадров в кейсе ---------- */
  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const items = Array.from(gallery.querySelectorAll('[data-gallery-item]'));
    const current = gallery.querySelector('.gallery__current');
    const openButton = gallery.querySelector('[data-gallery-open]');
    const prev = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const dots = Array.from(gallery.querySelectorAll('[data-gallery-dot]'));
    if (!items.length || !current || !openButton) return;

    if (items.length < 2) {
      [prev, next, ...dots].forEach((el) => { if (el) el.hidden = true; });
      return;
    }

    const title = gallery.closest('.case')?.querySelector('h3')?.textContent.trim() || 'Кадр';
    let index = 0;

    function render() {
      const item = items[index];
      const src = item.getAttribute('src');
      current.src = src;
      current.alt = item.getAttribute('alt') || '';
      openButton.dataset.media = src;
      openButton.dataset.mediaPoster = src;
      openButton.dataset.caption = `${title} — кадр ${index + 1} из ${items.length}`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
        if (i === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    function go(step) {
      index = (index + step + items.length) % items.length;
      render();
    }

    if (prev) prev.addEventListener('click', () => go(-1));
    if (next) next.addEventListener('click', () => go(1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => { index = i; render(); }));

    gallery.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
    });

    render();
  });

  /* ---------- Модалка с гифками/картинками ---------- */
  const modal = document.getElementById('mediaModal');
  const modalImage = document.getElementById('modalImage');
  const modalCaption = document.getElementById('modalCaption');
  const modalClose = document.getElementById('modalClose');
  let lastFocused = null;

  function openModal(button) {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');

    modalCaption.textContent = button.dataset.caption || '';
    modalImage.alt = button.querySelector('img')?.alt || '';

    let usingFallback = false;
    modalImage.onerror = () => {
      if (usingFallback) return;
      usingFallback = true;
      modalImage.src = button.dataset.mediaPoster || '';
    };
    modalImage.src = button.dataset.media || '';
    modalClose.focus();
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    modalImage.removeAttribute('src');
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-media]').forEach((button) => {
    button.addEventListener('click', () => openModal(button));
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeModal();
    closeMenu();
  });

  /* ---------- Год в футере ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
