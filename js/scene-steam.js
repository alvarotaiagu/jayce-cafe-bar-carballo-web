/* Hero: vapor de café ascendiendo sobre el degradado granate del fondo.
   Nada de ctx.filter/shadowBlur por fotograma (cuesta un disparate en un
   canvas a sangre completa) — el "puff" difuminado se dibuja UNA sola vez
   en un sprite fuera de pantalla y luego cada partícula es solo un
   drawImage con alpha, así el coste por fotograma es constante. */
(function () {
  function buildPuffSprite() {
    const size = 160;
    const off = document.createElement("canvas");
    off.width = size;
    off.height = size;
    const octx = off.getContext("2d");
    const g = octx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(247, 239, 228, 0.55)");
    g.addColorStop(0.5, "rgba(247, 239, 228, 0.22)");
    g.addColorStop(1, "rgba(247, 239, 228, 0)");
    octx.fillStyle = g;
    octx.beginPath();
    octx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    octx.fill();
    return off;
  }

  function createSteamScene(canvas) {
    if (!canvas || !canvas.getContext) return null;
    const ctx = canvas.getContext("2d");
    const puff = buildPuffSprite();

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let raf = null;
    let running = false;
    let visible = true;

    const COUNT_DESKTOP = 26;
    const COUNT_MOBILE = 14;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      const count = width < 720 ? COUNT_MOBILE : COUNT_DESKTOP;
      particles = new Array(count).fill(0).map(() => makeParticle(true));
    }

    function makeParticle(initial) {
      const originX = width * (0.15 + Math.random() * 0.7);
      return {
        x: originX,
        baseX: originX,
        y: initial ? height * Math.random() : height + Math.random() * 40,
        drift: (Math.random() - 0.5) * 26,
        speed: 14 + Math.random() * 16,
        size: 34 + Math.random() * 46,
        phase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.4 + Math.random() * 0.5,
        alpha: 0.18 + Math.random() * 0.24,
      };
    }

    let last = 0;
    function tick(t) {
      if (!running) return;
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;

      ctx.clearRect(0, 0, width, height);

      if (visible) {
        particles.forEach((p) => {
          p.y -= p.speed * dt;
          p.phase += p.wobbleSpeed * dt;
          p.x = p.baseX + Math.sin(p.phase) * p.drift;

          const lifeFade = Math.max(0, Math.min(1, (height - p.y) / height));
          const topFade = Math.max(0, Math.min(1, p.y / (height * 0.25)));
          const a = p.alpha * lifeFade * topFade;

          if (a > 0.01) {
            const s = p.size;
            ctx.globalAlpha = a;
            ctx.drawImage(puff, p.x - s / 2, p.y - s / 2, s, s);
          }

          if (p.y < -60) Object.assign(p, makeParticle(false));
        });
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (visible) start();
    });

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    });

    resize();

    return {
      destroy() {
        stop();
        io.disconnect();
      },
    };
  }

  window.createSteamScene = createSteamScene;
})();
