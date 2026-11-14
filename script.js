const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const openingScene = document.getElementById('openingScene');
const skipIntro = document.getElementById('skipIntro');
const portfolioViewport = document.getElementById('portfolioViewport');
const laptopScreen = document.querySelector('.laptop-screen');
const hasEntered = (() => {
  try { return sessionStorage.getItem('hasEntered') === 'true'; }
  catch { return false; }
})();

function rememberEntry() {
  try { sessionStorage.setItem('hasEntered', 'true'); } catch { /* Storage can be unavailable in private contexts. */ }
}

if (portfolioViewport) {
  const portfolioContent = [
    document.querySelector('.site-header'),
    document.querySelector('main'),
    document.querySelector('.site-footer')
  ];
  portfolioViewport.append(...portfolioContent.filter(Boolean));
}

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

function mountPortfolio() {
  if (!portfolioViewport || !openingScene) return;
  document.body.append(portfolioViewport);
  portfolioViewport.removeAttribute('style');
  portfolioViewport.classList.remove('portfolio-viewport', 'screen-zoom');
  portfolioViewport.classList.add('full-portfolio');
  portfolioViewport.removeAttribute('role');
  openingScene.remove();
  document.documentElement.classList.add('has-entered');
  document.body.classList.add('has-entered');
  startPortfolioMotion();
  createOrganicBloom();
}

function enterPortfolio(zoom = true) {
  if (!openingScene || openingScene.classList.contains('is-entering')) return;
  rememberEntry();
  if (!zoom || prefersReducedMotion || !portfolioViewport || !laptopScreen) {
    mountPortfolio();
    return;
  }
  openingScene.classList.add('is-entering');
  const rect = laptopScreen.getBoundingClientRect();
  const scale = Math.max(window.innerWidth / rect.width, window.innerHeight / rect.height) * 1.02;
  document.body.append(portfolioViewport);
  portfolioViewport.style.position = 'fixed';
  portfolioViewport.style.inset = 'auto';
  portfolioViewport.style.left = `${rect.left}px`;
  portfolioViewport.style.top = `${rect.top}px`;
  portfolioViewport.style.width = `${rect.width}px`;
  portfolioViewport.style.height = `${rect.height}px`;
  portfolioViewport.style.transformOrigin = 'center';
  portfolioViewport.style.transform = 'scale(1)';
  portfolioViewport.style.opacity = '1';
  portfolioViewport.style.zIndex = '1001';
  portfolioViewport.classList.add('screen-zoom');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    portfolioViewport.style.transform = `scale(${scale})`;
  }));
  window.setTimeout(mountPortfolio, 850);
}

if (openingScene && portfolioViewport) {
  if (hasEntered) {
    mountPortfolio();
  } else {
    if (prefersReducedMotion) openingScene.classList.add('reduced-motion-open');
    else openingScene.classList.add('is-opening');
    createOrganicBloom();
    skipIntro?.addEventListener('click', () => enterPortfolio(false));
    laptopScreen?.addEventListener('click', () => enterPortfolio(true));
    laptopScreen?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        enterPortfolio(true);
      }
    });
    laptopScreen?.setAttribute('role', 'button');
    laptopScreen?.setAttribute('tabindex', '0');
    laptopScreen?.setAttribute('aria-label', 'Enter Koyel Kar portfolio');
    const laptop = openingScene.querySelector('.intro-laptop');
    if (laptop && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
      openingScene.addEventListener('pointermove', (event) => {
        const x = (event.clientX / window.innerWidth - .5) * 2;
        const y = (event.clientY / window.innerHeight - .5) * -2;
        laptop.style.setProperty('--tilt-x', `${x}deg`);
        laptop.style.setProperty('--tilt-y', `${y}deg`);
      }, { passive: true });
    }
  }
} else {
  startPortfolioMotion();
}

function createOrganicBloom() {
  const hero = document.querySelector('.hero');
  if (!hero || hero.classList.contains('has-webgl') || !window.WebGLRenderingContext) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'bloom-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  hero.prepend(canvas);
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' }); }
  catch { gl = null; }
  if (!gl) { canvas.remove(); return; }
  const vertexSource = `attribute vec2 p; void main(){ gl_Position=vec4(p,0.,1.); }`;
  const fragmentSource = `precision mediump float;
    uniform vec2 resolution; uniform float time; uniform vec2 pointer;
    float petal(vec3 d){ float a=atan(d.y,d.x); float edge=pow(max(0.,1.-abs(d.z)),1.3); return .19*cos(8.*a + .32*sin(3.*a+time*.18))*edge + .045*cos(13.*a-2.*d.z)*edge; }
    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*resolution)/resolution.y;
      vec3 ro=vec3(0.,0.,4.2), rd=normalize(vec3(uv-vec2(.53+pointer.x*.025,.02+pointer.y*.02),-1.9));
      vec3 center=vec3(.48,0.,0.); vec3 oc=ro-center;
      float b=dot(oc,rd), c=dot(oc,oc)-2.95*2.95, h=b*b-c;
      vec3 color=vec3(.067,.071,.071);
      if(h>0.){
        float t=-b-sqrt(h); vec3 pos=ro+rd*t-center; vec3 n=normalize(pos);
        for(int i=0;i<3;i++){ float r=2.95+petal(n); t=-b-sqrt(max(0.,b*b-dot(oc,oc)+r*r)); pos=ro+rd*t-center; n=normalize(pos); }
        float light=max(0.,dot(n,normalize(vec3(-.42,.7,1.)))); float rim=pow(1.-max(0.,dot(n,-rd)),2.);
        float edge=smoothstep(-.8,1.45,n.x+.45*n.z);
        vec3 slate=vec3(.23,.27,.28), teal=vec3(.035,.44,.42); vec3 base=mix(slate,teal,edge);
        float facets=.965+.035*cos(10.*atan(n.y,n.x)+2.*n.z);
        color=base*(.36+.64*light)*facets + vec3(.10,.24,.23)*rim*.25;
        float fog=smoothstep(2.8,4.2,t); color=mix(color,vec3(.067,.071,.071),fog*.38);
      }
      gl_FragColor=vec4(color,1.);
    }`;
  const compile = (type, source) => {
    const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, vertexSource), fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vs || !fs) { canvas.remove(); return; }
  const program = gl.createProgram(); gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { canvas.remove(); return; }
  hero.classList.add('has-webgl');
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(program, 'p'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'resolution'), time = gl.getUniformLocation(program, 'time'), pointer = gl.getUniformLocation(program, 'pointer');
  let px = 0, py = 0, frame = 0;
  hero.addEventListener('pointermove', (event) => { const rect=hero.getBoundingClientRect(); px=(event.clientX-rect.left)/rect.width-.5; py=.5-(event.clientY-rect.top)/rect.height; }, { passive: true });
  const draw = (now) => {
    const width=hero.clientWidth, height=hero.clientHeight, dpr=Math.min(window.devicePixelRatio||1,1.25);
    const w=Math.max(1,Math.round(width*dpr)), h=Math.max(1,Math.round(height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
    gl.uniform2f(resolution,w,h); gl.uniform1f(time,now*.001); gl.uniform2f(pointer,px,py); gl.drawArrays(gl.TRIANGLES,0,6);
    if (!prefersReducedMotion) frame=window.requestAnimationFrame(draw);
  };
  if (prefersReducedMotion) draw(0); else frame=window.requestAnimationFrame(draw);
  window.addEventListener('pagehide',()=>window.cancelAnimationFrame(frame),{once:true});
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
