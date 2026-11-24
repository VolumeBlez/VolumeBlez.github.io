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
