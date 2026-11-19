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
    if (!portraitSeen || !portraitReady) return;
    aboutPortrait.classList.add('is-inview');
    // The hanging-photo animation at the bottom of this file listens for this.
    aboutPortrait.dispatchEvent(new CustomEvent('portfolio:portrait-reveal'));
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


/* Selected work — door entry sequence.
   Clicking a door swings it open, pushes the camera through the
   doorway, then reveals the matching project showcase. The same
   interaction reverses on the way back. */
const workDoors = document.querySelector('.work-doors');
const doorsCamera = document.getElementById('doorsCamera');
const workDoorsList = [...document.querySelectorAll('.work-doors .door')];
const doorShowcase = document.getElementById('projectShowcase');
const doorShowcaseKicker = document.getElementById('showcaseKicker');
const doorShowcaseTitle = document.getElementById('showcaseTitle');
const doorShowcaseIntro = document.getElementById('showcaseIntro');
const doorShowcaseCount = document.getElementById('showcaseCount');
const doorShowcaseDoor = document.getElementById('showcaseDoor');
const doorCards = [...document.querySelectorAll('.work-doors .door-card')];
const closeDoorButtons = [...document.querySelectorAll('[data-close-doors]')];

const doorCategoryData = {
  security: {
    index: '01',
    label: 'SECURITY',
    title: 'Security',
    count: '04 projects',
    accent: '#79c8c0',
    intro: 'Defensive thinking, careful implementation, and a habit of asking what could go wrong. These builds make security tangible.'
  },
  ai: {
    index: '02',
    label: 'AI',
    title: 'AI & Automation',
    count: '02 projects',
    accent: '#a9b6c4',
    intro: 'Tools that turn raw input into something useful — a clearer career path, a shorter video, a better next step.'
  },
  web: {
    index: '03',
    label: 'WEB',
    title: 'Web',
    count: '03 projects',
    accent: '#c2d8b8',
    intro: 'Browser-based work built around real workflows: clean structure, useful interfaces, and details that hold up.'
  },
  crypto: {
    index: '04',
    label: 'CRYPTOGRAPHY',
    title: 'Cryptography',
    count: '02 projects',
    accent: '#e0b089',
    intro: 'Cipher experiments and encryption tools, built to make the invisible mechanics of secrecy easier to see.'
  }
};

let activeWorkDoor = null;
let activeWorkFocus = null;
let doorAnimationToken = 0;
let autoReturnTimer = 0;

const clearAutoReturn = () => {
  if (!autoReturnTimer) return;
  window.clearTimeout(autoReturnTimer);
  autoReturnTimer = 0;
};

const scrollToWorkTop = (instant = false) => {
  if (!workDoors) return;
  const top = Math.max(0, workDoors.getBoundingClientRect().top + window.scrollY);
  // When Lenis is running, hand the jump to it so its internal target stays
  // in sync instead of fighting a native window.scrollTo.
  if (window.__lenis) {
    window.__lenis.scrollTo(top, { immediate: true, force: true });
    return;
  }
  if (!instant) {
    window.scrollTo({ top, behavior: 'auto' });
    return;
  }
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, top);
  root.style.scrollBehavior = previous;
};

const setShowcaseCategory = (category) => {
  const data = doorCategoryData[category];
  if (!data || !doorShowcase) return;

  doorShowcase.style.setProperty('--showcase-accent', data.accent);
  if (doorShowcaseKicker) doorShowcaseKicker.textContent = `BEHIND DOOR ${data.index} / ${data.label}`;
  if (doorShowcaseTitle) doorShowcaseTitle.textContent = data.title;
  if (doorShowcaseIntro) doorShowcaseIntro.textContent = data.intro;
  if (doorShowcaseCount) doorShowcaseCount.textContent = data.count;
  if (doorShowcaseDoor) doorShowcaseDoor.textContent = `DOOR ${data.index}`;

  let visibleIndex = 0;
  doorCards.forEach((card) => {
    const visible = (card.dataset.categories || '').split(/\s+/).includes(category);
    card.hidden = !visible;
    if (visible) {
      card.style.setProperty('--card-delay', `${140 + visibleIndex * 70}ms`);
      visibleIndex += 1;
    }
  });
};

const enterWorkDoor = (door) => {
  if (!workDoors || !door || !doorsCamera) return;
  if (workDoors.classList.contains('is-showcase') || workDoors.classList.contains('is-entering') || workDoors.classList.contains('is-closing')) return;

  const category = door.dataset.door;
  if (!category || !doorCategoryData[category]) return;

  clearAutoReturn();
  const token = ++doorAnimationToken;
  activeWorkDoor = door;
  setShowcaseCategory(category);

  const cameraRect = doorsCamera.getBoundingClientRect();
  const doorRect = door.getBoundingClientRect();
  // The open panel swings left, so its handle ends up near the left edge.
  const focusX = doorRect.left + doorRect.width * 0.17;
  const focusY = doorRect.top + doorRect.height * 0.7;
  const originX = focusX - cameraRect.left;
  const originY = focusY - cameraRect.top;
  const panX = window.innerWidth / 2 - focusX;
  const panY = window.innerHeight / 2 - focusY;
  activeWorkFocus = { originX, originY };
  doorsCamera.style.transformOrigin = `${originX}px ${originY}px`;
  doorsCamera.style.setProperty('--camera-pan-x', `${panX}px`);
  doorsCamera.style.setProperty('--camera-pan-y', `${panY}px`);

  workDoorsList.forEach((item) => item.classList.remove('is-open'));
  door.classList.add('is-open');
  workDoors.classList.remove('is-returning');

  let swapDelay = 30;
  if (prefersReducedMotion) {
    workDoors.classList.add('is-entering');
  } else {
    const doorOpenTime = 560;
    const cameraTime = 950;
    const cameraHoldTime = 260;
    swapDelay = doorOpenTime + cameraTime + cameraHoldTime;
    window.setTimeout(() => {
      if (token !== doorAnimationToken) return;
      workDoors.classList.add('is-entering');
    }, doorOpenTime);
  }

  window.setTimeout(() => {
    if (token !== doorAnimationToken) return;
    workDoors.classList.add('is-showcase');
    workDoors.classList.remove('is-entering');
    workDoors.setAttribute('aria-labelledby', 'showcaseTitle');
    doorsCamera.style.transformOrigin = '50% 50%';
    scrollToWorkTop();

    if (doorShowcaseTitle) {
      doorShowcaseTitle.setAttribute('tabindex', '-1');
      doorShowcaseTitle.focus({ preventScroll: true });
    }
  }, swapDelay);
};

const closeWorkDoors = () => {
  if (!workDoors || !workDoors.classList.contains('is-showcase') || workDoors.classList.contains('is-closing')) return;
  if (projectDialog && projectDialog.open) projectDialog.close();

  clearAutoReturn();
  workDoors.classList.add('is-closing');
  const token = ++doorAnimationToken;
  const delay = prefersReducedMotion ? 0 : 220;
  const returnHold = prefersReducedMotion ? 0 : 260;

  window.setTimeout(() => {
    if (token !== doorAnimationToken) return;

    // Re-enter the stage at the same 3D camera position used for the door,
    // hold the handle close-up, then pull back while the door swings shut.
    if (activeWorkFocus) {
      doorsCamera.style.transformOrigin = `${activeWorkFocus.originX}px ${activeWorkFocus.originY}px`;
    }
    doorsCamera.style.transition = 'none';
    workDoors.classList.add('is-returning-zoom');
    workDoors.classList.remove('is-showcase', 'is-closing');
    workDoors.classList.add('is-returning');
    workDoors.setAttribute('aria-labelledby', 'work-title');
    scrollToWorkTop(true);
    void doorsCamera.offsetWidth;

    window.setTimeout(() => {
      if (token !== doorAnimationToken) return;
      doorsCamera.style.transition = '';
      workDoors.classList.remove('is-returning-zoom');
    }, returnHold);

    if (activeWorkDoor) {
      const door = activeWorkDoor;
      window.setTimeout(() => {
        if (token === doorAnimationToken) door.classList.remove('is-open');
      }, returnHold + 700);
      door.focus({ preventScroll: true });
    }

    window.setTimeout(() => {
      if (token !== doorAnimationToken) return;
      workDoors.classList.remove('is-returning');
      doorsCamera.style.transformOrigin = '50% 50%';
    }, returnHold + 1100);
  }, delay);
};

if (workDoors && doorsCamera) {
  workDoorsList.forEach((door) => {
    door.addEventListener('click', () => enterWorkDoor(door));
  });

  closeDoorButtons.forEach((button) => {
    button.addEventListener('click', closeWorkDoors);
  });

  document.querySelectorAll('a[href="#work"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (workDoors.classList.contains('is-showcase')) {
        event.preventDefault();
        closeWorkDoors();
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && workDoors.classList.contains('is-showcase') && !(projectDialog && projectDialog.open)) {
      closeWorkDoors();
    }
  });

  const showcaseEnd = document.querySelector('.showcase-foot');
  if (showcaseEnd && 'IntersectionObserver' in window) {
    let endVisible = false;

    const armAutoReturn = () => {
      if (autoReturnTimer || !endVisible) return;
      if (!workDoors.classList.contains('is-showcase') || workDoors.classList.contains('is-closing')) return;

      autoReturnTimer = window.setTimeout(() => {
        autoReturnTimer = 0;
        if (!endVisible || !workDoors.classList.contains('is-showcase') || workDoors.classList.contains('is-closing')) return;
        if (projectDialog && projectDialog.open) {
          armAutoReturn();
          return;
        }
        closeWorkDoors();
      }, 1400);
    };

    const showcaseObserver = new IntersectionObserver((entries) => {
      endVisible = entries.some((entry) => entry.isIntersecting);
      if (!endVisible) {
        clearAutoReturn();
        return;
      }
      armAutoReturn();
    }, { threshold: 0.55, rootMargin: '0px 0px -8% 0px' });

    showcaseObserver.observe(showcaseEnd);
  }
}

/* =========================================================================
   Smooth scroll + velocity motion blur.

   Everything below is skipped for prefers-reduced-motion visitors, who keep
   plain native scrolling with no blur.
   ========================================================================= */

/* ---- Tunable constants -------------------------------------------------
   lerp          Lenis smoothing (lower = smoother / heavier)
   blurMax       strongest blur while sliding, desktop (px)
   skewMax       strongest vertical shear while sliding, desktop (deg)
   stretchMax    extra vertical scale at full speed (1 + this)
   velocityNorm  scroll velocity that maps to "full speed"
   damping       how fast blur/skew ease back to sharp (0-1 per frame)
   ----------------------------------------------------------------------- */
const SCROLL_MOTION = {
  lerp: 0.08,
  blurMax: 8,
  blurMaxMobile: 4,
  skewMax: 2.2,
  skewMaxMobile: 1.2,
  stretchMax: 0.0015,
  velocityNorm: 55,
  damping: 0.14
};

if (
  !prefersReducedMotion &&
  window.Lenis &&
  window.gsap &&
  window.ScrollTrigger &&
  document.getElementById('main')
) {
  const mainEl = document.getElementById('main');
  const htmlEl = document.documentElement;
  const mobileQuery = window.matchMedia('(max-width: 740px)');

  htmlEl.classList.add('motion-ready');

  gsap.registerPlugin(ScrollTrigger);

  /* ---- 1. Lenis smooth scroll, synced with GSAP + ScrollTrigger -------- */
  const lenis = new Lenis({
    lerp: SCROLL_MOTION.lerp,
    smoothWheel: true,
    autoRaf: false
  });
  window.__lenis = lenis;

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---- 2. Velocity-driven blur + vertical shear ----------------------- */
  let scrollVelocity = 0;
  let blur = 0;
  let skew = 0;
  let scale = 1;

  lenis.on('scroll', (event) => {
    scrollVelocity = event.velocity || 0;
  });

  const applyMotion = () => {
    const mobile = mobileQuery.matches;
    const maxBlur = mobile ? SCROLL_MOTION.blurMaxMobile : SCROLL_MOTION.blurMax;
    const maxSkew = mobile ? SCROLL_MOTION.skewMaxMobile : SCROLL_MOTION.skewMax;

    // Normalise velocity to 0-1, then ease the applied values toward it.
    const speed = Math.min(Math.abs(scrollVelocity) / SCROLL_MOTION.velocityNorm, 1);
    const targetBlur = speed * maxBlur;
    const targetSkew = Math.sign(scrollVelocity) * speed * maxSkew;
    const targetScale = 1 + speed * SCROLL_MOTION.stretchMax;

    blur += (targetBlur - blur) * SCROLL_MOTION.damping;
    skew += (targetSkew - skew) * SCROLL_MOTION.damping;
    scale += (targetScale - scale) * SCROLL_MOTION.damping;

    if (blur < 0.01) blur = 0;
    if (Math.abs(skew) < 0.005) skew = 0;
    if (Math.abs(scale - 1) < 0.00001) scale = 1;

    const moving = blur > 0 || skew !== 0 || scale !== 1;
    mainEl.classList.toggle('is-motion', moving);

    if (moving) {
      mainEl.style.filter = `blur(${blur.toFixed(2)}px)`;
      mainEl.style.transform = `skewY(${skew.toFixed(2)}deg) scaleY(${scale.toFixed(4)})`;
    } else if (mainEl.style.filter) {
      // Drop the layer entirely once we are at rest.
      mainEl.style.filter = '';
      mainEl.style.transform = '';
    }
  };

  gsap.ticker.add(applyMotion);

  /* ---- 3. Navbar / in-page anchors glide with Lenis ------------------- */
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    // Lenis already respects the page's `scroll-padding-top`, so the navbar
    // clearance is handled by CSS; no manual offset is needed here.
    lenis.scrollTo(target, { duration: 1.1 });
    if (history.pushState) history.pushState(null, '', hash);
  });

  // Land on the right spot if the page opens with a hash. Wait for the load
  // event so fonts and images have settled before measuring the target.
  const scrollToInitialHash = () => {
    if (!window.location.hash) return;
    const initialTarget = document.querySelector(window.location.hash);
    if (initialTarget) lenis.scrollTo(initialTarget, { immediate: true, force: true });
  };

  if (window.location.hash) {
    if (document.readyState === 'complete') {
      scrollToInitialHash();
    } else {
      window.addEventListener('load', () => window.setTimeout(scrollToInitialHash, 80), { once: true });
    }
  }

  // Re-measure once fonts/images have settled the layout.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* =========================================================================
   About: suspended portrait reveal.

   The portrait drops in on a string, swings past its resting angle, then
   keeps a slow pendulum sway. The heading and info rows use the CSS masks
   and cascade above. Skipped entirely for reduced-motion visitors.
   ========================================================================= */
if (!prefersReducedMotion && window.gsap) {
  const aboutPortrait = document.querySelector('.about-portrait');
  const aboutStage = document.querySelector('.about-portrait-stage');

  if (aboutPortrait && aboutStage) {
    document.documentElement.classList.add('about-motion-ready');

    const aboutString = aboutStage.querySelector('.about-portrait-string');
    const aboutPin = aboutStage.querySelector('.about-portrait-pin');
    let hangStarted = false;

    const startHang = () => {
      if (hangStarted) return;
      hangStarted = true;

      // Draw the string and pop the pin before the card settles.
      if (aboutString) {
        gsap.fromTo(aboutString, { scaleY: 0 }, { scaleY: 1, duration: .85, ease: 'power2.out' });
      }
      if (aboutPin) {
        gsap.fromTo(aboutPin, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .55, ease: 'back.out(2)' });
      }

      // Drop, overshoot, and settle around the pin above the photo.
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro
        .fromTo(aboutStage,
          { opacity: 0, y: -46, rotation: -11, rotationY: -10 },
          { opacity: 1, y: 0, rotation: -2.2, rotationY: 0, duration: 1.45 }
        )
        .to(aboutStage, { rotation: 2, rotationY: 2.6, duration: .95, ease: 'sine.inOut' }, '>-0.05')
        .to(aboutStage, { rotation: -1.8, rotationY: 0, duration: 1.05, ease: 'sine.inOut' });

      // A slow, endless pendulum once the entrance has finished.
      intro.eventCallback('onComplete', () => {
        gsap.to(aboutStage, {
          rotation: 1.4,
          rotationY: 2.2,
          duration: 4.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1
        });
      });
    };

    // The About observer may have fired before this block was reached. If the
    // browser has no IntersectionObserver, the observer is never set up, so
    // start the swing immediately instead of leaving the portrait hidden.
    if (!('IntersectionObserver' in window) || aboutPortrait.classList.contains('is-inview')) {
      startHang();
    } else {
      aboutPortrait.addEventListener('portfolio:portrait-reveal', startHang, { once: true });
    }
  }
}
