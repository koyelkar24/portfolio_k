const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');
const header = document.querySelector('.site-header');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    primaryNav.classList.toggle('open', !isOpen);
  });

  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation');
      primaryNav.classList.remove('open');
    });
  });
}

const projectGrid = document.getElementById('projectGrid');
const visibleCount = document.getElementById('visible-count');
const projectDialog = document.querySelector('.project-dialog');
if (projectGrid) {
  const cards = [...projectGrid.querySelectorAll('.project-card')];
  document.querySelectorAll('.project-filter').forEach((filter) => {
    filter.addEventListener('click', () => {
      const selected = filter.dataset.filter;
      document.querySelectorAll('.project-filter').forEach((button) => {
        const active = button === filter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      let count = 0;
      cards.forEach((card) => {
        const visible = selected === 'all' || card.dataset.categories.split(' ').includes(selected);
        card.hidden = !visible;
        if (visible) count += 1;
      });
      if (visibleCount) visibleCount.textContent = String(count).padStart(2, '0');
    });
  });
  if (projectDialog) {
    projectGrid.querySelectorAll('.report-link').forEach((button) => {
      button.addEventListener('click', () => {
        projectDialog.querySelector('#dialog-title').textContent = button.dataset.title;
        projectDialog.querySelector('#dialog-copy').textContent = button.dataset.report;
        projectDialog.showModal();
      });
    });
  }
}

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 12);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const revealItems = document.querySelectorAll(
    '.section-heading, .project-visual, .project-number, .project-copy h3, .project-copy > p:not(.project-number), .tag-list, .project-link, .skill-card, .about-heading, .about-content, .education-item, .contact-inner'
  );
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal', 'is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -28px 0px' });

  revealItems.forEach((item) => {
    item.classList.add('reveal');
    revealObserver.observe(item);
  });
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 680 && navToggle && primaryNav) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
    primaryNav.classList.remove('open');
  }
});
