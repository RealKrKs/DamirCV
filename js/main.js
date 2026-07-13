/* ═══════════════════════════════════════════════════════════
   DAMIR KRZNAR — interactions
   Lenis smooth scroll · GSAP ScrollTrigger · mouse parallax
   ═══════════════════════════════════════════════════════════ */

document.documentElement.classList.add("js");

/* Animations are part of the design brief — run them regardless of the
   OS "reduced motion" preference so every visitor gets the same site. */
const prefersReduced = false;
const hasGsap = typeof window.gsap !== "undefined";
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

/* ── graceful degradation if CDNs are unreachable ── */
if (!hasGsap) {
  const loader = document.getElementById("loader");
  if (loader) loader.remove();
  document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("revealed"));
}

if (hasGsap) gsap.registerPlugin(ScrollTrigger);

/* ═══════════════ SMOOTH SCROLL ═══════════════ */
let lenis = null;
if (!prefersReduced && typeof window.Lenis !== "undefined" && hasGsap) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  document.documentElement.classList.add("has-lenis");
}

/* anchor links */
document.querySelectorAll("[data-scroll]").forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    if (!id || !id.startsWith("#")) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
  });
});

/* ═══════════════ CURSOR ═══════════════ */
if (!isTouch) {
  document.documentElement.classList.add("custom-cursor"); // hides the native cursor
  const dot = document.getElementById("cursor");
  const ring = document.getElementById("cursorRing");
  let mx = -100, my = -100, rx = -100, ry = -100;
  let cursorRunning = false;

  /* one style write per frame (mousemove can fire far more often than frames
     render on high-Hz mice), and the loop parks itself once the ring settles */
  const tick = () => {
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    if (Math.abs(mx - rx) < 0.1 && Math.abs(my - ry) < 0.1) { cursorRunning = false; return; }
    requestAnimationFrame(tick);
  };

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    document.documentElement.classList.add("cursor-on"); // reveal once we have a real position
    if (!cursorRunning) { cursorRunning = true; requestAnimationFrame(tick); }
  }, { passive: true });

  document.querySelectorAll("a, button, .honour-card, .stat-tile, .principle").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
  });
}

/* ═══════════════ NAV STATE + PROGRESS ═══════════════ */
const nav = document.getElementById("nav");
const progressBar = document.getElementById("progressBar");

const onScroll = () => {
  const y = window.scrollY || document.documentElement.scrollTop;
  nav.classList.toggle("is-scrolled", y > 40);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar && max > 0) progressBar.style.transform = `scaleX(${Math.min(1, y / max)})`;
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ═══════════════ MOBILE NAV ═══════════════ */
const burger = document.getElementById("navBurger");
const mnav = document.getElementById("mnav");
if (burger && mnav) {
  const setMenu = (open) => {
    document.documentElement.classList.toggle("mnav-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mnav.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener("click", () =>
    setMenu(!document.documentElement.classList.contains("mnav-open")));
  /* any nav link press closes the menu before the smooth scroll takes over */
  document.querySelectorAll("#mnav a, #nav a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
}

/* ═══════════════ PRELOADER + HERO ENTRANCE ═══════════════ */
if (hasGsap) {
  const intro = () => {
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: startHeroParallax,
    });

    tl.to(".loader-bar i", { scaleX: 1, duration: prefersReduced ? 0.01 : 0.7, ease: "power2.inOut" })
      .to(".loader-name span", { yPercent: -14, opacity: 0, stagger: 0.06, duration: 0.4, ease: "power2.in" }, "+=0.1")
      .to("#loader", {
        yPercent: -100,
        duration: prefersReduced ? 0.01 : 0.8,
        ease: "power4.inOut",
        onComplete: () => document.getElementById("loader").remove(),
      }, "-=0.15");

    if (!prefersReduced) {
      tl.from(".hl-1 img", { y: 90, opacity: 0, duration: 1.1 }, "-=0.45")
        .from(".hero-kicker", { y: 20, opacity: 0, duration: 0.6 }, "-=0.9")
        .from(".ht-line", { yPercent: 55, opacity: 0, skewY: 4, stagger: 0.12, duration: 1 }, "-=0.75")
        .from(".hl-4 img", { y: 110, opacity: 0, duration: 1.1 }, "-=0.8")
        .from(".hl-3 img", { y: 90, opacity: 0, duration: 1 }, "-=0.95")
        .from(".hl-2 img", { y: 90, opacity: 0, duration: 1 }, "-=0.9")
        .from(".hero-script", { scale: 0.4, opacity: 0, rotation: -18, duration: 0.7, ease: "back.out(2)" }, "-=0.6")
        .from(".hero-desc, .hero-meta div, .hero-mobiletag, .hero-scrollcue", { y: 26, opacity: 0, stagger: 0.08, duration: 0.7 }, "-=0.55");
    }
  };

  if (document.readyState === "complete") intro();
  else window.addEventListener("load", intro);
}

/* ═══════════════ HERO MOUSE PARALLAX ═══════════════
   Started after the intro timeline so it doesn't fight
   GSAP's entrance tweens for the same transforms. */
let parallaxStarted = false;
function startHeroParallax() {
  if (parallaxStarted || isTouch || prefersReduced) return;
  parallaxStarted = true;

  const layers = [...document.querySelectorAll("#hero [data-depth]")].map((el) => ({
    el,
    depth: parseFloat(el.dataset.depth || 0),
    base: el.classList.contains("hero-title") || el.classList.contains("hl-4")
      ? "translateX(-50%) " : "",
  }));
  let tx = 0, ty = 0, cx = 0, cy = 0;
  let heroVisible = true;
  let running = false;

  const hero = document.getElementById("hero");
  hero.addEventListener("mousemove", (e) => {
    tx = e.clientX / window.innerWidth - 0.5;
    ty = e.clientY / window.innerHeight - 0.5;
    wake();
  });
  hero.addEventListener("mouseleave", () => { tx = 0; ty = 0; wake(); });

  const raf = () => {
    // stop entirely once the cursor has settled or the hero left the viewport
    const settled = Math.abs(tx - cx) < 0.0006 && Math.abs(ty - cy) < 0.0006;
    if (!heroVisible || settled) { running = false; return; }

    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    layers.forEach(({ el, depth, base }) => {
      const x = cx * depth * 3.4;   // positive depth follows the cursor,
      const y = cy * depth * 2.2;   // negative drifts away — parallax depth
      const r = cx * depth * 0.075;
      el.style.transform = `${base}translate3d(${x}px, ${y}px, 0) rotate(${r}deg)`;
    });
    requestAnimationFrame(raf);
  };
  const wake = () => {
    if (!running && heroVisible) { running = true; requestAnimationFrame(raf); }
  };

  new IntersectionObserver((entries) => {
    heroVisible = entries[0].isIntersecting;
    if (heroVisible) wake();
  }).observe(hero);

  wake();
}
if (!hasGsap) startHeroParallax();

/* park the hero's ambient animations (beams, floating figures) while the
   section is scrolled out of view — see .hero.is-parked in the CSS */
const heroEl = document.getElementById("hero");
if (heroEl) {
  new IntersectionObserver((entries) => {
    heroEl.classList.toggle("is-parked", !entries[0].isIntersecting);
  }).observe(heroEl);
}

/* hero scroll-out parallax */
if (hasGsap && !prefersReduced) {
  gsap.to(".hero-stage", {
    yPercent: 14,
    opacity: 0.35,
    ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero-foot", {
    yPercent: 60,
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "60% top", scrub: true },
  });
}

/* ═══════════════ REVEAL ON SCROLL ═══════════════ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      revealObserver.unobserve(el);
      // siblings that reveal together cascade instead of popping at once
      const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
      const delay = sibs.length > 1 ? sibs.indexOf(el) * 85 : 0;
      setTimeout(() => el.classList.add("revealed"), delay);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);
document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));

/* ═══════════════ CAREER — PINNED TIMELINE ═══════════════ */
const careerSection = document.querySelector(".career");
const slides = gsap ? gsap.utils.toArray(".career-slide") : [...document.querySelectorAll(".career-slide")];
const railTrack = document.getElementById("railTrack");
const railFill = document.getElementById("railFill");
const RAIL_ITEM_H = 132;

/* build the rail from slide data */
slides.forEach((slide) => {
  const item = document.createElement("div");
  item.className = "rail-item";
  item.innerHTML = `
    <span class="rail-crest"><img src="${slide.dataset.logo}" alt="${slide.dataset.club} crest" loading="lazy" /></span>
    <span class="rail-year">${slide.dataset.span}</span>
  `;
  railTrack.appendChild(item);
});
const railItems = [...railTrack.children];

let activeIndex = -1;
function setActive(i) {
  if (i === activeIndex) return;
  activeIndex = i;
  const slide = slides[i];

  slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
  railItems.forEach((r, k) => r.classList.toggle("is-active", k === i));

  /* centre the active rail item on the line */
  railTrack.style.transform = `translateY(${-(i * RAIL_ITEM_H + RAIL_ITEM_H / 2)}px)`;

  /* recolour the section to the club's identity */
  careerSection.style.setProperty("--club", slide.dataset.color);
}

if (hasGsap) {
  const mm = gsap.matchMedia();

  mm.add("(min-width: 901px)", () => {
    setActive(0);

    const st = ScrollTrigger.create({
      trigger: "#careerPin",
      start: "top top",
      end: () => "+=" + slides.length * window.innerHeight * 0.72,
      pin: true,
      anticipatePin: 1,
      onUpdate(self) {
        const i = Math.min(slides.length - 1, Math.floor(self.progress * slides.length));
        setActive(i);
        if (railFill) railFill.style.height = `${self.progress * 100}%`;
      },
    });

    return () => st.kill();
  });

  mm.add("(max-width: 900px)", () => {
    /* swipe carousel — the progress line, crest box and dots mirror the scroller */
    const scroller = document.getElementById("careerSlides");
    const fill = document.getElementById("carFill");
    const crestBox = document.getElementById("carCrest");
    const crestImg = crestBox ? crestBox.querySelector("img") : null;
    const dotsBox = document.getElementById("carDots");

    slides.forEach((s) => s.classList.add("is-active"));

    const dots = slides.map((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Show ${s.dataset.club}`);
      b.addEventListener("click", () =>
        scroller.scrollTo({ left: i * scroller.clientWidth, behavior: "smooth" }));
      dotsBox.appendChild(b);
      return b;
    });

    let mobIndex = -1;
    let swapTimer = null;
    const setMobActive = (i) => {
      if (i === mobIndex || !slides[i]) return;
      const first = mobIndex === -1;
      mobIndex = i;
      dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
      careerSection.style.setProperty("--club", slides[i].dataset.color);
      if (first) { crestImg.src = slides[i].dataset.logo; return; }
      /* crest swap: shrink away, replace, spring back */
      crestBox.classList.add("swap");
      clearTimeout(swapTimer);
      swapTimer = setTimeout(() => {
        crestImg.src = slides[i].dataset.logo;
        crestBox.classList.remove("swap");
      }, 240);
    };

    const onCarScroll = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      if (fill && max > 0) fill.style.width = `${(scroller.scrollLeft / max) * 100}%`;
      setMobActive(Math.round(scroller.scrollLeft / scroller.clientWidth));
    };
    scroller.addEventListener("scroll", onCarScroll, { passive: true });
    setMobActive(0);
    onCarScroll();

    return () => {
      scroller.removeEventListener("scroll", onCarScroll);
      clearTimeout(swapTimer);
      dotsBox.innerHTML = "";
      slides.forEach((s) => s.classList.remove("is-active"));
    };
  });
} else {
  slides.forEach((s) => s.classList.add("is-active"));
}

/* ═══════════════ MAKSIMIR SCORE + GHOST CRESTS ═══════════════ */
if (hasGsap && !prefersReduced) {
  gsap.fromTo("#mkScore",
    { scale: 0.6, opacity: 0.2 },
    {
      scale: 1, opacity: 1, ease: "none",
      scrollTrigger: { trigger: ".maksimir", start: "top 85%", end: "top 20%", scrub: true },
    }
  );

  /* the two giant crests drift in opposite directions as you scroll past */
  gsap.fromTo(".mk-badge-l", { y: 120, rotation: -14 }, {
    y: -120, rotation: -6, ease: "none",
    scrollTrigger: { trigger: ".maksimir", start: "top bottom", end: "bottom top", scrub: true },
  });
  gsap.fromTo(".mk-badge-r", { y: -80, rotation: 12 }, {
    y: 140, rotation: 4, ease: "none",
    scrollTrigger: { trigger: ".maksimir", start: "top bottom", end: "bottom top", scrub: true },
  });
}

/* ═══════════════ STAT COUNTERS + BARS ═══════════════ */
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      countObserver.unobserve(el);

      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || "0", 10);

      if (hasGsap && !prefersReduced) {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => { el.textContent = obj.v.toFixed(decimals); },
        });
      } else {
        el.textContent = target.toFixed(decimals);
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll(".count").forEach((el) => countObserver.observe(el));

const barObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const row = entry.target;
      barObserver.unobserve(row);
      row.style.setProperty("--w", row.dataset.win || 0);
    });
  },
  { threshold: 0.4 }
);
document.querySelectorAll(".stat-row[data-win]").forEach((el) => barObserver.observe(el));

/* ═══════════════ FULL TIME — NEWSPAPER JUMP CUTS ═══════════════
   CapCut-style rapid cuts: one highlighted headline per frame,
   hard-swapped every ~170ms with a little camera jitter. */
(() => {
  const press = document.getElementById("footerPress");
  if (!press) return;

  const FRAMES = [
    "assets/press/press-1.webp",
    "assets/press/press-2.webp",
    "assets/press/press-3.webp",
    "assets/press/press-4.webp",
    "assets/press/press-5.webp",
  ];
  const imgs = [];
  FRAMES.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.alt = "";
    img.draggable = false;
    img.onerror = () => img.remove(); // missing frames just drop out of the cycle
    press.appendChild(img);
    imgs.push(img);
  });

  let idx = 0;
  let timer = null;

  const cut = () => {
    const pool = imgs.filter((i) => i.isConnected && i.complete && i.naturalWidth > 0);
    if (pool.length < 2) return;
    pool.forEach((i) => i.classList.remove("on"));
    idx = (idx + 1) % pool.length;
    const img = pool[idx];
    // camera jitter: every cut lands on a slightly different crop
    // (kept within the 8% bleed so an edge can never slide into view)
    const sc = 1.05 + Math.random() * 0.07;
    const rot = (Math.random() - 0.5) * 2.4;
    const x = (Math.random() - 0.5) * 2.4;
    const y = (Math.random() - 0.5) * 2.4;
    img.style.transform = `scale(${sc.toFixed(3)}) rotate(${rot.toFixed(2)}deg) translate(${x.toFixed(1)}%, ${y.toFixed(1)}%)`;
    img.classList.add("on");
  };

  const start = () => { if (!timer) { cut(); timer = setInterval(cut, 170); } };
  const stop = () => { clearInterval(timer); timer = null; };

  // only burn cycles while the footer is actually on screen
  let footerVisible = false;
  new IntersectionObserver((entries) => {
    footerVisible = entries[0].isIntersecting;
    footerVisible && !document.hidden ? start() : stop();
  }, { threshold: 0.05 }).observe(document.getElementById("contact"));
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : footerVisible && start();
  });
})();

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const skill = entry.target;
      skillObserver.unobserve(skill);
      const fill = skill.querySelector(".skill-bar i");
      const val = skill.querySelector(".skill-val");
      const level = parseFloat(skill.dataset.level);
      fill.style.width = `${level}%`;

      if (hasGsap && !prefersReduced) {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: level, duration: 1.6, ease: "power2.out",
          onUpdate: () => { val.textContent = Math.round(obj.v); },
        });
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll(".skill").forEach((el) => skillObserver.observe(el));
