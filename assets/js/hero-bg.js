(() => {
  const canvas = document.getElementById("heroCanvas");
  const hero = document.getElementById("home");
  if (!canvas || !hero) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const colors = {
    node: ["rgba(92, 111, 244, 0.55)", "rgba(168, 85, 247, 0.5)", "rgba(232, 112, 194, 0.45)"],
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let nodes = [];
  let sparks = [];
  let rafId = 0;
  let mouse = { x: 0.5, y: 0.5, active: false };

  const nodeCount = () => (width < 640 ? 32 : width < 1024 ? 48 : 64);
  const linkDistance = () => (width < 640 ? 110 : 150);

  const rand = (min, max) => min + Math.random() * (max - min);

  const buildNodes = () => {
    const count = nodeCount();
    nodes = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: rand(-0.28, 0.28),
      vy: rand(-0.28, 0.28),
      r: rand(1.2, 2.6),
      color: colors.node[Math.floor(Math.random() * colors.node.length)],
      pulse: rand(0, Math.PI * 2),
      pulseSpeed: rand(0.015, 0.035),
      sparkEvery: 120 + Math.floor(Math.random() * 180),
      sparkCounter: index * 17,
    }));
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildNodes();
    sparks = [];
  };

  const lineRgb = [
    [92, 111, 244],
    [168, 85, 247],
    [232, 112, 194],
  ];

  const spawnSpark = (node) => {
    if (sparks.length > 24) return;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(0.4, 1.2);
    sparks.push({
      x: node.x,
      y: node.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: rand(0.012, 0.022),
      color: node.color,
    });
  };

  const drawSparks = () => {
    sparks.forEach((spark) => {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.life -= spark.decay;

      ctx.beginPath();
      ctx.arc(spark.x, spark.y, 1.2 * spark.life, 0, Math.PI * 2);
      ctx.fillStyle = spark.color.replace(/[\d.]+\)$/, `${0.35 * spark.life})`);
      ctx.fill();
    });
    sparks = sparks.filter((spark) => spark.life > 0.05);
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const maxDist = linkDistance();

    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];

      if (!prefersReducedMotion) {
        a.x += a.vx;
        a.y += a.vy;
        a.pulse += a.pulseSpeed;

        if (mouse.active) {
          const dx = mouse.x * width - a.x;
          const dy = mouse.y * height - a.y;
          a.x += dx * 0.0008;
          a.y += dy * 0.0008;
        }

        a.sparkCounter += 1;
        if (a.sparkCounter >= a.sparkEvery) {
          a.sparkCounter = 0;
          if (Math.random() > 0.55) spawnSpark(a);
        }

        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;
      }

      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDist) {
          const alpha = 1 - dist / maxDist;
          const [r, g, bCol] = lineRgb[(i + j) % lineRgb.length];
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${bCol}, ${0.08 + alpha * 0.28})`;
          ctx.lineWidth = 0.6 + alpha * 0.8;
          ctx.stroke();
        }
      }
    }

    nodes.forEach((node) => {
      const glow = 0.5 + 0.5 * Math.sin(node.pulse);

      if (!prefersReducedMotion) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + glow * 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = node.color.replace(/[\d.]+\)$/, `${0.08 + glow * 0.12})`);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
    });

    if (!prefersReducedMotion) {
      drawSparks();
    }
  };

  const loop = () => {
    draw();
    if (!prefersReducedMotion) {
      rafId = window.requestAnimationFrame(loop);
    }
  };

  hero.addEventListener(
    "mousemove",
    (event) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = (event.clientX - rect.left) / rect.width;
      mouse.y = (event.clientY - rect.top) / rect.height;
      mouse.active = true;
    },
    { passive: true }
  );

  hero.addEventListener(
    "mouseleave",
    () => {
      mouse.active = false;
    },
    { passive: true }
  );

  window.addEventListener("resize", resize);
  resize();
  loop();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(rafId);
    } else if (!prefersReducedMotion) {
      loop();
    }
  });
})();
