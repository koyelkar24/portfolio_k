const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const openingScene = document.getElementById('openingScene');
const skipIntro = document.getElementById('skipIntro');

function startPortfolioMotion() {
  document.documentElement.classList.add('entry-complete');
  if (prefersReducedMotion) return;

  document.documentElement.classList.add('motion-ready');

  const glyphs = 'abcdefghijklmnopqrstuvwxyz';
  document.querySelectorAll('[data-decode]').forEach((line, lineIndex) => {
    const finalText = line.dataset.decode;
    const characters = [...finalText];
    let frame = 0;
    const totalFrames = 26;

    window.setTimeout(() => {
      const decoder = window.setInterval(() => {
        frame += 1;
        line.textContent = characters.map((character, index) => {
          if (character === ' ' || frame > (index / characters.length) * totalFrames) return character;
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join('');

        if (frame >= totalFrames) {
          window.clearInterval(decoder);
          line.textContent = finalText;
        }
      }, 42);
    }, lineIndex * 320);
  });

  if (!('IntersectionObserver' in window)) return;
  const revealItems = document.querySelectorAll(
    '.section-heading, .project-visual, .project-number, .project-copy h3, .project-copy > p:not(.project-number), .tag-list, .project-link, .about-heading, .about-content, .education-item, .contact-inner'
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

if (openingScene) {
  let introRemovalTimer;
  let doorsOpened = 0;
  let motionStarted = false;
  const beginAfterDoorsOpen = () => {
    if (motionStarted) return;
    motionStarted = true;
    startPortfolioMotion();
  };
  const removeOpeningScene = () => {
    if (introRemovalTimer) window.clearTimeout(introRemovalTimer);
    openingScene.remove();
  };

  skipIntro.addEventListener('click', () => {
    beginAfterDoorsOpen();
    openingScene.classList.add('is-skipped');
    introRemovalTimer = window.setTimeout(removeOpeningScene, 450);
  });
  openingScene.addEventListener('animationend', (event) => {
    if (event.target.classList.contains('entry-door-leaf') && event.animationName.startsWith('simple-door-')) {
      doorsOpened += 1;
      if (doorsOpened === 2) beginAfterDoorsOpen();
    }
    if (event.target === openingScene && event.animationName === 'opening-scene-close') removeOpeningScene();
  });
  window.setTimeout(beginAfterDoorsOpen, prefersReducedMotion ? 2200 : 2700);
  introRemovalTimer = window.setTimeout(removeOpeningScene, prefersReducedMotion ? 3200 : 3800);
} else {
  startPortfolioMotion();
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
