// GSAP/ScrollTrigger/Lenis cargan de un CDN — si algo falla (bloqueador de
// anuncios, red inestable, caída del CDN), nada de lo de abajo debe romper
// lo esencial: el menú móvil, el mapa, el banner de cookies siguen
// funcionando igual sin GSAP.
const gsapReady = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
if (gsapReady) gsap.registerPlugin(ScrollTrigger);

const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ---------- Word splitting (accesible) ---------- */
function splitWords(el) {
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);
  const words = text.split(/\s+/);
  el.innerHTML = "";
  const wrap = document.createElement("span");
  wrap.className = "split-wrap";
  wrap.setAttribute("aria-hidden", "true");
  words.forEach((word, i) => {
    const outer = document.createElement("span");
    outer.className = "split-word";
    const inner = document.createElement("span");
    inner.textContent = word;
    outer.appendChild(inner);
    wrap.appendChild(outer);
    if (i < words.length - 1) wrap.appendChild(document.createTextNode(" "));
  });
  el.appendChild(wrap);
  return Array.from(wrap.querySelectorAll(".split-word > span"));
}
const splitTargets = document.querySelectorAll("[data-split-word]");
const splitMap = new Map();
splitTargets.forEach((el) => splitMap.set(el, splitWords(el)));

/* ---------- Menú móvil ---------- */
const navToggle = document.querySelector(".nav-toggle");
const mobileNav = document.getElementById("mobile-nav");
function closeMobileNav() {
  mobileNav.hidden = true;
  navToggle.setAttribute("aria-expanded", "false");
}
function openMobileNav() {
  mobileNav.hidden = false;
  navToggle.setAttribute("aria-expanded", "true");
}
navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  isOpen ? closeMobileNav() : openMobileNav();
});
mobileNav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") closeMobileNav();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
    closeMobileNav();
    navToggle.focus();
  }
});

/* ---------- Scroll suave a anclas ---------- */
let lenis = null;
function smoothScrollToSelector(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  const headerOffset = 68;
  if (lenis) {
    lenis.scrollTo(target, { offset: -headerOffset });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: reduceQuery.matches ? "auto" : "smooth" });
  }
}
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const id = link.getAttribute("href");
  if (id.length <= 1) return;
  if (!document.querySelector(id)) return;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    closeMobileNav();
    smoothScrollToSelector(id);
  });
});

/* ---------- Cookie notice ---------- */
function initCookieBanner() {
  const banner = document.querySelector(".cookie-banner");
  const ackBtn = document.querySelector(".cookie-ack");
  if (!banner || !ackBtn) return;
  const KEY = "jayce-cookie-ack";
  let acknowledged = false;
  try {
    acknowledged = localStorage.getItem(KEY) === "1";
  } catch (e) {}
  if (!acknowledged) {
    banner.hidden = false;
    document.body.classList.add("has-cookie-banner");
  }
  ackBtn.addEventListener("click", () => {
    banner.hidden = true;
    document.body.classList.remove("has-cookie-banner");
    try {
      localStorage.setItem(KEY, "1");
    } catch (e) {}
  });
}
initCookieBanner();

/* ---------- Mapa: el iframe (y sus cookies) de Google solo carga al clic ---------- */
function initMapConsent() {
  document.querySelectorAll(".map-consent").forEach((btn) => {
    btn.addEventListener(
      "click",
      () => {
        const iframe = document.createElement("iframe");
        iframe.title = btn.dataset.mapTitle || "Mapa";
        iframe.src = btn.dataset.mapSrc;
        iframe.loading = "lazy";
        iframe.referrerPolicy = "no-referrer-when-downgrade";
        btn.replaceWith(iframe);
      },
      { once: true }
    );
  });
}
initMapConsent();

/* ---------- Botón flotante de llamada: visible al salir del hero ---------- */
function initCallFab() {
  const fab = document.querySelector(".call-fab");
  const hero = document.querySelector(".hero");
  if (!fab || !hero) return;
  if (!gsapReady) {
    const observer = new IntersectionObserver(([entry]) => {
      fab.classList.toggle("is-visible", !entry.isIntersecting);
    });
    observer.observe(hero);
    return;
  }
  ScrollTrigger.create({
    trigger: hero,
    start: "bottom top",
    onEnter: () => fab.classList.add("is-visible"),
    onLeaveBack: () => fab.classList.remove("is-visible"),
  });
}

/* ---------- Taza de la cabecera: se llena con el progreso de scroll ----------
   Sustituye a la barra de progreso habitual: un SVG de taza con un
   clip-path cuyo rect sube de altura según cuánto se ha bajado en la
   página. Coherente con la vibe "café de barrio" sin repetir el patrón de
   rail-nav con puntos que usan otros templates de la carpeta. */
function initCupGauge() {
  const fillRect = document.querySelector("[data-cup-fill]");
  if (!fillRect) return;
  const CUP_TOP = 14;
  const CUP_BOTTOM = 40;
  const CUP_HEIGHT = CUP_BOTTOM - CUP_TOP;

  function update() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const y = CUP_BOTTOM - CUP_HEIGHT * progress;
    fillRect.setAttribute("y", y.toFixed(2));
    fillRect.setAttribute("height", (CUP_HEIGHT * progress).toFixed(2));
  }

  update();
  if (gsapReady) {
    ScrollTrigger.create({ trigger: document.documentElement, start: "top top", end: "bottom bottom", onUpdate: update });
  } else {
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }
}
initCupGauge();

/* ---------- Cabecera: fondo sólido tras bajar un poco ---------- */
function initHeaderChrome() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  if (!gsapReady) {
    window.addEventListener(
      "scroll",
      () => header.classList.toggle("is-scrolled", window.scrollY > 80),
      { passive: true }
    );
    return;
  }
  ScrollTrigger.create({
    trigger: document.body,
    start: "top -80",
    onEnter: () => header.classList.add("is-scrolled"),
    onLeaveBack: () => header.classList.remove("is-scrolled"),
  });
}

/* ---------- Hero: vapor de café ---------- */
let steamScene = null;
function initSteamScene() {
  const canvas = document.querySelector("[data-steam-scene]");
  if (!canvas || typeof window.createSteamScene !== "function") return;
  steamScene = window.createSteamScene(canvas);
}

/* ---------- Revelados sección por sección ---------- */
function runSectionReveals() {
  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    const heading = group.querySelector("h2");
    const headingWords = heading ? splitMap.get(heading) : null;
    const blocksAll = group.querySelectorAll(
      ".lugar-lede, .lugar-quote, .sabores-lede, .sabores-note, .resenas-cta, .info-list li, .map-card"
    );
    const cardsAll = group.querySelectorAll(".momento, .sabor-card, .resena-card");
    // Cada grupo solo contiene un subconjunto de estos selectores — un
    // NodeList vacío hace que GSAP avise "target not found" en consola,
    // así que solo se anima cuando el grupo realmente tiene coincidencias.
    const blocks = blocksAll.length ? blocksAll : null;
    const cards = cardsAll.length ? cardsAll : null;

    if (headingWords) gsap.set(headingWords, { yPercent: 110, opacity: 0 });
    if (blocks) gsap.set(blocks, { y: 16, opacity: 0 });
    if (cards) gsap.set(cards, { y: 28, opacity: 0, scale: 0.97 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: group, start: "top 78%", toggleActions: "play none none none" },
    });
    if (headingWords) tl.to(headingWords, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "power4.out" });
    if (blocks) tl.to(blocks, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: "power2.out" }, headingWords ? "-=0.35" : 0);
    if (cards) {
      tl.to(
        cards,
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: Math.min(0.08, 0.5 / cards.length), ease: "power3.out" },
        headingWords || blocks ? "-=0.35" : 0
      );
    }
  });
}

/* ---------- "Sello" de anillo de café al entrar cada momento ---------- */
function runRingStamps() {
  document.querySelectorAll(".momento-ring, .lugar-ring-stamp").forEach((ring) => {
    gsap.set(ring, { scale: 0.6, opacity: 0 });
    gsap.to(ring, {
      scale: 1,
      opacity: 1,
      duration: 0.9,
      ease: "back.out(1.6)",
      scrollTrigger: { trigger: ring, start: "top 85%", toggleActions: "play none none none" },
    });
  });
}

/* ---------- Botones magnéticos (solo puntero fino) ---------- */
function initMagneticButtons() {
  document.querySelectorAll(".btn").forEach((el) => {
    const moveX = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const moveY = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      moveX((e.clientX - rect.left - rect.width / 2) * 0.25);
      moveY((e.clientY - rect.top - rect.height / 2) * 0.4);
    });
    el.addEventListener("mouseleave", () => {
      moveX(0);
      moveY(0);
    });
  });
}

/* ---------- Arranque ---------- */
initCallFab();
initHeaderChrome();

if (!gsapReady) {
  document.body.classList.add("motion-reduced");
} else {
  const mm = gsap.matchMedia();
  mm.add(
    { isMotion: "(prefers-reduced-motion: no-preference)", isFinePointer: "(pointer: fine)" },
    (context) => {
      const { isMotion, isFinePointer } = context.conditions;

      if (isMotion) {
        lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

        runHeroIntro();
        runSectionReveals();
        runRingStamps();
        initSteamScene();
        if (isFinePointer) initMagneticButtons();

        window.addEventListener("pagehide", () => {
          lenis && lenis.destroy();
          ScrollTrigger.getAll().forEach((t) => t.kill());
          if (steamScene) steamScene.destroy();
        });
      } else {
        document.body.classList.add("motion-reduced");
      }

      return () => {
        if (lenis) {
          lenis.destroy();
          lenis = null;
        }
      };
    }
  );
}

function runHeroIntro() {
  const tl = gsap.timeline({ delay: 0.15 });
  tl.from(".site-header", { y: -24, opacity: 0, duration: 0.7, ease: "power3.out" });
  tl.from(".hero-eyebrow .split-word > span", { yPercent: 110, opacity: 0, duration: 0.6, stagger: 0.03, ease: "power4.out" }, "-=0.3");
  tl.from(".hero-title-word", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.3");
  tl.from(".hero-claim .split-word > span", { yPercent: 110, opacity: 0, duration: 0.6, stagger: 0.02, ease: "power4.out" }, "-=0.5");
  tl.from(".hero-rating", { y: 14, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.35");
  tl.from(".hero-actions", { y: 14, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.3");
  tl.from(".hero-note", { y: 10, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.3");
  tl.from(".scroll-cue", { opacity: 0, duration: 0.5 }, "-=0.2");
}

if (gsapReady) {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
