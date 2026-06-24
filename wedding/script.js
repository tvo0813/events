/* ════════════════════════════════════════════
   CUSTOM CURSOR
   ════════════════════════════════════════════ */
(function () {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  let mx = -200, my = -200, rx = -200, ry = -200;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function lerp(a, b, t) { return a + (b - a) * t; }
  function tick() {
    rx = lerp(rx, mx, 0.12); ry = lerp(ry, my, 0.12);
    dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(tick);
  }
  tick();
  document.querySelectorAll('a, button, .stay-btn, .rsvp-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '56px'; ring.style.height = '56px';
      ring.style.borderColor = 'rgba(201,169,110,0.8)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '32px'; ring.style.height = '32px';
      ring.style.borderColor = 'rgba(201,169,110,0.5)';
    });
  });
})();

/* ════════════════════════════════════════════
   HERO CANVAS — dark gold particle field
   ════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, t  = 0;
  let particles = [];
  const mouse = { x: -999, y: -999 };

  const GOLD_PALETTE = [
    'rgba(201,169,110,',
    'rgba(232,200,122,',
    'rgba(168,140,88,',
    'rgba(245,220,150,',
    'rgba(180,150,80,',
  ];

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkParticle() {
    return {
      x:      rnd(0, W),
      y:      rnd(0, H),
      vx:     rnd(-0.12, 0.12),
      vy:     rnd(-0.18, -0.04),
      size:   rnd(1, 3.5),
      col:    GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
      alpha:  rnd(0.2, 0.7),
      phase:  rnd(0, Math.PI * 2),
      pSpeed: rnd(0.006, 0.02),
    };
  }

  function init() { particles = Array.from({ length: 160 }, mkParticle); }

  function drawParticle(p) {
    const a = p.alpha * (0.4 + 0.6 * Math.abs(Math.sin(p.phase)));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.col + a + ')';
    ctx.fill();
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
    g.addColorStop(0, p.col + (a * 0.3) + ')');
    g.addColorStop(1, p.col + '0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawConnections() {
    const maxDist = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const a = (1 - d / maxDist) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(201,169,110,${a})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function draw() {
    t += 0.012;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, W, H);
    const bloom = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, W * 0.55);
    bloom.addColorStop(0,   'rgba(40,28,10,0.8)');
    bloom.addColorStop(0.4, 'rgba(20,14,5,0.4)');
    bloom.addColorStop(1,   'rgba(8,8,8,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, W, H);

    particles.forEach(p => {
      p.phase += p.pSpeed;
      p.x += p.vx + Math.sin(p.phase * 0.7) * 0.15;
      p.y += p.vy;
      if (p.y < -10) { p.y = H + 10; p.x = rnd(0, W); }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 160 && d > 1) {
        p.x += (dx / d) * 1.2 * (1 - d / 160);
        p.y += (dy / d) * 1.2 * (1 - d / 160);
      }
    });

    drawConnections();
    particles.forEach(drawParticle);

    if (mouse.x > 0 && mouse.x < W) {
      const aura = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
      aura.addColorStop(0,   'rgba(201,169,110,0.06)');
      aura.addColorStop(0.5, 'rgba(201,169,110,0.02)');
      aura.addColorStop(1,   'rgba(201,169,110,0)');
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  resize(); init(); draw();
  window.addEventListener('resize', () => { resize(); init(); });
})();

/* ════════════════════════════════════════════
   COUNTDOWN
   ════════════════════════════════════════════ */
(function () {
  const target = new Date('2026-11-28T08:00:00+07:00');
  function update() {
    const diff = target - new Date();
    if (diff <= 0) {
      document.getElementById('countdown').innerHTML =
        '<p style="font-family:var(--ff-serif);font-size:1.5rem;color:var(--champagne);letter-spacing:.15em">Today is the day</p>';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    document.getElementById('cd-days').textContent  = String(d).padStart(3,'0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
    document.getElementById('cd-mins').textContent  = String(m).padStart(2,'0');
    document.getElementById('cd-secs').textContent  = String(s).padStart(2,'0');
  }
  update();
  setInterval(update, 1000);
})();

/* ════════════════════════════════════════════
   NAV SCROLL
   ════════════════════════════════════════════ */
(function () {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60), { passive: true });
})();

/* ════════════════════════════════════════════
   SCENE FX CANVASES
   ════════════════════════════════════════════ */
(function () {
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* ── Shared canvas setup ── */
  function setupCanvas(canvas) {
    const parent = canvas.parentElement;
    canvas.width  = parent.offsetWidth  || 800;
    canvas.height = parent.offsetHeight || 600;
    window.addEventListener('resize', () => {
      canvas.width  = parent.offsetWidth  || 800;
      canvas.height = parent.offsetHeight || 600;
    }, { passive: true });
    return canvas.getContext('2d');
  }

  /* ── FX 1: Rose Petals (Ch I) ── */
  function initPetals(canvas) {
    const ctx = setupCanvas(canvas);
    const W = () => canvas.width, H = () => canvas.height;
    const COLS = ['rgba(220,140,140,', 'rgba(240,180,180,', 'rgba(255,210,210,', 'rgba(200,100,110,', 'rgba(255,230,230,'];
    let petals = [];

    function mkPetal() {
      return {
        x: rnd(0, W()), y: rnd(-H() * 0.2, H() * 0.4),
        size: rnd(6, 16), rot: rnd(0, Math.PI * 2),
        vx: rnd(-0.5, 0.5), vy: rnd(0.4, 1.4),
        rotSpeed: rnd(-0.025, 0.025),
        sway: rnd(0, Math.PI * 2), swaySpeed: rnd(0.008, 0.02),
        alpha: rnd(0.35, 0.75),
        col: COLS[Math.floor(Math.random() * COLS.length)],
      };
    }

    petals = Array.from({ length: 55 }, mkPetal);

    function draw() {
      ctx.clearRect(0, 0, W(), H());
      petals.forEach(p => {
        p.sway += p.swaySpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.8;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        if (p.y > H() + 20) { p.y = rnd(-80, -20); p.x = rnd(0, W()); }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.col + p.alpha + ')';
        // petal shape
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.45, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
        // subtle highlight
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.ellipse(-p.size * 0.1, -p.size * 0.25, p.size * 0.18, p.size * 0.35, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── FX 2: Bokeh Light Orbs (Ch II) ── */
  function initBokeh(canvas) {
    const ctx = setupCanvas(canvas);
    const W = () => canvas.width, H = () => canvas.height;
    const COLS = [
      'rgba(255,220,140,', 'rgba(255,200,100,', 'rgba(255,240,180,',
      'rgba(220,180,100,', 'rgba(255,255,200,',
    ];
    let orbs = [];

    function mkOrb() {
      return {
        x: rnd(0, W()), y: rnd(0, H()),
        r: rnd(14, 60),
        vx: rnd(-0.12, 0.12), vy: rnd(-0.25, -0.05),
        alpha: rnd(0.06, 0.22),
        pulse: rnd(0, Math.PI * 2), pulseSpeed: rnd(0.008, 0.018),
        col: COLS[Math.floor(Math.random() * COLS.length)],
      };
    }

    orbs = Array.from({ length: 45 }, mkOrb);

    function draw() {
      ctx.clearRect(0, 0, W(), H());
      orbs.forEach(o => {
        o.pulse += o.pulseSpeed;
        o.x += o.vx;
        o.y += o.vy;
        if (o.y < -80) { o.y = H() + 80; o.x = rnd(0, W()); }

        const a = o.alpha * (0.7 + 0.3 * Math.sin(o.pulse));
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0,   o.col + (a * 0.9) + ')');
        g.addColorStop(0.4, o.col + (a * 0.5) + ')');
        g.addColorStop(1,   o.col + '0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();

        // hard specular dot at centre
        ctx.fillStyle = `rgba(255,255,220,${a * 0.5})`;
        ctx.beginPath();
        ctx.arc(o.x - o.r * 0.2, o.y - o.r * 0.2, o.r * 0.12, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── FX 3: Floating Embers / Fireflies (Ch III) ── */
  function initEmbers(canvas) {
    const ctx = setupCanvas(canvas);
    const W = () => canvas.width, H = () => canvas.height;
    let embers = [];

    function mkEmber() {
      return {
        x: rnd(0, W()), y: rnd(H() * 0.3, H()),
        r: rnd(1.5, 4),
        vx: rnd(-0.3, 0.3), vy: rnd(-0.8, -0.2),
        alpha: rnd(0.4, 1),
        flicker: rnd(0, Math.PI * 2), flickSpeed: rnd(0.04, 0.1),
        col: Math.random() > 0.5 ? 'rgba(255,200,80,' : 'rgba(201,169,110,',
      };
    }

    embers = Array.from({ length: 60 }, mkEmber);

    function draw() {
      ctx.clearRect(0, 0, W(), H());
      embers.forEach(e => {
        e.flicker += e.flickSpeed;
        e.x += e.vx + Math.sin(e.flicker * 0.6) * 0.4;
        e.y += e.vy;
        if (e.y < -20) { e.y = H() + rnd(0, 40); e.x = rnd(0, W()); }

        const a = e.alpha * (0.5 + 0.5 * Math.abs(Math.sin(e.flicker)));
        // glow halo
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 5);
        g.addColorStop(0,   e.col + (a * 0.6) + ')');
        g.addColorStop(1,   e.col + '0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 5, 0, Math.PI * 2); ctx.fill();
        // bright core
        ctx.fillStyle = e.col + a + ')';
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,255,220,${a * 0.8})`;
        ctx.beginPath(); ctx.arc(e.x - e.r * 0.2, e.y - e.r * 0.2, e.r * 0.4, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── FX 4: Gold Confetti / Petal Rain (Ch IV) ── */
  function initConfetti(canvas) {
    const ctx = setupCanvas(canvas);
    const W = () => canvas.width, H = () => canvas.height;
    const SHAPES = ['rect', 'circle', 'petal'];
    const COLS = [
      'rgba(201,169,110,', 'rgba(232,200,122,',
      'rgba(245,225,160,', 'rgba(168,140,88,', 'rgba(255,240,200,',
    ];
    let pieces = [];

    function mkPiece() {
      return {
        x: rnd(0, W()), y: rnd(-H() * 0.5, 0),
        w: rnd(4, 10), h: rnd(6, 14),
        rot: rnd(0, Math.PI * 2), rotSpeed: rnd(-0.04, 0.04),
        vx: rnd(-0.4, 0.4), vy: rnd(0.5, 1.8),
        sway: rnd(0, Math.PI * 2), swaySpeed: rnd(0.01, 0.025),
        alpha: rnd(0.5, 0.9),
        col: COLS[Math.floor(Math.random() * COLS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      };
    }

    pieces = Array.from({ length: 65 }, mkPiece);

    function draw() {
      ctx.clearRect(0, 0, W(), H());
      pieces.forEach(p => {
        p.sway += p.swaySpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.6;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        if (p.y > H() + 20) { p.y = rnd(-100, -10); p.x = rnd(0, W()); }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.col + p.alpha + ')';

        if (p.shape === 'rect') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === 'circle') {
          ctx.beginPath(); ctx.arc(0, 0, p.w * 0.6, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.w * 0.4, p.h * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  const FX_MAP = { petals: initPetals, bokeh: initBokeh, embers: initEmbers, confetti: initConfetti };

  document.querySelectorAll('.scene-fx-canvas').forEach(canvas => {
    const fx = canvas.dataset.fx;
    if (FX_MAP[fx]) FX_MAP[fx](canvas);
  });
})();

/* ════════════════════════════════════════════
   SCROLLYTELLING — photo scenes + progress bar
   ════════════════════════════════════════════ */
(function () {
  const steps    = Array.from(document.querySelectorAll('.scrolly-step'));
  const frames   = document.querySelectorAll('.scrolly-frame');
  const progFill = document.getElementById('story-progress-fill');
  const section  = document.getElementById('story');
  if (!steps.length) return;

  let current = -1;

  function activate(idx) {
    if (idx === current) return;
    current = idx;
    frames.forEach(f => f.classList.remove('active'));
    const f = document.querySelector(`.scrolly-frame[data-frame="${idx}"]`);
    if (f) f.classList.add('active');
    steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
  }

  function onScroll() {
    if (progFill && section) {
      const r   = section.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
      progFill.style.height = (pct * 100) + '%';
    }
    const mid = window.innerHeight * 0.5;
    let best = 0, bestDist = Infinity;
    steps.forEach((step, i) => {
      const r    = step.getBoundingClientRect();
      const dist = Math.abs((r.top + r.height * 0.5) - mid);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    activate(best);
  }

  activate(0);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll,  { passive: true });
  setTimeout(onScroll, 120);
})();

/* ════════════════════════════════════════════
   REVEAL ON SCROLL
   ════════════════════════════════════════════ */
(function () {
  document.querySelectorAll('.details-section, .stay-section').forEach(s => s.classList.add('do-reveal'));
  const items = Array.from(document.querySelectorAll('[data-reveal]'));

  function check() {
    const vh = window.innerHeight;
    items.forEach(el => {
      if (el.classList.contains('revealed')) return;
      if (el.getBoundingClientRect().top < vh * 0.88) el.classList.add('revealed');
    });
  }

  requestAnimationFrame(check);
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check, { passive: true });
  window.addEventListener('load',   check);
})();

/* ════════════════════════════════════════════
   RSVP CANVAS — subtle dark particles
   ════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('rsvp-canvas');
  const ctx    = canvas.getContext('2d');
  const COLS   = [
    'rgba(201,169,110,', 'rgba(168,140,88,',
    'rgba(232,200,122,', 'rgba(140,115,70,', 'rgba(245,225,160,',
  ];
  let W, H, shapes = [];

  function resize() {
    const section = canvas.closest('.rsvp-section');
    W = canvas.width  = section ? section.offsetWidth  : window.innerWidth;
    H = canvas.height = section ? section.offsetHeight : window.innerHeight;
  }

  function mkShape() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      size: 3 + Math.random() * 18,
      alpha: 0.06 + Math.random() * 0.12,
      vx: (Math.random() - 0.5) * 0.25, vy: -0.2 - Math.random() * 0.4,
      rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.01,
      type: Math.random() > 0.5 ? 'petal' : 'diamond',
      col: COLS[Math.floor(Math.random() * COLS.length)],
    };
  }

  function drawPetal(s) {
    ctx.beginPath();
    ctx.moveTo(0, -s); ctx.bezierCurveTo(s * 0.6, -s * 0.6, s * 0.6, s * 0.6, 0, s);
    ctx.bezierCurveTo(-s * 0.6, s * 0.6, -s * 0.6, -s * 0.6, 0, -s); ctx.fill();
  }
  function drawDiamond(s) {
    ctx.beginPath();
    ctx.moveTo(0, -s); ctx.lineTo(s * 0.45, 0); ctx.lineTo(0, s); ctx.lineTo(-s * 0.45, 0);
    ctx.closePath(); ctx.fill();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    shapes.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.rot += s.rotSpeed;
      if (s.y < -50) { s.y = H + 50; s.x = Math.random() * W; }
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot);
      ctx.fillStyle = s.col + s.alpha + ')';
      s.type === 'petal' ? drawPetal(s.size) : drawDiamond(s.size);
      ctx.restore();
    });
    requestAnimationFrame(animate);
  }

  resize();
  shapes = Array.from({ length: 50 }, mkShape);
  animate();
  window.addEventListener('resize', resize, { passive: true });
})();


/* ════════════════════════════════════════════
   SMOOTH ANCHORS
   ════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ════════════════════════════════════════════
   PARALLAX — hero text on scroll
   ════════════════════════════════════════════ */
(function () {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroContent.style.transform = `translateY(${y * 0.3}px)`;
    heroContent.style.opacity   = `${1 - y / window.innerHeight * 1.4}`;
  }, { passive: true });
})();
