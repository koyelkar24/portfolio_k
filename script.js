const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const openingScene = document.getElementById('openingScene');
const skipIntro = document.getElementById('skipIntro');
const roleText = document.getElementById('roleText');

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

if (openingScene && !prefersReducedMotion) {
  let introRemovalTimer;
  let motionStarted = false;
  const finishIntro = () => {
    if (motionStarted) return;
    motionStarted = true;
    startPortfolioMotion();
    openingScene.classList.add('is-closing');
    introRemovalTimer = window.setTimeout(() => openingScene.remove(), 450);
  };
  skipIntro.addEventListener('click', finishIntro);
  introRemovalTimer = window.setTimeout(finishIntro, 2550);

  const laptop = openingScene.querySelector('.intro-laptop');
  if (laptop && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    openingScene.addEventListener('pointermove', (event) => {
      const x = (event.clientX / window.innerWidth - .5) * 3;
      const y = (event.clientY / window.innerHeight - .5) * -3;
      laptop.style.setProperty('--tilt-x', `${x}deg`);
      laptop.style.setProperty('--tilt-y', `${y}deg`);
    }, { passive: true });
  }
} else {
  openingScene?.remove();
  startPortfolioMotion();
}

if (roleText && !prefersReducedMotion) {
  const roles = ['Frontend Developer', 'Cybersecurity Enthusiast', 'Programmer'];
  let roleIndex = 0;
  window.setInterval(() => {
    roleIndex = (roleIndex + 1) % roles.length;
    roleText.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 360, easing: 'ease-out' });
    roleText.textContent = roles[roleIndex];
  }, 2600);
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
