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

      // В самом низу страницы активен последний раздел (контакты)
      const atBottom = Math.ceil(y + window.innerHeight) >= document.documentElement.scrollHeight;
      if (atBottom && sections.length) activeIndex = sections.length - 1;

      navLinks.forEach((link, index) => link.classList.toggle('is-active', index === activeIndex));

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Кнопка «Наверх» ---------- */
  document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

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
    const source = gallery.querySelector('[data-gallery-source]');
    const items = source
      ? Array.from(source.content.querySelectorAll('img, video'))
      : Array.from(gallery.querySelectorAll('[data-gallery-item]'));
    const current = gallery.querySelector('.gallery__current');
    const currentVideo = gallery.querySelector('.gallery__video');
    const openButton = gallery.querySelector('[data-gallery-open]');
    const prev = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const dots = Array.from(gallery.querySelectorAll('[data-gallery-dot]'));
    if (!items.length || !current || !openButton) return;

    // Грузим картинки заранее, чтобы стрелки не ждали загрузку
    items.forEach((item) => {
      if (item.tagName === 'IMG') {
        const preloader = new Image();
        preloader.src = item.getAttribute('src');
      }
    });

    if (items.length < 2) {
      [prev, next, ...dots].forEach((el) => { if (el) el.hidden = true; });
      return;
    }

    const title = gallery.closest('.case')?.querySelector('h3')?.textContent.trim() || 'Кадр';
    let index = 0;

    function render() {
      const item = items[index];
      const src = item.getAttribute('src');
      const isVideo = item.tagName === 'VIDEO';

      if (isVideo) {
        current.hidden = true;
        if (currentVideo) {
          currentVideo.hidden = false;
          if (currentVideo.getAttribute('src') !== src) currentVideo.src = src;
          currentVideo.poster = item.getAttribute('poster') || '';
          currentVideo.play().catch(() => {});
        }
      } else {
        if (currentVideo) {
          currentVideo.pause();
          currentVideo.currentTime = 0;
          currentVideo.hidden = true;
        }
        current.hidden = false;
        current.src = src;
        current.alt = item.getAttribute('alt') || '';
      }

      openButton.dataset.media = src;
      openButton.dataset.mediaPoster = isVideo ? (item.getAttribute('poster') || '') : src;
      openButton.dataset.mediaType = isVideo ? 'video' : 'image';
      openButton.dataset.caption = isVideo
        ? `${title} — видео`
        : `${title} — кадр ${index + 1} из ${items.length}`;

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
  const modalVideo = document.getElementById('modalVideo');
  const modalCaption = document.getElementById('modalCaption');
  const modalClose = document.getElementById('modalClose');
  let lastFocused = null;

  function openModal(button) {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');

    modalCaption.textContent = button.dataset.caption || '';
    const media = button.dataset.media || '';
    const poster = button.dataset.mediaPoster || '';
    const isVideo = button.dataset.mediaType === 'video' || /\.(mp4|webm|ogg)$/i.test(media);

    modalImage.hidden = isVideo;
    modalVideo.hidden = !isVideo;

    if (isVideo) {
      modalVideo.poster = poster;
      modalVideo.src = media;
      modalVideo.play().catch(() => {});
    } else {
      modalVideo.pause();
      modalVideo.removeAttribute('src');
      modalImage.alt = button.querySelector('img')?.alt || '';

      let usingFallback = false;
      modalImage.onerror = () => {
        if (usingFallback) return;
        usingFallback = true;
        modalImage.src = poster;
      };
      modalImage.src = media;
    }
    modalClose.focus();
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    modalVideo.pause();
    modalVideo.removeAttribute('src');
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
