(() => {
  'use strict';
  document.body.classList.add('js');
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('homepage-menu');
  const mobile = window.matchMedia('(max-width: 700px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function setMenuOpen(open, returnFocus = false) {
    menu.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (returnFocus) menuButton.focus();
  }
  menuButton.hidden = false;
  menuButton.addEventListener('click', () => setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const wasOpen = menuButton.getAttribute('aria-expanded') === 'true';
    setMenuOpen(false);
    if (wasOpen) {
      const destination = document.querySelector(link.getAttribute('href'));
      destination?.setAttribute('tabindex', '-1');
      destination?.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenuOpen(false, true);
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) setMenuOpen(false); });
  if (mobile.addEventListener) mobile.addEventListener('change', () => setMenuOpen(false));
  else mobile.addListener(() => setMenuOpen(false));

  const newsButton = document.getElementById('show-more-news');
  const collapseButton = document.getElementById('collapse-news');
  const newsItems = [...document.querySelectorAll('#news-list .news-item')];
  const newsHeading = document.getElementById('news');
  function setNewsExpanded(expanded, fromBottom = false) {
    newsItems.forEach((item, index) => { item.hidden = !expanded && index >= 5; });
    newsButton.setAttribute('aria-expanded', String(expanded));
    newsButton.textContent = expanded ? 'Show recent updates' : `All updates (${newsItems.length})`;
    collapseButton.hidden = !expanded;
    if (fromBottom) {
      newsButton.focus({ preventScroll: true });
      newsHeading.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    }
  }
  if (newsItems.length > 5) {
    newsButton.hidden = false;
    setNewsExpanded(false);
    newsButton.addEventListener('click', () => setNewsExpanded(newsButton.getAttribute('aria-expanded') !== 'true'));
    collapseButton.addEventListener('click', () => setNewsExpanded(false, true));
  }

  const dialog = document.getElementById('figure-dialog');
  const preview = document.getElementById('figure-preview');
  const figureTitle = document.getElementById('figure-title');
  const original = document.getElementById('figure-original');
  let previousFocus;
  if (typeof dialog.showModal === 'function') {
    document.querySelectorAll('.figure-link').forEach(link => {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        previousFocus = link;
        const image = link.querySelector('img');
        preview.src = link.href;
        preview.alt = image.alt;
        original.href = link.href;
        figureTitle.textContent = link.closest('.paper-card').querySelector('h3').textContent;
        dialog.showModal();
        document.documentElement.classList.add('figure-is-open');
      });
    });
    dialog.querySelector('.figure-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const first = dialog.querySelector('.figure-close');
      const last = original;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('figure-is-open');
      previousFocus?.focus({ preventScroll: true });
    });
  }

  const navLinks = [...menu.querySelectorAll('a[href^="#"]')];
  const headings = navLinks.map(link => document.querySelector(link.getAttribute('href')));
  let scheduled = false;
  function updateNavigation() {
    let current = -1;
    headings.forEach((heading, index) => {
      if (heading && heading.getBoundingClientRect().top <= window.innerHeight * 0.35) current = index;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = headings.length - 1;
    navLinks.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); }
  }, { passive: true });
  window.addEventListener('resize', updateNavigation);
  updateNavigation();
})();
