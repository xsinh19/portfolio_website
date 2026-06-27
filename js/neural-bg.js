/* Animated neural-network background.
   Nodes drift, lines connect nearby nodes; cursor exerts gentle pull. */
(function () {
  const canvas = document.getElementById('neural-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  const PURPLE = [127, 119, 221];
  const TEAL   = [93, 202, 165];

  let W, H, DPR, nodes = [], mouse = { x: -9999, y: -9999, active: false };
  const LINK_DIST = 140;
  const NODE_DENSITY = 0.00009; // nodes per px²

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth = window.innerWidth;
    H = canvas.clientHeight = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seed();
  }

  function seed() {
    const n = Math.max(60, Math.floor(W * H * NODE_DENSITY));
    nodes = new Array(n).fill(0).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
      hue: Math.random() < 0.78 ? PURPLE : TEAL
    }));
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    // update + draw nodes
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      // wrap edges
      if (n.x < -10) n.x = W + 10;
      if (n.x > W + 10) n.x = -10;
      if (n.y < -10) n.y = H + 10;
      if (n.y > H + 10) n.y = -10;

      // soft attraction to mouse
      if (mouse.active) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < 22000) {
          const f = 0.0006;
          n.vx += dx * f * 0.05;
          n.vy += dy * f * 0.05;
          // damp so they don't spiral
          n.vx *= 0.985;
          n.vy *= 0.985;
        }
      }

      // draw node
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      const [r, g, b] = n.hue;
      ctx.fillStyle = `rgba(${r},${g},${b},0.55)`;
      ctx.fill();
    }

    // draw links
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.35;
          // colour by node category
          const same = a.hue === b.hue;
          const [r, g, bl] = same ? a.hue : PURPLE;
          ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // mouse-to-node beams
    if (mouse.active) {
      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 180) {
          const alpha = (1 - d / 180) * 0.6;
          ctx.strokeStyle = `rgba(127,119,221,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
  });
  window.addEventListener('mouseout', () => { mouse.active = false; });
  window.addEventListener('touchmove', (e) => {
    if (!e.touches.length) return;
    const t = e.touches[0];
    mouse.x = t.clientX; mouse.y = t.clientY; mouse.active = true;
  }, { passive: true });
  window.addEventListener('touchend', () => { mouse.active = false; });

  resize();
  requestAnimationFrame(step);
})();
