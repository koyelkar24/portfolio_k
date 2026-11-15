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

/* Builds the wireframe globe in the landing hero. The rings and
   surface nodes are sized in pixels so the 3D transforms stay true
   at any viewport width; they are rebuilt whenever the globe resizes. */
const globeSphere = document.querySelector('.globe-sphere');

if (globeSphere) {
  let builtSize = 0;

  const buildGlobe = () => {
    const size = Math.round(globeSphere.clientWidth);
    if (!size || size === builtSize) return;
    builtSize = size;

    const radius = size / 2;
    const fragment = document.createDocumentFragment();
    const random = (() => {
      let seed = 2026188;
      return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
    })();

    for (let deg = 0; deg < 180; deg += 15) {
      const meridian = document.createElement('span');
      meridian.className = 'globe-ring globe-meridian';
      if (deg === 0) meridian.classList.add('globe-meridian--prime');
      if (deg === 90) meridian.classList.add('globe-meridian--major');
      meridian.style.setProperty('--rot', `${deg}deg`);
      fragment.append(meridian);
    }

    for (let lat = -75; lat <= 75; lat += 15) {
      const rad = (lat * Math.PI) / 180;
      const ringRadius = Math.cos(rad) * radius;
      const latitude = document.createElement('span');
      latitude.className = 'globe-ring globe-latitude';
      if (lat === 0) latitude.classList.add('globe-latitude--equator');
      latitude.style.width = `${ringRadius * 2}px`;
      latitude.style.height = `${ringRadius * 2}px`;
      latitude.style.left = `${radius - ringRadius}px`;
      latitude.style.top = `${radius - ringRadius}px`;
      latitude.style.transform = `translateY(${-Math.sin(rad) * radius}px) rotateX(90deg)`;
      fragment.append(latitude);
    }

    const baseDot = size > 560 ? 3 : 2.4;
    const signalDot = size > 560 ? 5 : 4;
    const nodeCount = size > 600 ? 96 : size > 460 ? 72 : 52;

    for (let index = 0; index < nodeCount; index += 1) {
      const lat = (Math.asin(2 * random() - 1) * 180) / Math.PI;
      const lon = random() * 360;
      const signal = index % 11 === 0;
      const dotSize = signal ? signalDot : baseDot;
      const node = document.createElement('span');
      node.className = signal ? 'globe-node globe-node--signal' : 'globe-node';
      node.style.width = `${dotSize}px`;
      node.style.height = `${dotSize}px`;
      node.style.left = `${radius - dotSize / 2}px`;
      node.style.top = `${radius - dotSize / 2}px`;
      node.style.transform = `rotateY(${lon.toFixed(2)}deg) rotateX(${lat.toFixed(2)}deg) translateZ(${radius}px)`;
      fragment.append(node);
    }

    globeSphere.querySelectorAll('.globe-ring, .globe-node').forEach((element) => element.remove());
    globeSphere.append(fragment);
  };

  buildGlobe();

  let globeFrame = 0;
  const queueGlobeBuild = () => {
    cancelAnimationFrame(globeFrame);
    globeFrame = requestAnimationFrame(buildGlobe);
  };

  window.addEventListener('resize', queueGlobeBuild);
  if ('ResizeObserver' in window) {
    new ResizeObserver(queueGlobeBuild).observe(globeSphere);
  }
}

/* Brief title-card intro. It is skippable by click, key, or scroll,
   reveals the hero after the curtain lifts, and never runs when the
   visitor prefers reduced motion or JavaScript is unavailable. */
const intro = document.getElementById('intro');
const introRoot = document.documentElement;

if (intro && introRoot.classList.contains('intro-on')) {
  const introTimers = [];
  const introEvents = new AbortController();
  let introClosed = false;

  const hideIntro = () => {
    intro.hidden = true;
    intro.inert = true;
    introRoot.classList.remove('intro-exit', 'is-fast');
    introRoot.classList.add('intro-done');
  };

  const finishIntro = (fast) => {
    if (introClosed) return;
    introClosed = true;
    introTimers.forEach((timer) => window.clearTimeout(timer));
    introEvents.abort();

    introRoot.classList.remove('intro-on');
    introRoot.classList.add('intro-exit', 'intro-done');
    if (fast) introRoot.classList.add('is-fast');
    intro.inert = true;

    introTimers.push(window.setTimeout(hideIntro, fast ? 620 : 1080));
  };

  const listenIntro = (target, type, handler, options = {}) => {
    target.addEventListener(type, handler, { ...options, signal: introEvents.signal });
  };

  introTimers.push(window.setTimeout(() => finishIntro(false), 2000));

  listenIntro(intro, 'click', (event) => {
    event.preventDefault();
    finishIntro(true);
  });

  listenIntro(document, 'keydown', (event) => {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      finishIntro(true);
    }
  });

  listenIntro(window, 'wheel', () => finishIntro(true), { passive: true });
  listenIntro(window, 'touchmove', () => finishIntro(true), { passive: true });
  listenIntro(window, 'scroll', () => finishIntro(true), { passive: true });
}

/* About portrait: unveil it on first view, then let it drift
   against the page scroll. Both effects are skipped entirely
   when the visitor prefers reduced motion. */
const aboutPortrait = document.querySelector('.about-portrait');

if (aboutPortrait) {
  const portraitImage = aboutPortrait.querySelector('img');
  let portraitSeen = false;
  let portraitReady = !portraitImage || (portraitImage.complete && portraitImage.naturalWidth > 0);

  const revealPortrait = () => {
    if (portraitSeen && portraitReady) aboutPortrait.classList.add('is-inview');
  };

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    aboutPortrait.classList.add('will-reveal');

    const portraitObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        portraitSeen = true;
        observer.unobserve(entry.target);
        revealPortrait();
      });
    }, { threshold: 0.28, rootMargin: '0px 0px -36px 0px' });

    portraitObserver.observe(aboutPortrait);

    if (portraitImage) {
      if (!portraitReady) {
        portraitImage.addEventListener('load', () => {
          portraitReady = true;
          revealPortrait();
        }, { once: true });
      }
      portraitImage.addEventListener('error', () => {
        aboutPortrait.classList.remove('will-reveal');
      }, { once: true });
    }
  }

  if (!prefersReducedMotion) {
    let portraitFrame = 0;

    const driftPortrait = () => {
      portraitFrame = 0;
      const rect = aboutPortrait.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.bottom < -80 || rect.top > viewport + 80) return;

      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      const shift = Math.max(-13, Math.min(13, progress * -30));
      aboutPortrait.style.setProperty('--portrait-shift', `${shift.toFixed(1)}px`);
    };

    const queuePortraitDrift = () => {
      if (!portraitFrame) portraitFrame = window.requestAnimationFrame(driftPortrait);
    };

    window.addEventListener('scroll', queuePortraitDrift, { passive: true });
    window.addEventListener('resize', queuePortraitDrift);
    driftPortrait();
  }
}

/* About copy: reveal the heading and biography in sequence as the
   section arrives. Reduced-motion visitors see the finished layout. */
const aboutHeading = document.querySelector('.about-heading');
const aboutNarrative = document.querySelector('.about-narrative');

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const stageAboutElement = (element, className, threshold) => {
    if (!element) return;

    element.classList.add(className);

    const aboutObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-inview');
        observer.unobserve(entry.target);
      });
    }, { threshold, rootMargin: '0px 0px -36px 0px' });

    aboutObserver.observe(element);
  };

  stageAboutElement(aboutHeading, 'heading-reveal', 0.2);
  stageAboutElement(aboutNarrative, 'text-reveal', 0.08);
}
