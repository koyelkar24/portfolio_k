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
    '.section-heading, .project-visual, .project-number, .project-copy h3, .project-copy > p:not(.project-number), .tag-list, .project-link, .skill-card, .about-heading, .about-content, .education-item'
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

/* =========================================================================
   Contact: scroll-triggered reveal.

   The header line draws in, the headline uncovers, then the lead, email CTA,
   card details, socials, and footer rise as they enter the viewport. Initial
   states are applied only when GSAP + ScrollTrigger are available, so
   reduced-motion and no-JS visitors always see the finished section. Triggers
   are created after load so they measure the final layout.
   ========================================================================= */
if (!prefersReducedMotion && window.gsap && window.ScrollTrigger) {
  const contact = document.getElementById('contact');

  if (contact) {
    gsap.registerPlugin(ScrollTrigger);

    const head = contact.querySelector('.contact-head');
    const kicker = contact.querySelector('.contact-kicker');
    const note = contact.querySelector('.contact-head-note');
    const headLine = contact.querySelector('.contact-head-line');
    const title = contact.querySelector('.contact-intro h2');
    const copy = contact.querySelector('.contact-copy');
    const lead = contact.querySelector('.contact-lead');
    const mailWrap = contact.querySelector('.contact-mail-wrap');
    const card = contact.querySelector('.contact-card');
    const cardTop = contact.querySelector('.contact-card-top');
    const metaRows = contact.querySelectorAll('.contact-meta-row');
    const socials = contact.querySelector('.contact-socials');
    const footer = document.querySelector('.site-footer');

    gsap.set([kicker, note], { y: 14, opacity: 0 });
    gsap.set(headLine, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(title, { y: 40, opacity: 0, clipPath: 'inset(0 0 100% 0)' });
    gsap.set([lead, mailWrap], { y: 24, opacity: 0 });
    gsap.set(mailWrap, { scale: .985 });

    const cardStart = window.matchMedia('(max-width: 900px)').matches
      ? { y: 32, x: 0, rotationY: 0 }
      : { y: 0, x: 56, rotationY: -5 };
    gsap.set(card, { ...cardStart, opacity: 0, transformPerspective: 1100 });
    gsap.set(cardTop, { y: 12, opacity: 0 });
    gsap.set(metaRows, { y: 12, opacity: 0 });
    gsap.set(socials, { y: 10, opacity: 0 });
    if (footer) gsap.set(footer, { y: 16, opacity: 0 });

    const startReveal = () => {
      // 1. The contact header and headline uncover as the section enters.
      gsap.timeline({
        scrollTrigger: { trigger: head, start: 'top 82%', once: true },
        defaults: { ease: 'power3.out' }
      })
        .to(headLine, { scaleX: 1, duration: 1.1, ease: 'power3.inOut' })
        .to([kicker, note], { y: 0, opacity: 1, duration: .65, stagger: .08 }, .12)
        .to(title, { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.05 }, .22);

      // 2. The lead and email CTA rise together.
      gsap.timeline({
        scrollTrigger: { trigger: copy, start: 'top 85%', once: true },
        defaults: { ease: 'power3.out' }
      })
        .to(lead, { y: 0, opacity: 1, duration: .75 })
        .to(mailWrap, { y: 0, opacity: 1, scale: 1, duration: .85 }, .1);

      // 3. The card settles in 3D, then its details cascade.
      gsap.timeline({
        scrollTrigger: { trigger: card, start: 'top 85%', once: true },
        defaults: { ease: 'power3.out' }
      })
        .to(card, { x: 0, y: 0, rotationY: 0, opacity: 1, duration: 1.05 })
        .to(cardTop, { y: 0, opacity: 1, duration: .55 }, .55)
        .to(metaRows, { y: 0, opacity: 1, duration: .5, stagger: .07 }, .65)
        .to(socials, { y: 0, opacity: 1, duration: .5 }, .92);

      // 4. The footer closes the page with the same quiet rise.
      if (footer) {
        gsap.to(footer, {
          y: 0,
          opacity: 1,
          duration: .7,
          ease: 'power3.out',
          scrollTrigger: { trigger: footer, start: 'top 95%', once: true }
        });
      }

      ScrollTrigger.refresh();
    };

    // Trigger positions are measured after images have loaded. Creating them
    // during the initial parse can make the first trigger fire against a
    // shorter page and remove itself before the reveal has a chance to run.
    if (document.readyState === 'complete') {
      startReveal();
    } else {
      window.addEventListener('load', startReveal, { once: true });
    }
  }
}

/* =========================================================================
   Skills: interactive working-matrix.

   Every skill tile opens one floating details panel. Project names are only
   rendered on demand from the real project registry below, so the section
   stays quiet until a skill is selected. The section reveals in with
   GSAP + ScrollTrigger; the panel uses a short CSS transition plus a small
   GSAP content stagger.
   ========================================================================= */
if (window.gsap && window.ScrollTrigger && document.getElementById('skills')) {
  const skillsSection = document.getElementById('skills');
  const skillsHeading = skillsSection.querySelector('.skills-heading');
  const skillsEyebrow = skillsSection.querySelector('.skills-heading .eyebrow');
  const skillsColumns = skillsSection.querySelectorAll('.skills-column');
  const matrixBadges = skillsSection.querySelectorAll('.skill-badge');
  const toolBadges = skillsSection.querySelectorAll('.skill-tool');
  const skillBadges = skillsSection.querySelectorAll('.skill-badge, .skill-tool');
  const skillsToolkit = skillsSection.querySelector('.skills-toolkit');

  const projectRegistry = {
    passwordAnalyzer: { name: 'Password Analyzer', href: 'https://github.com/koyelkar24/passwordAnalyser' },
    careerAssistant: { name: 'Career Assistant', href: 'https://github.com/koyelkar24/Career-Assistant' },
    jArcVideo: { name: 'J.A.R.V.I.S. Video Summarizer', href: 'https://github.com/koyelkar24/summarization_dashboard' },
    deepfake: { name: 'Deepfake Image Tampering Detector', href: 'https://github.com/arkap1502/Deepfake-Image-Tampering-Detector' },
    secureVault: { name: 'Secure Vault System', href: 'https://github.com/dipanjann804-svg/Secure-Vault-System' },
    textEncryption: { name: 'Text Encryption Tool', href: 'https://github.com/koyelkar24/text_encryption' }
  };

  const skillsDirectory = {
    'Password audit': { type: 'project', builds: ['passwordAnalyzer', 'secureVault'] },
    'Breach checks': { type: 'project', builds: ['passwordAnalyzer'] },
    'Web app security': { type: 'project', builds: ['passwordAnalyzer', 'secureVault', 'careerAssistant'] },
    'Encryption': { type: 'project', builds: ['secureVault', 'textEncryption'] },
    'Access control': { type: 'project', builds: ['secureVault'] },
    'Digital forensics': { type: 'project', builds: ['deepfake'] },
    'Threat modeling': { type: 'foundation', builds: [] },
    'Network recon': { type: 'foundation', builds: [] },
    'HTML5': { type: 'project', builds: ['passwordAnalyzer', 'careerAssistant', 'secureVault'] },
    'CSS3': { type: 'project', builds: ['passwordAnalyzer', 'careerAssistant', 'secureVault'] },
    'JavaScript': { type: 'project', builds: ['passwordAnalyzer', 'careerAssistant', 'secureVault'] },
    'React.js': { type: 'foundation', builds: [] },
    'Responsive UI': { type: 'project', builds: ['passwordAnalyzer', 'careerAssistant', 'secureVault'] },
    'Flask': { type: 'project', builds: ['passwordAnalyzer', 'secureVault', 'careerAssistant'] },
    'REST APIs': { type: 'project', builds: ['passwordAnalyzer', 'secureVault', 'careerAssistant'] },
    'SQLite': { type: 'project', builds: ['passwordAnalyzer', 'secureVault', 'careerAssistant'] },
    'Python': { type: 'project', builds: ['passwordAnalyzer', 'careerAssistant', 'secureVault', 'textEncryption', 'jArcVideo'] },
    'OpenCV': { type: 'project', builds: ['deepfake'] },
    'Image analysis': { type: 'project', builds: ['deepfake'] },
    'Automation': { type: 'project', builds: ['careerAssistant', 'jArcVideo'] },
    'OCR': { type: 'foundation', builds: [] },
    'Tesseract': { type: 'foundation', builds: [] },
    'Scikit-learn': { type: 'foundation', builds: [] },
    'Random Forest': { type: 'foundation', builds: [] },
    'EasyOCR': { type: 'foundation', builds: [] },
    'TF-IDF': { type: 'foundation', builds: [] },
    'C': { type: 'foundation', builds: [] },
    'C++': { type: 'foundation', builds: [] },
    'SQL': { type: 'foundation', builds: [] },
    'MySQL': { type: 'foundation', builds: [] },
    'FastAPI': { type: 'foundation', builds: [] },
    'SQLAlchemy': { type: 'foundation', builds: [] },
    'JWT': { type: 'foundation', builds: [] },
    'bcrypt': { type: 'foundation', builds: [] },
    'Tailwind CSS': { type: 'foundation', builds: [] },
    'Vite': { type: 'foundation', builds: [] },
    'React Router': { type: 'foundation', builds: [] },
    'Axios': { type: 'foundation', builds: [] },
    'Git': { type: 'project', builds: ['passwordAnalyzer', 'careerAssistant', 'secureVault', 'textEncryption', 'jArcVideo', 'deepfake'] },
    'GitHub': { type: 'project', builds: ['passwordAnalyzer', 'careerAssistant', 'secureVault', 'textEncryption', 'jArcVideo', 'deepfake'] },
    'Linux': { type: 'foundation', builds: [] },
    'Kali Linux': { type: 'foundation', builds: [] },
    'Docker': { type: 'foundation', builds: [] },
    'VS Code': { type: 'foundation', builds: [] }
  };

  let skillPopup = null;
  let popupOpen = false;
  let activeBadge = null;

  function getPopup() {
    if (skillPopup) return skillPopup;
    skillPopup = document.createElement('div');
    skillPopup.className = 'skill-popup';
    skillPopup.setAttribute('role', 'dialog');
    skillPopup.setAttribute('aria-modal', 'false');
    skillPopup.setAttribute('aria-hidden', 'true');
    skillPopup.setAttribute('aria-labelledby', 'skillPopupName');
    skillPopup.setAttribute('tabindex', '-1');
    skillPopup.innerHTML = '<button type="button" class="skill-popup-close" aria-label="Close skill details">&times;</button><p class="skill-popup-category"></p><h3 class="skill-popup-name" id="skillPopupName"></h3><p class="skill-popup-caption"></p><div class="skill-popup-projects"></div>';
    skillPopup.querySelector('.skill-popup-close').addEventListener('click', () => closePopup(true));
    document.body.append(skillPopup);
    return skillPopup;
  }

  function categoryFor(badge) {
    const column = badge.closest('.skills-column');
    const heading = column ? column.querySelector('h3') : null;
    return heading ? heading.textContent.trim() : 'Toolkit';
  }

  function accentFor(badge) {
    const column = badge.closest('.skills-column');
    if (!column) return '#79c8c0';
    const accent = getComputedStyle(column).getPropertyValue('--skill-accent').trim();
    return accent || '#79c8c0';
  }

  function setSelectedBadge(badge) {
    skillBadges.forEach((button) => {
      const active = button === badge;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function setPopupContent(entry) {
    const popup = getPopup();
    const projects = popup.querySelector('.skill-popup-projects');
    const caption = popup.querySelector('.skill-popup-caption');
    projects.innerHTML = '';

    const builds = entry.type === 'project'
      ? entry.builds.map((key) => projectRegistry[key]).filter(Boolean)
      : [];

    if (builds.length) {
      builds.forEach((project) => {
        const link = document.createElement('a');
        link.className = 'skill-popup-project';
        link.href = project.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const label = document.createElement('span');
        label.className = 'project-name';
        label.textContent = project.name;
        const arrow = document.createElement('span');
        arrow.className = 'project-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '↗';
        link.append(label, arrow);
        projects.append(link);
      });
      caption.textContent = builds.length + ' related build' + (builds.length === 1 ? '' : 's') + ' · select one to open GitHub';
    } else {
      const note = document.createElement('p');
      note.className = 'skill-popup-note';
      note.textContent = entry.type === 'project'
        ? 'Project-tested capability. No public build is linked to this skill yet.'
        : 'Foundational knowledge — explored through coursework, labs, and hands-on practice.';
      projects.append(note);
      caption.textContent = entry.type === 'project' ? 'Project-tested' : 'Foundational';
    }
  }

  function openPopup(badge) {
    if (!badge) return;
    const popup = getPopup();
    const name = badge.dataset.skill || 'Skill';
    const entry = skillsDirectory[name] || { type: 'foundation', builds: [] };

    popup.style.setProperty('--skills-accent', accentFor(badge));
    popup.querySelector('.skill-popup-category').textContent = categoryFor(badge);
    popup.querySelector('.skill-popup-name').textContent = name;
    setPopupContent(entry);
    setSelectedBadge(badge);
    activeBadge = badge;
    popupOpen = true;
    popup.setAttribute('aria-hidden', 'false');
    popup.focus({ preventScroll: true });

    if (!prefersReducedMotion) {
      const newContent = popup.querySelectorAll('.skill-popup-project, .skill-popup-note');
      gsap.fromTo(popup.querySelector('.skill-popup-name'), { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .32, ease: 'power2.out', overwrite: true });
      if (newContent.length) {
        gsap.fromTo(newContent, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .35, stagger: .035, ease: 'power2.out', overwrite: true });
      }
    }
  }

  function closePopup(returnFocus = false) {
    if (!popupOpen) return;
    const focusTarget = activeBadge;
    popupOpen = false;
    activeBadge = null;
    skillPopup.setAttribute('aria-hidden', 'true');
    setSelectedBadge(null);
    if (returnFocus && focusTarget) focusTarget.focus({ preventScroll: true });
  }

  skillBadges.forEach((badge) => {
    badge.setAttribute('aria-haspopup', 'dialog');
    badge.addEventListener('click', () => openPopup(badge));
  });

  document.addEventListener('pointerdown', (event) => {
    if (!popupOpen) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('.skill-popup')) return;
    if (target.closest('.skill-badge, .skill-tool')) return;
    closePopup();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && popupOpen) closePopup(true);
  });

  gsap.set(skillsHeading, { y: 28, opacity: 0 });
  gsap.set(skillsEyebrow, { scale: .72, opacity: 0, transformOrigin: 'left center' });
  gsap.set(skillsColumns, { y: 32, opacity: 0 });
  gsap.set(matrixBadges, { y: 12, opacity: 0 });
  gsap.set(skillsToolkit, { y: 20, opacity: 0 });
  gsap.set(toolBadges, { y: 10, opacity: 0 });

  if (!prefersReducedMotion) {
    const reveal = gsap.timeline({
      scrollTrigger: { trigger: skillsSection, start: 'top 76%', once: true },
      defaults: { ease: 'power3.out' }
    });
    reveal
      .to(skillsHeading, { y: 0, opacity: 1, duration: .8 })
      .to(skillsEyebrow, { scale: 1, opacity: 1, duration: .9, ease: 'power4.out' }, 0)
      .to(skillsColumns, { y: 0, opacity: 1, duration: .8, stagger: .1 }, .14)
      .to(matrixBadges, { y: 0, opacity: 1, duration: .45, stagger: .018 }, .40)
      .to(skillsToolkit, { y: 0, opacity: 1, duration: .6 }, .60)
      .to(toolBadges, { y: 0, opacity: 1, duration: .4, stagger: .018 }, .72);
  } else {
    gsap.set([skillsHeading, skillsColumns, matrixBadges, skillsToolkit, toolBadges], { y: 0, opacity: 1 });
    gsap.set(skillsEyebrow, { scale: 1, opacity: 1 });
  }
}
