const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-ready');

  const revealItems = document.querySelectorAll(
    '.section-heading, .project, .about-heading, .about-content, .education-item, .contact-inner'
  );
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal', 'is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -32px 0px' });

  revealItems.forEach((item) => {
    item.classList.add('reveal');
    revealObserver.observe(item);
  });
}

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

window.addEventListener('resize', () => {
  if (window.innerWidth > 680) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
    primaryNav.classList.remove('open');
  }
});
