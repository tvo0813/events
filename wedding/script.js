/* ════════════════════════════════════════════
   HERO CANVAS — white sparkle field
   ════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, t  = 0, sparkles = [], bursts = [];
  const mouse  = { x: -999, y: -999, vx: 0, vy: 0, px: -999, py: -999 };
  const COLORS = ['#ec407a','#f59e0b','#a78bfa','#38bdf8','#f472b6','#fb923c','#34d399'];

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkSparkle() {
    return {
      x: rnd(0, W), y: rnd(0, H),
      vx: rnd(-0.15, 0.15), vy: rnd(-0.25, -0.06),
      size:  rnd(3.5, 8),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: rnd(0.45, 0.9),
      phase: rnd(0, Math.PI * 2),
      phaseSpeed: rnd(0.01, 0.03),
      rot: rnd(0, Math.PI * 2),
      rotSpeed: rnd(-0.025, 0.025),
      kind: Math.floor(Math.random() * 3), // 0 star, 1 diamond, 2 dot
    };
  }

  function initSparkles() {
    sparkles = Array.from({ length: 200 }, mkSparkle);
  }

  function spawnBurst(x, y, vx, vy, n) {
    for (let i = 0; i < n; i++) {
      const angle = rnd(0, Math.PI * 2);
      const speed = rnd(1, 4.5);
      bursts.push({
        x, y,
        vx: Math.cos(angle) * speed + vx * 0.15,
        vy: Math.sin(angle) * speed + vy * 0.15,
        size:  rnd(3.5, 8),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 1,
        decay: rnd(0.018, 0.032),
        rot:   rnd(0, Math.PI * 2),
        rotSpeed: rnd(-0.12, 0.12),
        kind:  Math.floor(Math.random() * 3),
      });
    }
  }

  function star(ctx, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + rot;
      const d = i % 2 === 0 ? r : r * 0.38;
      i === 0 ? ctx.moveTo(Math.cos(a)*d, Math.sin(a)*d)
              : ctx.lineTo(Math.cos(a)*d, Math.sin(a)*d);
    }
    ctx.closePath();
    ctx.fill();
  }

  function diamond(ctx, r, rot) {
    ctx.save(); ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -r); ctx.lineTo(r*0.55, 0);
    ctx.lineTo(0, r);  ctx.lineTo(-r*0.55, 0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawParticle(p) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.translate(p.x, p.y);
    // soft glow
    ctx.globalAlpha = Math.max(0, p.alpha * 0.22);
    ctx.beginPath();
    ctx.arc(0, 0, p.size * 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = Math.max(0, p.alpha);
    if      (p.kind === 0) star(ctx, p.size, p.rot);
    else if (p.kind === 1) diamond(ctx, p.size * 0.9, p.rot);
    else { ctx.beginPath(); ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  function draw() {
    t += 0.014;
    ctx.clearRect(0, 0, W, H);

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Soft blush-gold centre bloom
    const bloom = ctx.createRadialGradient(W*0.5, H*0.46, 0, W*0.5, H*0.46, W*0.6);
    bloom.addColorStop(0,   'rgba(252,228,236,0.60)');
    bloom.addColorStop(0.45,'rgba(253,230,138,0.22)');
    bloom.addColorStop(0.75,'rgba(232,240,255,0.15)');
    bloom.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, W, H);

    // Ambient sparkles
    sparkles.forEach(s => {
      s.phase += s.phaseSpeed;
      s.rot   += s.rotSpeed;
      s.x     += s.vx + Math.sin(s.phase) * 0.22;
      s.y     += s.vy;
      if (s.y < -20)    { s.y = H + 20; s.x = rnd(0, W); }
      if (s.x < -20)    s.x = W + 20;
      if (s.x > W + 20) s.x = -20;

      // drift toward cursor
      const dx = mouse.x - s.x, dy = mouse.y - s.y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < 180 && d > 0.5) {
        s.x += (dx/d) * 1.6 * (1 - d/180);
        s.y += (dy/d) * 1.6 * (1 - d/180);
      }

      s.alpha = (s.alpha > 0 ? s.alpha : Math.abs(s.alpha));
      const pa = s.alpha * (0.5 + 0.5 * Math.sin(s.phase));
      const orig = s.alpha;
      s.alpha = pa;
      drawParticle(s);
      s.alpha = orig;
    });

    // Burst trail particles
    bursts = bursts.filter(b => b.alpha > 0);
    bursts.forEach(b => {
      b.x  += b.vx; b.y  += b.vy;
      b.vy += 0.055; b.vx *= 0.97;
      b.alpha -= b.decay;
      b.rot   += b.rotSpeed;
      drawParticle(b);
    });

    // Cursor glow + ring
    if (mouse.x > 0 && mouse.x < W) {
      const rr = 30 + Math.sin(t * 3) * 5;
      const cg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, rr * 3);
      cg.addColorStop(0,   'rgba(236,64,122,0.18)');
      cg.addColorStop(0.5, 'rgba(245,158,11,0.08)');
      cg.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, rr*3, 0, Math.PI*2); ctx.fill();

      ctx.strokeStyle = 'rgba(236,64,122,0.5)';
      ctx.lineWidth   = 1.5;
      ctx.globalAlpha = 0.45 + 0.35 * Math.sin(t * 3);
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, rr, 0, Math.PI*2); ctx.stroke();

      ctx.globalAlpha = 0.22 + 0.15 * Math.sin(t * 3 + 1);
      ctx.strokeStyle = 'rgba(167,139,250,0.5)';
      ctx.lineWidth   = 1;
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, rr * 1.8, 0, Math.PI*2); ctx.stroke();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  let lastBurst = 0;
  window.addEventListener('mousemove', e => {
    mouse.vx = e.clientX - mouse.px; mouse.vy = e.clientY - mouse.py;
    mouse.px = mouse.x;  mouse.py = mouse.y;
    mouse.x  = e.clientX; mouse.y = e.clientY;
    const now   = performance.now();
    const speed = Math.sqrt(mouse.vx*mouse.vx + mouse.vy*mouse.vy);
    if (now - lastBurst > 40 && speed > 4) {
      spawnBurst(mouse.x, mouse.y, mouse.vx, mouse.vy, Math.floor(rnd(3,6)));
      lastBurst = now;
    }
  });

  window.addEventListener('click', e => spawnBurst(e.clientX, e.clientY, 0, 0, 24));

  resize();
  initSparkles();
  draw();
  window.addEventListener('resize', () => { resize(); initSparkles(); });
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
        '<p style="font-family:var(--ff-serif);font-size:1.5rem;color:var(--pink)">Today is the day! ✦</p>';
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
   STORY SCENE RENDERER — illustrated landscapes
   ════════════════════════════════════════════ */
(function () {

  /* ── shared drawing helpers ── */

  function sky(ctx, W, H, stops) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    stops.forEach(([pos, col]) => g.addColorStop(pos, col));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  function stars(ctx, W, H, t, n) {
    for (let i = 0; i < n; i++) {
      const sx = ((i * 137.5) % 1) * W;
      const sy = ((i * 97.3)  % 0.55) * H;
      const tw = 0.35 + 0.65 * Math.sin(t * 1.8 + i * 0.7);
      const r  = 0.7 + (i % 3) * 0.5;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,245,210,${tw * 0.85})`; ctx.fill();
    }
  }

  function moon(ctx, x, y, r, t) {
    // outer glow
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 3.2);
    g.addColorStop(0, 'rgba(255,245,200,0.28)'); g.addColorStop(1, 'rgba(255,245,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, Math.PI * 2); ctx.fill();
    // disc
    ctx.fillStyle = '#fffde0'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    // crescent mask
    ctx.fillStyle = 'rgba(200,185,140,0.25)';
    ctx.beginPath(); ctx.arc(x + r * 0.35, y - r * 0.08, r * 0.84, 0, Math.PI * 2); ctx.fill();
  }

  function cloud(ctx, x, y, s, a) {
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = '#fff';
    [[0,0,1],[-.8,.3,.7],[.8,.3,.7],[-.4,.55,.65],[.4,.55,.65]].forEach(([bx,by,br]) => {
      ctx.beginPath(); ctx.arc(x + bx*s*28, y + by*s*22, br*s*22, 0, Math.PI*2); ctx.fill();
    });
    ctx.restore();
  }

  function hill(ctx, W, H, yBase, color, amp, freq, phase) {
    ctx.beginPath(); ctx.moveTo(0, H);
    ctx.lineTo(0, yBase);
    for (let x = 0; x <= W; x += 4) {
      const y = yBase + Math.sin((x / W) * Math.PI * freq + phase) * amp;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
  }

  function tree(ctx, x, y, h, leafCol, sway) {
    // trunk
    ctx.strokeStyle = '#6b4226'; ctx.lineWidth = h * 0.07; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sway * 0.4, y - h * 0.42); ctx.stroke();
    // branches
    ctx.lineWidth = h * 0.04;
    ctx.beginPath(); ctx.moveTo(x + sway*0.3, y - h*0.32); ctx.lineTo(x + sway*0.3 + h*0.18, y - h*0.52); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + sway*0.3, y - h*0.32); ctx.lineTo(x + sway*0.3 - h*0.16, y - h*0.50); ctx.stroke();
    // canopy layers
    for (let i = 0; i < 4; i++) {
      const lw = h * (0.50 - i * 0.09);
      const ly = y - h * 0.38 - i * h * 0.17;
      const g  = ctx.createRadialGradient(x + sway*0.4, ly, 0, x + sway*0.4, ly, lw);
      g.addColorStop(0, leafCol); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.ellipse(x + sway*0.4, ly, lw, lw * 0.72, 0, 0, Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
    }
  }

  function petal(ctx, W, H, t, n, color) {
    for (let i = 0; i < n; i++) {
      const px  = (((i * 173.1 + t * 22) % W) + W) % W;
      const py  = (((i * 97.3  + t * 30) % (H * 1.1)));
      const rot = t + i * 1.1;
      const wobble = Math.sin(t * 1.3 + i) * 12;
      ctx.save();
      ctx.translate(px + wobble, py); ctx.rotate(rot);
      ctx.globalAlpha = 0.55 + 0.3 * Math.sin(t + i);
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.ellipse(0, 0, 6, 3.5, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  /* ════════════════════════════════
     SCENE 0 — Cherry Blossom Garden
     Soft pastel daytime, petals
     ════════════════════════════════ */
  function scene0(ctx, W, H, t) {
    sky(ctx, W, H, [
      [0, '#fce4ec'], [0.4, '#fff0f5'], [0.7, '#fff8e1'], [1, '#e8f5e9']
    ]);

    // Fluffy clouds
    cloud(ctx, W*0.2  + Math.sin(t*0.04)*14, H*0.16, 1.2, 0.75);
    cloud(ctx, W*0.65 + Math.sin(t*0.03+1)*10, H*0.10, 0.9, 0.60);
    cloud(ctx, W*0.85 + Math.sin(t*0.05+2)*8,  H*0.22, 0.7, 0.50);

    // Sun
    const sunG = ctx.createRadialGradient(W*0.82, H*0.14, 8, W*0.82, H*0.14, 80);
    sunG.addColorStop(0, 'rgba(255,230,100,0.95)'); sunG.addColorStop(0.5,'rgba(255,200,80,0.4)'); sunG.addColorStop(1,'rgba(255,200,80,0)');
    ctx.fillStyle = sunG; ctx.beginPath(); ctx.arc(W*0.82, H*0.14, 80, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fffde0'; ctx.beginPath(); ctx.arc(W*0.82, H*0.14, 30, 0, Math.PI*2); ctx.fill();

    // Background hills
    hill(ctx, W, H, H*0.62, '#c8e6c9', H*0.05, 2.2, 0);
    hill(ctx, W, H, H*0.68, '#a5d6a7', H*0.04, 3.1, 1.2);

    // Ground
    const gg = ctx.createLinearGradient(0, H*0.72, 0, H);
    gg.addColorStop(0, '#81c784'); gg.addColorStop(1, '#4caf50');
    ctx.fillStyle = gg; ctx.fillRect(0, H*0.72, W, H*0.28);

    // Grassy bumps
    for (let i = 0; i < 5; i++) {
      const gx = W * (0.08 + i * 0.2);
      const gr = W * 0.12;
      const gg2 = ctx.createRadialGradient(gx, H*0.73, 0, gx, H*0.73, gr);
      gg2.addColorStop(0, 'rgba(129,199,132,0.6)'); gg2.addColorStop(1,'rgba(129,199,132,0)');
      ctx.fillStyle = gg2; ctx.beginPath(); ctx.ellipse(gx, H*0.73, gr, gr*0.4, 0, 0, Math.PI*2); ctx.fill();
    }

    // Stone path
    const pg = ctx.createLinearGradient(W*0.4, H*0.72, W*0.6, H);
    pg.addColorStop(0,'#e0d5c8'); pg.addColorStop(1,'#c8baa8');
    ctx.fillStyle = pg; ctx.beginPath();
    ctx.moveTo(W*0.41,H*0.72); ctx.bezierCurveTo(W*0.39,H*0.82,W*0.38,H*0.92,W*0.36,H);
    ctx.lineTo(W*0.64,H); ctx.bezierCurveTo(W*0.62,H*0.92,W*0.61,H*0.82,W*0.59,H*0.72);
    ctx.closePath(); ctx.fill();
    // Path stones
    for (let i = 0; i < 5; i++) {
      const sy = H*0.76 + i*H*0.055;
      const sw = W*0.07 - i*2;
      ctx.fillStyle = 'rgba(200,180,160,0.45)';
      ctx.beginPath(); ctx.ellipse(W*0.5, sy, sw, sw*0.35, 0, 0, Math.PI*2); ctx.fill();
    }

    // Cherry blossom trees
    const sw = Math.sin(t * 0.55) * 4;
    tree(ctx, W*0.12, H*0.73, H*0.40, 'rgba(252,176,196,0.80)', sw);
    tree(ctx, W*0.88, H*0.72, H*0.44, 'rgba(248,160,190,0.80)', -sw);
    tree(ctx, W*0.04, H*0.76, H*0.28, 'rgba(255,192,210,0.65)', sw*0.6);
    tree(ctx, W*0.96, H*0.75, H*0.30, 'rgba(252,182,200,0.65)', -sw*0.6);

    // Small decorative flowers on ground
    for (let i = 0; i < 18; i++) {
      const fx = W * (0.05 + ((i * 137.5) % 0.9));
      const fy = H * (0.74 + ((i * 73.1) % 0.24));
      const fc = i%3===0?'#f48fb1':i%3===1?'#fff9c4':'#b2ebf2';
      ctx.fillStyle = fc; ctx.beginPath(); ctx.arc(fx, fy, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(fx, fy, 1.5, 0, Math.PI*2); ctx.fill();
    }

    // Falling petals
    petal(ctx, W, H, t, 35, 'rgba(248,168,196,0.9)');
    petal(ctx, W, H, t*0.75+1, 20, 'rgba(255,255,255,0.75)');

    // Foreground grass blades
    ctx.strokeStyle = '#66bb6a'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 22; i++) {
      const gx = W*(0.03 + i*0.047);
      const gw = 6 + (i%3)*3;
      const gs = Math.sin(t*0.8+i)*gw*0.3;
      ctx.beginPath(); ctx.moveTo(gx, H); ctx.quadraticCurveTo(gx+gs, H-gw, gx+gs*1.4, H-gw*2); ctx.stroke();
    }
  }

  /* ════════════════════════════════
     SCENE 1 — Hội An Lantern River
     Night, glowing lanterns, reflections
     ════════════════════════════════ */
  function scene1(ctx, W, H, t) {
    sky(ctx, W, H, [
      [0, '#0d0b2a'], [0.45, '#1a1550'], [0.7, '#2d1b69'], [1, '#0a1628']
    ]);

    stars(ctx, W, H, t, 90);
    moon(ctx, W*0.75, H*0.12, H*0.06, t);

    // Distant city silhouette — Vietnamese rooflines
    ctx.fillStyle = '#0d1a35';
    const roofX = [0,.05,.11,.18,.25,.31,.38,.44,.50,.57,.63,.70,.76,.82,.88,.94];
    roofX.forEach((rx, i) => {
      const bw = W * 0.075;
      const bh = H * (0.22 + (i%3)*0.06);
      const bx = W*rx;
      const by = H*0.55 - bh;
      ctx.fillRect(bx, by, bw*0.9, bh);
      // Curved Vietnamese roof tip
      ctx.beginPath();
      ctx.moveTo(bx - bw*0.08, by);
      ctx.bezierCurveTo(bx + bw*0.2, by - bh*0.12, bx + bw*0.7, by - bh*0.12, bx + bw*0.98, by);
      ctx.lineTo(bx + bw*0.9, by); ctx.lineTo(bx, by); ctx.closePath();
      ctx.fillStyle = '#0d1a35'; ctx.fill();
    });

    // River
    const riverG = ctx.createLinearGradient(0, H*0.55, 0, H);
    riverG.addColorStop(0, '#0f1e45'); riverG.addColorStop(0.5,'#0a1530'); riverG.addColorStop(1,'#060e20');
    ctx.fillStyle = riverG; ctx.fillRect(0, H*0.55, W, H*0.45);

    // River shimmer lines
    for (let i = 0; i < 10; i++) {
      const sy = H*0.58 + i*H*0.035;
      const sa = 0.07 + 0.05*Math.sin(t*1.2+i);
      const sw2 = W*(0.1 + 0.4*(i%3)*0.1);
      const sx = ((i*W*0.13 + t*18) % W);
      ctx.fillStyle = `rgba(255,255,255,${sa})`;
      ctx.beginPath(); ctx.ellipse(sx, sy, sw2, 1.5, 0, 0, Math.PI*2); ctx.fill();
    }

    // Lanterns + reflections
    const lanternData = [
      [0.12, 0.38, '#ff5252', 22], [0.25, 0.30, '#ff9800', 18], [0.40, 0.42, '#ffeb3b', 20],
      [0.52, 0.34, '#e91e63', 24], [0.63, 0.28, '#ff7043', 19], [0.75, 0.40, '#ffd740', 21],
      [0.85, 0.33, '#f06292', 17], [0.33, 0.45, '#ff8f00', 16], [0.70, 0.36, '#ef5350', 23],
      [0.18, 0.43, '#ffca28', 18], [0.57, 0.26, '#ff4081', 20], [0.90, 0.44, '#ffb300', 16],
    ];

    lanternData.forEach(([lx, ly, col, r], idx) => {
      const lxp = W*lx + Math.sin(t*0.6+idx)*6;
      const lyp = H*ly + Math.sin(t*0.8+idx*0.5)*4;

      // Glow behind lantern
      const lg = ctx.createRadialGradient(lxp, lyp, 0, lxp, lyp, r*3.5);
      lg.addColorStop(0, col.replace(')', ',0.35)').replace('#','rgba(0,0,0,0.0)')); // fallback
      // simpler:
      ctx.save(); ctx.globalAlpha = 0.22 + 0.08*Math.sin(t*1.4+idx);
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(lxp, lyp, r*3.2, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      // Lantern body
      ctx.save();
      ctx.globalAlpha = 0.92 + 0.08*Math.sin(t*1.4+idx);
      const lanG = ctx.createRadialGradient(lxp - r*0.25, lyp - r*0.3, r*0.1, lxp, lyp, r);
      lanG.addColorStop(0, lightenHex(col, 55)); lanG.addColorStop(0.6, col); lanG.addColorStop(1, darkenHex(col, 30));
      ctx.fillStyle = lanG;
      ctx.beginPath(); ctx.ellipse(lxp, lyp, r*0.65, r, 0, 0, Math.PI*2); ctx.fill();
      // Lantern ribs
      ctx.strokeStyle = darkenHex(col, 40); ctx.lineWidth = 0.8; ctx.globalAlpha = 0.5;
      for (let rib = -2; rib <= 2; rib++) {
        ctx.beginPath(); ctx.moveTo(lxp - r*0.65, lyp + rib*r*0.38);
        ctx.bezierCurveTo(lxp, lyp + rib*r*0.38 - r*0.04, lxp, lyp + rib*r*0.38 - r*0.04, lxp + r*0.65, lyp + rib*r*0.38);
        ctx.stroke();
      }
      // Top/bottom caps
      ctx.globalAlpha = 1;
      ctx.fillStyle = darkenHex(col, 20);
      ctx.beginPath(); ctx.ellipse(lxp, lyp - r, r*0.65, r*0.15, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(lxp, lyp + r, r*0.65, r*0.15, 0, 0, Math.PI*2); ctx.fill();
      // String up
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(lxp, lyp - r); ctx.lineTo(lxp, lyp - r - 18); ctx.stroke();
      ctx.restore();

      // Reflection in water
      const ry = H*0.55 + (H*0.55 - lyp) * 0.55;
      ctx.save(); ctx.globalAlpha = 0.18 + 0.06*Math.sin(t*1.2+idx);
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(lxp + Math.sin(t*0.5+idx)*4, ry, r*0.55, r*0.38, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    });

    // Lantern strings connecting rooftops
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.8;
    for (let i = 0; i < lanternData.length - 1; i++) {
      const [ax,ay] = lanternData[i]; const [bx,by] = lanternData[i+1];
      ctx.beginPath(); ctx.moveTo(W*ax, H*ay - 18); ctx.lineTo(W*bx, H*by - 18); ctx.stroke();
    }

    // Floating water lotus flowers
    for (let i = 0; i < 8; i++) {
      const fx = W*(0.08 + i*0.12) + Math.sin(t*0.4+i)*10;
      const fy = H*0.62 + (i%3)*H*0.04;
      ctx.fillStyle = `rgba(255,182,193,${0.55+0.2*Math.sin(t+i)})`;
      for (let p = 0; p < 5; p++) {
        const pa = (p/5)*Math.PI*2;
        ctx.beginPath(); ctx.ellipse(fx+Math.cos(pa)*7, fy+Math.sin(pa)*4, 5, 3, pa, 0, Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = '#fff9c4'; ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI*2); ctx.fill();
    }

    // Wooden boat silhouette
    const bx2 = W*0.15 + Math.sin(t*0.2)*8;
    ctx.fillStyle = '#1a0f08';
    ctx.beginPath();
    ctx.moveTo(bx2 - 50, H*0.75);
    ctx.bezierCurveTo(bx2 - 55, H*0.78, bx2 + 55, H*0.78, bx2 + 50, H*0.75);
    ctx.closePath(); ctx.fill();
    // Oar
    ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx2+30, H*0.75); ctx.lineTo(bx2+52, H*0.82); ctx.stroke();
  }

  /* ════════════════════════════════
     SCENE 2 — Constellation Love
     Deep night sky, two star signs
     connected by a glowing line
     ════════════════════════════════ */
  function scene2(ctx, W, H, t) {
    sky(ctx, W, H, [
      [0,'#010108'],[0.4,'#05051a'],[0.75,'#0a0824'],[1,'#060415']
    ]);

    stars(ctx, W, H, t, 160);
    moon(ctx, W*0.85, H*0.08, H*0.055, t);

    // Milky way band
    for (let i = 0; i < 180; i++) {
      const mx = W*0.05 + ((i*173.5)%1)*W*0.9;
      const my = H*0.08 + Math.sin(i*0.18)*H*0.22 + ((i*97.3)%1)*H*0.12;
      ctx.fillStyle = `rgba(200,210,255,${0.03+0.03*(i%5)*0.2})`;
      ctx.beginPath(); ctx.arc(mx, my, (i%3)*0.6+0.3, 0, Math.PI*2); ctx.fill();
    }

    // Aurora streaks
    for (let i = 0; i < 5; i++) {
      const ay = H*(0.05 + i*0.06);
      const ax = W*0.1 + Math.sin(t*0.15+i)*W*0.08;
      const aw = W*0.6;
      const ag = ctx.createLinearGradient(ax, ay, ax+aw, ay+H*0.04);
      const aColors = ['rgba(0,200,180,0.08)','rgba(100,80,220,0.06)','rgba(200,50,180,0.06)','rgba(0,180,220,0.07)','rgba(80,200,150,0.05)'];
      ag.addColorStop(0,'rgba(0,0,0,0)'); ag.addColorStop(0.5, aColors[i]); ag.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = ag;
      ctx.beginPath(); ctx.ellipse(ax+aw*0.5, ay+H*0.02, aw*0.5, H*0.035, Math.sin(t*0.08+i)*0.2, 0, Math.PI*2); ctx.fill();
    }

    // Constellation T (Tin)
    const tinStars = [
      [0.22,0.28],[0.30,0.22],[0.38,0.28],[0.30,0.38],[0.30,0.50],[0.30,0.60],
    ];
    const tinLines = [[0,1],[1,2],[1,3],[3,4],[4,5]];
    drawConstellation(ctx, W, H, t, tinStars, tinLines, '#f9a8d4', 'T i n');

    // Constellation Y (Yen)
    const yenStars = [
      [0.62,0.22],[0.70,0.32],[0.78,0.22],[0.70,0.42],[0.70,0.55],[0.70,0.65],
    ];
    const yenLines = [[0,1],[2,1],[1,3],[3,4],[4,5]];
    drawConstellation(ctx, W, H, t, yenStars, yenLines, '#a5b4fc', 'Y e n');

    // Magical connecting beam between the two clusters
    const t1x = W*tinStars[1][0], t1y = H*tinStars[1][1];
    const y1x = W*yenStars[1][0], y1y = H*yenStars[1][1];
    const pulse = 0.4 + 0.35*Math.sin(t*1.5);
    const beamG = ctx.createLinearGradient(t1x, t1y, y1x, y1y);
    beamG.addColorStop(0, 'rgba(249,168,212,0)');
    beamG.addColorStop(0.3, `rgba(249,168,212,${pulse})`);
    beamG.addColorStop(0.5, `rgba(255,255,255,${pulse})`);
    beamG.addColorStop(0.7, `rgba(165,180,252,${pulse})`);
    beamG.addColorStop(1, 'rgba(165,180,252,0)');
    ctx.strokeStyle = beamG; ctx.lineWidth = 1.5;
    ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(t1x, t1y); ctx.lineTo(y1x, y1y); ctx.stroke();
    ctx.setLineDash([]);

    // Heart at midpoint of beam
    const mx2 = (t1x+y1x)*0.5, my2 = (t1y+y1y)*0.5 - 12*Math.sin(t*1.2);
    ctx.save(); ctx.globalAlpha = 0.7+0.3*Math.sin(t*1.5);
    ctx.font = `${Math.round(H*0.06)}px serif`; ctx.textAlign='center';
    ctx.fillStyle='#f9a8d4'; ctx.fillText('♥', mx2, my2);
    ctx.restore();

    // Ground silhouette — rolling hills
    hill(ctx, W, H, H*0.82, '#0a0f1e', H*0.04, 1.8, 0.5);
    hill(ctx, W, H, H*0.88, '#060c18', H*0.02, 2.5, 1.5);

    // Fireflies
    for (let i = 0; i < 18; i++) {
      const fx = W*(0.05 + ((i*173.5)%1)*0.9);
      const fy = H*(0.70 + ((i*97.3)%1)*0.28) + Math.sin(t*1.1+i)*8;
      const fa = 0.4 + 0.6*Math.abs(Math.sin(t*2.5+i*0.7));
      ctx.save(); ctx.globalAlpha = fa;
      const fg = ctx.createRadialGradient(fx,fy,0,fx,fy,6);
      fg.addColorStop(0,'rgba(200,255,150,0.9)'); fg.addColorStop(1,'rgba(200,255,150,0)');
      ctx.fillStyle=fg; ctx.beginPath(); ctx.arc(fx,fy,6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(220,255,180,0.95)'; ctx.beginPath(); ctx.arc(fx,fy,1.5,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  function drawConstellation(ctx, W, H, t, pts, lines, color, label) {
    // Lines
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35 + 0.15*Math.sin(t*0.8);
    lines.forEach(([a,b]) => {
      ctx.beginPath();
      ctx.moveTo(W*pts[a][0], H*pts[a][1]);
      ctx.lineTo(W*pts[b][0], H*pts[b][1]);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    // Stars
    pts.forEach(([px,py], i) => {
      const sr = 3.5 + (i===1?2:0);
      const sa = 0.7 + 0.3*Math.sin(t*1.5+i);
      // Glow
      const sg = ctx.createRadialGradient(W*px,H*py,0,W*px,H*py,sr*4);
      sg.addColorStop(0,color.replace(')',',0.4)').replace('rgb','rgba')); sg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(W*px,H*py,sr*4,0,Math.PI*2); ctx.fill();
      // Core
      ctx.fillStyle = color; ctx.globalAlpha = sa;
      ctx.beginPath(); ctx.arc(W*px,H*py,sr,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.globalAlpha=sa*0.6;
      ctx.beginPath(); ctx.arc(W*px,H*py,sr*0.4,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
    });
    // Label near top star
    ctx.save();
    ctx.font = `300 ${Math.round(H*0.03)}px 'Montserrat',sans-serif`;
    ctx.fillStyle = color; ctx.globalAlpha = 0.7;
    ctx.textAlign = 'center';
    ctx.fillText(label, W*pts[0][0], H*pts[0][1] - 18);
    ctx.restore();
  }

  /* ════════════════════════════════
     SCENE 3 — Wedding Arch & Fireworks
     Golden floral arch, night sky, fireworks
     ════════════════════════════════ */
  function scene3(ctx, W, H, t) {
    sky(ctx, W, H, [
      [0,'#0d0520'],[0.35,'#1a0a3a'],[0.65,'#2d0d50'],[0.85,'#4a0a30'],[1,'#6b1a20']
    ]);

    stars(ctx, W, H, t, 100);
    moon(ctx, W*0.82, H*0.10, H*0.048, t);

    // Fireworks
    const fwData = [
      { tx:0.25, ty:0.22, born:0.0,  color:'#ffb300', color2:'#ff6b6b' },
      { tx:0.72, ty:0.18, born:1.8,  color:'#f9a8d4', color2:'#a5b4fc' },
      { tx:0.50, ty:0.12, born:3.5,  color:'#86efac', color2:'#fde68a' },
      { tx:0.18, ty:0.30, born:5.1,  color:'#67e8f9', color2:'#f0abfc' },
      { tx:0.82, ty:0.26, born:6.8,  color:'#fcd34d', color2:'#fb7185' },
    ];
    fwData.forEach(fw => {
      const age = ((t - fw.born) % 7.5);
      if (age < 0 || age > 3.5) return;
      const progress = age / 3.5;
      const burst = Math.min(progress * 2, 1);
      const fade  = age > 1.8 ? 1 - (age - 1.8) / 1.7 : 1;
      const maxR  = H * 0.12 * burst;
      const nRays = 16;
      for (let i = 0; i < nRays; i++) {
        const angle = (i / nRays) * Math.PI * 2;
        const r1 = maxR * 0.3, r2 = maxR;
        const sx = W*fw.tx + Math.cos(angle)*r1;
        const sy = H*fw.ty + Math.sin(angle)*r1 + age*age*4;
        const ex = W*fw.tx + Math.cos(angle)*r2;
        const ey = H*fw.ty + Math.sin(angle)*r2 + age*age*6;
        const col = i%2===0 ? fw.color : fw.color2;
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.globalAlpha = fade * 0.85;
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke();
        // Tip sparkle
        if (progress < 0.9) {
          ctx.fillStyle = '#fff'; ctx.globalAlpha = fade * 0.9;
          ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, Math.PI*2); ctx.fill();
        }
      }
      // Centre flash
      ctx.globalAlpha = Math.max(0, (0.4-age)*2.5);
      const cg = ctx.createRadialGradient(W*fw.tx,H*fw.ty+age*age*4,0,W*fw.tx,H*fw.ty+age*age*4,H*0.04);
      cg.addColorStop(0,'rgba(255,255,255,0.9)'); cg.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(W*fw.tx,H*fw.ty+age*age*4,H*0.04,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
    });

    // Ground
    const gg = ctx.createLinearGradient(0,H*0.72,0,H);
    gg.addColorStop(0,'#1a0d2e'); gg.addColorStop(1,'#0d0818');
    ctx.fillStyle=gg; ctx.fillRect(0,H*0.72,W,H*0.28);

    // Aisle — glowing carpet
    const cg2 = ctx.createLinearGradient(W*0.45,H*0.72,W*0.55,H);
    cg2.addColorStop(0,'rgba(255,215,100,0.18)'); cg2.addColorStop(1,'rgba(255,215,100,0.04)');
    ctx.fillStyle=cg2;
    ctx.beginPath();
    ctx.moveTo(W*0.46,H*0.72); ctx.lineTo(W*0.38,H); ctx.lineTo(W*0.62,H); ctx.lineTo(W*0.54,H*0.72);
    ctx.closePath(); ctx.fill();

    // Candles lining aisle
    for (let i = 0; i < 7; i++) {
      [W*0.39-i*8, W*0.61+i*8].forEach(cx => {
        const cy = H*0.75 + i*H*0.034;
        ctx.fillStyle='#c8a060'; ctx.fillRect(cx-2,cy,4,H*0.025);
        const fa = 0.7+0.3*Math.sin(t*3.5+i*cx);
        const fg = ctx.createRadialGradient(cx,cy,0,cx,cy,12);
        fg.addColorStop(0,`rgba(255,200,80,${fa})`); fg.addColorStop(1,'rgba(255,150,0,0)');
        ctx.fillStyle=fg; ctx.beginPath(); ctx.arc(cx,cy,12,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#fff8c0'; ctx.beginPath(); ctx.ellipse(cx,cy,2.5,4,0,0,Math.PI*2); ctx.fill();
      });
    }

    // Arch frame
    const ax=W*0.5, atY=H*0.22, aW=W*0.26, aH=H*0.50;
    // Arch glow
    const archG = ctx.createRadialGradient(ax,atY+aH*0.3,0,ax,atY+aH*0.3,aW*1.4);
    archG.addColorStop(0,'rgba(255,220,100,0.14)'); archG.addColorStop(1,'rgba(255,220,100,0)');
    ctx.fillStyle=archG; ctx.fillRect(ax-aW,atY-20,aW*2,aH+40);

    ctx.strokeStyle='#c9a96e'; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(ax-aW*0.5, atY+aH);
    ctx.lineTo(ax-aW*0.5, atY+aH*0.36);
    ctx.arc(ax, atY+aH*0.36, aW*0.5, Math.PI, 0);
    ctx.lineTo(ax+aW*0.5, atY+aH);
    ctx.stroke();

    // Inner arch glow line
    ctx.strokeStyle='rgba(255,240,150,0.25)'; ctx.lineWidth=12;
    ctx.beginPath();
    ctx.moveTo(ax-aW*0.5+6, atY+aH);
    ctx.lineTo(ax-aW*0.5+6, atY+aH*0.36);
    ctx.arc(ax, atY+aH*0.36, aW*0.5-6, Math.PI, 0);
    ctx.lineTo(ax+aW*0.5-6, atY+aH);
    ctx.stroke();

    // Floral clusters on arch — roses, leaves
    const archFlowers = [];
    for (let i = 0; i <= 14; i++) {
      const angle = Math.PI + (i/14)*Math.PI;
      archFlowers.push([ax + Math.cos(angle)*(aW*0.5), atY+aH*0.36 + Math.sin(angle)*(aW*0.5)]);
    }
    // Side verticals
    for (let i = 0; i < 6; i++) {
      archFlowers.push([ax - aW*0.5, atY+aH*0.4 + i*aH*0.09]);
      archFlowers.push([ax + aW*0.5, atY+aH*0.4 + i*aH*0.09]);
    }
    archFlowers.forEach(([fx2,fy2], idx) => {
      const col = idx%4===0?'#ff8a80':idx%4===1?'#fff9c4':idx%4===2?'#ce93d8':'#a5d6a7';
      drawFlower(ctx, fx2, fy2, 8+Math.sin(t*1.2+idx)*1.5, col, t+idx);
    });

    // Hanging wisteria / garlands
    for (let g2 = 0; g2 < 3; g2++) {
      const gsx = ax - aW*0.45 + g2*aW*0.45;
      const gsy = atY + aH*0.36 - aW*0.5 * Math.sin(Math.PI * g2/2);
      for (let d = 0; d < 9; d++) {
        const gy = gsy + d*10 + Math.sin(t*0.5+d)*2;
        const gx2 = gsx + Math.sin(d*0.7)*4;
        ctx.fillStyle = d%2===0?'rgba(206,147,216,0.7)':'rgba(179,157,219,0.6)';
        ctx.globalAlpha = 0.7+0.2*Math.sin(t+d);
        ctx.beginPath(); ctx.arc(gx2, gy, 4, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.globalAlpha=1;

    // Inner arch draping flowers (top arc)
    for (let i = 0; i <= 8; i++) {
      const angle = Math.PI*1.05 + (i/8)*Math.PI*0.9;
      const fx2 = ax + Math.cos(angle)*(aW*0.38);
      const fy2 = atY+aH*0.36 + Math.sin(angle)*(aW*0.38);
      ctx.fillStyle = `rgba(255,182,193,${0.6+0.35*Math.sin(t*1.5+i)})`;
      ctx.font = `${Math.round(H*0.025)}px serif`; ctx.textAlign='center';
      ctx.fillText('✿', fx2, fy2);
    }

    // Gold ✦ sparkles floating around arch
    for (let i = 0; i < 12; i++) {
      const sx = ax + Math.cos(t*0.5+i*0.52)*aW*(0.6+0.3*Math.sin(i));
      const sy = atY + aH*0.3 + Math.sin(t*0.7+i*0.8)*aH*0.35;
      const sa = 0.4+0.5*Math.abs(Math.sin(t*1.8+i));
      ctx.save(); ctx.globalAlpha=sa; ctx.fillStyle='#fde68a';
      ctx.font=`${Math.round(H*0.018)}px serif`; ctx.textAlign='center';
      ctx.fillText('✦',sx,sy); ctx.restore();
    }

    // Foreground flowers
    for (let i = 0; i < 24; i++) {
      const ffx = W*(0.02 + ((i*137.5)%1)*0.96);
      const ffy = H*(0.73 + ((i*73.1)%1)*0.25);
      const ffc = i%4===0?'#f48fb1':i%4===1?'#ce93d8':i%4===2?'#80cbc4':'#fff176';
      drawFlower(ctx, ffx, ffy, 6+Math.sin(t+i)*1, ffc, t+i*0.5);
    }
  }

  function drawFlower(ctx, x, y, r, color, t2) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(t2 * 0.3);
    for (let p = 0; p < 5; p++) {
      const pa = (p/5)*Math.PI*2;
      ctx.fillStyle = color; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.ellipse(Math.cos(pa)*r*0.7, Math.sin(pa)*r*0.7, r*0.55, r*0.38, pa, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle='#fff9c4'; ctx.globalAlpha=1;
    ctx.beginPath(); ctx.arc(0,0,r*0.32,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  /* ── colour helpers ── */
  function lightenHex(hex, amt) {
    const n=parseInt(hex.replace('#',''),16);
    const r=Math.min(255,(n>>16)+amt), g=Math.min(255,((n>>8)&0xff)+amt), b=Math.min(255,(n&0xff)+amt);
    return `rgb(${r},${g},${b})`;
  }
  function darkenHex(hex, amt) { return lightenHex(hex,-amt); }

  /* ── Wire up canvases ── */
  const SCENES = [
    { id:'anime-0', fn: scene0 },
    { id:'anime-1', fn: scene1 },
    { id:'anime-2', fn: scene2 },
    { id:'anime-3', fn: scene3 },
  ];

  const sticky = document.querySelector('.scrolly-sticky');

  function sizeCanvas(canvas) {
    const w = sticky ? sticky.offsetWidth  : canvas.parentElement.offsetWidth;
    const h = sticky ? sticky.offsetHeight : canvas.parentElement.offsetHeight;
    if (w > 0 && h > 0) { canvas.width = w; canvas.height = h; }
  }

  SCENES.forEach(({ id, fn }) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx   = canvas.getContext('2d');
    const state = { t: 0 };
    sizeCanvas(canvas);
    window.addEventListener('resize', () => sizeCanvas(canvas), { passive: true });
    function loop() {
      state.t += 0.016;
      if (canvas.width === 0 || canvas.height === 0) sizeCanvas(canvas);
      if (canvas.width > 0 && canvas.height > 0) fn(ctx, canvas.width, canvas.height, state.t);
      requestAnimationFrame(loop);
    }
    loop();
  });
})();


/* ════════════════════════════════════════════
   SCROLLYTELLING — scroll-position based
   ════════════════════════════════════════════ */
(function () {
  const steps  = Array.from(document.querySelectorAll('.scrolly-step'));
  const frames = document.querySelectorAll('.scrolly-frame');
  if (!steps.length) return;

  let current = -1;

  function activate(idx) {
    if (idx === current) return;
    current = idx;
    frames.forEach(f => f.classList.remove('active'));
    const f = document.querySelector(`.scrolly-frame[data-frame="${idx}"]`);
    if (f) f.classList.add('active');
  }

  function onScroll() {
    const mid = window.innerHeight * 0.5;
    let best = 0;
    let bestDist = Infinity;
    steps.forEach((step, i) => {
      const r = step.getBoundingClientRect();
      const stepMid = r.top + r.height * 0.5;
      const dist = Math.abs(stepMid - mid);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    activate(best);
  }

  // Also activate on load
  activate(0);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  // Run once after layout settles
  setTimeout(onScroll, 100);
})();

/* ════════════════════════════════════════════
   REVEAL ON SCROLL
   CSS pattern: .do-reveal gates opacity:0 on children;
   JS adds .do-reveal to parent on load, then .revealed
   to each child as it enters the viewport.
   ════════════════════════════════════════════ */
(function () {
  // Gate the animation: add do-reveal to the details section so
  // [data-reveal] children start hidden (opacity:0 via CSS selector).
  document.querySelectorAll('.details-section, .stay-section').forEach(s => s.classList.add('do-reveal'));

  const items = Array.from(document.querySelectorAll('[data-reveal]'));

  function check() {
    const vh = window.innerHeight;
    items.forEach(el => {
      if (el.classList.contains('revealed')) return;
      const top = el.getBoundingClientRect().top;
      if (top < vh * 0.88) el.classList.add('revealed');
    });
  }

  requestAnimationFrame(check);
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check, { passive: true });
  window.addEventListener('load', check);
})();

/* ════════════════════════════════════════════
   RSVP CANVAS
   ════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('rsvp-canvas');
  const ctx    = canvas.getContext('2d');
  const COLS   = ['#ec407a','#f59e0b','#38bdf8','#a78bfa','#34d399','#fb923c','#f472b6'];
  let W, H, shapes = [];

  function resize() {
    const section = canvas.closest('.rsvp-section');
    W = canvas.width  = section ? section.offsetWidth  : window.innerWidth;
    H = canvas.height = section ? section.offsetHeight : window.innerHeight;
  }

  function mkShape() {
    return {
      x: Math.random()*W, y: Math.random()*H,
      size: 5+Math.random()*28,
      alpha: 0.10+Math.random()*0.20,
      vx: (Math.random()-0.5)*0.4, vy: -0.3-Math.random()*0.6,
      rot: Math.random()*Math.PI*2, rotSpeed: (Math.random()-0.5)*0.018,
      type: Math.random()>0.5?'petal':'diamond',
      color: COLS[Math.floor(Math.random()*COLS.length)],
    };
  }

  function drawPetal(s) {
    ctx.beginPath();
    ctx.moveTo(0,-s); ctx.bezierCurveTo(s*0.6,-s*0.6,s*0.6,s*0.6,0,s);
    ctx.bezierCurveTo(-s*0.6,s*0.6,-s*0.6,-s*0.6,0,-s); ctx.fill();
  }
  function drawDiamond(s) {
    ctx.beginPath();
    ctx.moveTo(0,-s); ctx.lineTo(s*0.5,0); ctx.lineTo(0,s); ctx.lineTo(-s*0.5,0);
    ctx.closePath(); ctx.fill();
  }

  function animate() {
    ctx.clearRect(0,0,W,H);
    shapes.forEach(s => {
      s.x+=s.vx; s.y+=s.vy; s.rot+=s.rotSpeed;
      if(s.y<-50){ s.y=H+50; s.x=Math.random()*W; }
      ctx.save(); ctx.translate(s.x,s.y); ctx.rotate(s.rot);
      ctx.fillStyle=s.color; ctx.globalAlpha=s.alpha;
      s.type==='petal'?drawPetal(s.size):drawDiamond(s.size);
      ctx.restore();
    });
    ctx.globalAlpha=1;
    requestAnimationFrame(animate);
  }

  resize();
  shapes = Array.from({length:60},mkShape);
  animate();
  window.addEventListener('resize', resize, { passive:true });
})();

/* ════════════════════════════════════════════
   RSVP FORM
   ════════════════════════════════════════════ */
(function () {
  const form    = document.getElementById('rsvp-form');
  const success = document.getElementById('rsvp-success');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.transition = 'opacity 0.4s, transform 0.4s';
    form.style.opacity    = '0';
    form.style.transform  = 'translateY(20px)';
    setTimeout(() => { form.style.display='none'; success.classList.add('show'); }, 420);
  });
})();

/* ════════════════════════════════════════════
   SMOOTH ANCHORS
   ════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
});
