/* =========================================================================
   ABE LAM REALTY — shared behaviour
   Native scroll + GSAP ScrollTrigger (no Lenis, by design).
   ========================================================================= */

/* -------------------------------------------------------------------------
   CONFIG  —  swap these three values to go live. That's the whole wiring.
   ------------------------------------------------------------------------- */
const ABELAM = {
  /* 1) BOOK A CALL — paste the Calendly / Cal.com scheduling link.
        Leave as-is and the button falls back to phone/email.            */
  bookingUrl: "https://calendly.com/REPLACE-ME/intro-call",

  /* 2) CONTACT FORM — create a free form at https://formspree.io,
        paste its endpoint here (looks like https://formspree.io/f/abcdwxyz). */
  contactEndpoint: "https://formspree.io/f/REPLACE_CONTACT_ID",

  /* 3) EBOOK CAPTURE — Formspree endpoint that collects investor emails.
        ebookFile = path/URL of the PDF delivered after signup.            */
  ebookEndpoint: "https://formspree.io/f/REPLACE_EBOOK_ID",
  ebookFile: "assets/abe-lam-passive-wealth-guide.pdf",

  phone: "450-238-0470",
  email: "invest@abelam.com",
};

/* expose booking + phone to any markup that wants them */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-book]").forEach((a) => {
    const live = ABELAM.bookingUrl && !ABELAM.bookingUrl.includes("REPLACE");
    a.setAttribute("href", live ? ABELAM.bookingUrl : "tel:" + ABELAM.phone);
    if (live) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); }
  });
  document.querySelectorAll("[data-tel]").forEach((a) => a.setAttribute("href", "tel:" + ABELAM.phone));
  document.querySelectorAll("[data-mail]").forEach((a) => a.setAttribute("href", "mailto:" + ABELAM.email));
});

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* -------------------------------------------------------- luxury intro overlay
   0->100 counter + "ABE LAM" wordmark draws, then the curtain lifts to the hero.
   Plays once per session; skipped on reduced motion; fails open (never traps). */
(function intro() {
  const el = document.getElementById("intro");
  if (!el) return;
  const done = () => {
    try { el.remove(); } catch (e) {}
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  };
  if (REDUCED || typeof gsap === "undefined") { done(); return; }
  try {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    const inner = el.querySelector(".intro-inner");
    const mark = el.querySelector(".intro-mark text");
    const line = el.querySelector(".intro-line span");
    const count = el.querySelector(".intro-count");
    const L = 2600;
    gsap.set(mark, { attr: { "stroke-dasharray": L, "stroke-dashoffset": L } });
    const c = { v: 0 };
    const safety = setTimeout(done, 4500);
    const tl = gsap.timeline({ onComplete: () => { clearTimeout(safety); done(); } });
    tl.to(mark, { attr: { "stroke-dashoffset": 0 }, duration: 0.95, ease: "power2.inOut" }, 0)
      .to(line, { scaleX: 1, duration: 0.95, ease: "power1.inOut" }, 0)
      .to(c, { v: 100, duration: 0.95, ease: "power1.inOut", onUpdate: () => { count.textContent = String(Math.round(c.v)).padStart(2, "0"); } }, 0)
      .to(mark, { fill: "oklch(98% 0 0)", duration: 0.4, ease: "power2.out" }, 0.95)
      .to(inner, { scale: 1.35, opacity: 0, duration: 0.7, ease: "power3.in" }, 1.25)
      .to(el, { yPercent: -100, duration: 0.7, ease: "power4.inOut" }, 1.3);
  } catch (e) { done(); }
})();

/* -------------------------------------------------------- smooth scroll
   Apple-buttery wheel scroll via Lenis, integrated with GSAP so the pinned
   scrubs glide. Native-scroll fallback if Lenis is missing or reduced motion. */
(function smooth() {
  if (REDUCED || typeof Lenis === "undefined") return;
  try {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  } catch (e) { /* native scroll keeps working */ }
})();

/* -------------------------------------------------------- nav: blur + mobile */
(function nav() {
  const nav = document.querySelector(".nav");
  if (nav) {
    const heroCine = document.querySelector(".hero-cine");
    const onScroll = () => nav.classList.toggle("on", window.scrollY > (heroCine ? window.innerHeight - 90 : 36));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }
  const burger = document.querySelector(".burger");
  const links = document.querySelector(".nav-links");
  if (burger && links) {
    const setDrawer = (open) => {
      const mobile = window.innerWidth <= 760;
      links.classList.toggle("open", open);
      burger.classList.toggle("x", open);
      document.body.style.overflow = open ? "hidden" : "";
      // drive display directly so nothing in the cascade/compositor can block it (mobile only)
      if (mobile) links.style.display = open ? "flex" : "none";
      else links.style.display = "";
    };
    burger.addEventListener("click", () => setDrawer(!links.classList.contains("open")));
    links.querySelectorAll("a").forEach((a) => {
      const hubToggle = a.parentElement.classList.contains("has-menu"); // the "Knowledge Hub" link
      a.addEventListener("click", (e) => {
        if (hubToggle && window.innerWidth <= 760) { e.preventDefault(); a.parentElement.classList.toggle("expanded"); return; }
        setDrawer(false);
      });
    });
  }
})();

/* -------------------------------------------------------- scroll reveals */
(function reveals() {
  const items = document.querySelectorAll(".ri");
  if (!items.length) return;
  if (REDUCED) { items.forEach((el) => el.classList.add("up")); return; }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("up"); io.unobserve(e.target); } }),
    { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
  );
  items.forEach((el) => io.observe(el));
})();

/* -------------------------------------------------------- clip media reveal */
(function clips() {
  const items = document.querySelectorAll(".clip");
  if (!items.length) return;
  if (REDUCED) { items.forEach((el) => el.classList.add("open")); return; }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("open"); io.unobserve(e.target); } }),
    { threshold: 0.2 }
  );
  items.forEach((el) => io.observe(el));
})();

/* -------------------------------------------------------- reveal failsafe
   IntersectionObservers can miss elements on fast mobile scrolls. This guarantees
   any .ri / .clip that is in or above the viewport gets revealed (never stuck hidden). */
(function revealFailsafe() {
  if (REDUCED) return;
  const check = () => {
    const vh = window.innerHeight;
    /* reveal anything at or above the current scroll position (top within/above viewport) */
    document.querySelectorAll(".ri:not(.up)").forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.94) el.classList.add("up");
    });
    document.querySelectorAll(".clip:not(.open)").forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.94) el.classList.add("open");
    });
  };
  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { check(); ticking = false; }); } }, { passive: true });
  addEventListener("load", () => setTimeout(check, 500));
  setTimeout(check, 1400);
})();

/* -------------------------------------------------------- hero word reveal */
(function words() {
  const ws = document.querySelectorAll(".hero .w");
  if (!ws.length) return;
  if (REDUCED) { ws.forEach((w) => w.classList.add("up")); return; }
  ws.forEach((w, i) => setTimeout(() => w.classList.add("up"), 260 + i * 70));
})();

/* -------------------------------------------------------- count-up numbers */
(function countUp() {
  const els = document.querySelectorAll("[data-count]");
  if (!els.length) return;
  const run = (el) => {
    if (REDUCED) { el.textContent = (+el.dataset.count).toLocaleString(); return; }
    const target = +el.dataset.count, t0 = performance.now(), dur = 1600;
    (function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.floor(e * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step); else el.textContent = target.toLocaleString();
    })(t0);
  };
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }),
    { threshold: 0.5 }
  );
  els.forEach((el) => io.observe(el));
})();

/* -------------------------------------------------------- magnetic buttons */
(function magnetic() {
  if (!FINE || REDUCED) return;
  document.querySelectorAll(".mag").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transition = "transform .08s ease";
      btn.style.transform = `translate(${dx * 0.28}px, ${dy * 0.28}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transition = "transform .65s cubic-bezier(0.34,1.56,0.64,1)";
      btn.style.transform = "translate(0,0)";
    });
  });
})();

/* -------------------------------------------------------- subtle 3D tilt */
(function tilt() {
  if (!FINE || REDUCED) return;
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const shine = card.querySelector(".shine");
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transition = "none";
      card.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      if (shine) shine.style.background = `radial-gradient(circle at ${(x + .5) * 100}% ${(y + .5) * 100}%, oklch(100% 0 0 / .12), transparent 56%)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transition = "transform .65s cubic-bezier(0.23,1,0.32,1)";
      card.style.transform = "perspective(1000px) rotateY(0) rotateX(0) translateY(0)";
      if (shine) shine.style.background = "transparent";
    });
  });
})();

/* -------------------------------------------------------- cursor glow */
(function cursorGlow() {
  if (!FINE || REDUCED) return;
  document.querySelectorAll(".glow-host").forEach((host) => {
    const glow = document.createElement("div");
    Object.assign(glow.style, {
      position: "absolute", width: "520px", height: "520px", borderRadius: "50%",
      pointerEvents: "none", zIndex: "0", transform: "translate(-50%,-50%)",
      opacity: "0", transition: "opacity .4s ease",
      background: "radial-gradient(circle, oklch(53% 0.12 58 / .14), transparent 66%)",
    });
    host.appendChild(glow);
    host.addEventListener("mousemove", (e) => {
      const r = host.getBoundingClientRect();
      glow.style.left = e.clientX - r.left + "px";
      glow.style.top = e.clientY - r.top + "px";
      glow.style.opacity = "1";
    });
    host.addEventListener("mouseleave", () => (glow.style.opacity = "0"));
  });
})();

/* -------------------------------------------------------- GSAP parallax
   Loaded only if GSAP is present; ScrollTrigger drives it (native scroll). */
(function parallax() {
  if (REDUCED || typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  try {
    gsap.utils.toArray("[data-parallax]").forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 14;
      gsap.fromTo(el, { yPercent: -amt }, {
        yPercent: amt, ease: "none",
        scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
    window.addEventListener("load", () => ScrollTrigger.refresh());
  } catch (err) { /* fail safe: static layout, nothing breaks */ }
})();

/* -------------------------------------------------------- forms (AJAX) */
(function forms() {
  document.querySelectorAll("form[data-form]").forEach((form) => {
    const kind = form.dataset.form; // "contact" | "ebook"
    const status = form.querySelector(".form-status");
    const btn = form.querySelector("button[type=submit]");
    const endpoint = kind === "ebook" ? ABELAM.ebookEndpoint : ABELAM.contactEndpoint;
    const configured = endpoint && !endpoint.includes("REPLACE");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (status) { status.className = "form-status"; status.textContent = ""; }

      if (!configured) {
        if (status) {
          status.classList.add("ok");
          status.textContent = kind === "ebook"
            ? "Thanks. Connect a Formspree endpoint in main.js to deliver the guide automatically."
            : "Thanks. Connect a Formspree endpoint in main.js to start receiving these messages.";
        }
        form.reset();
        return;
      }

      const original = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          if (status) { status.classList.add("ok"); status.textContent = kind === "ebook" ? "Check your inbox — your guide is on the way." : "Message received. Abraham's team will be in touch shortly."; }
          form.reset();
          if (kind === "ebook" && ABELAM.ebookFile) window.open(ABELAM.ebookFile, "_blank");
        } else {
          throw new Error("bad response");
        }
      } catch (err) {
        if (status) { status.classList.add("err"); status.textContent = "Something went wrong. Please call " + ABELAM.phone + "."; }
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = original; }
      }
    });
  });
})();

/* -------------------------------------------------------- accordion */
(function accordion() {
  document.querySelectorAll(".acc").forEach((acc) => {
    const items = [...acc.querySelectorAll(".acc-item")];
    items.forEach((item) => {
      const head = item.querySelector(".acc-head");
      if (!head) return;
      head.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        items.forEach((i) => {
          i.classList.remove("open");
          const h = i.querySelector(".acc-head");
          if (h) h.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) { item.classList.add("open"); head.setAttribute("aria-expanded", "true"); }
      });
    });
  });
})();

/* -------------------------------------------------------- custom cursor */
(function cursor() {
  if (!FINE || REDUCED) return;
  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  document.body.appendChild(dot);
  document.body.classList.add("has-cursor");
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function raf() {
    x += (tx - x) * 0.22; y += (ty - y) * 0.22;
    dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(raf);
  })();
  const grow = () => dot.classList.add("big");
  const shrink = () => dot.classList.remove("big");
  document.querySelectorAll("a, button, .acc-head, [data-tilt], input, textarea, select, .mag").forEach((el) => {
    el.addEventListener("mouseenter", grow);
    el.addEventListener("mouseleave", shrink);
  });
})();

/* -------------------------------------------------------- horizontal property strip */
(function pstrip() {
  if (REDUCED || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  const sec = document.querySelector("#pstrip");
  if (!sec) return;
  const track = sec.querySelector(".pstrip-track");
  gsap.registerPlugin(ScrollTrigger);
  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);
  gsap.fromTo(track, { x: 0 }, {
    x: () => -dist() * 0.62, ease: "none",
    scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true },
  });
})();

/* -------------------------------------------------------- logo wordmark draws */
(function logodraw() {
  if (REDUCED || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  const txt = document.querySelector("#logodraw .ld-text");
  if (!txt) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.set(txt, { attr: { "stroke-dasharray": 1500, "stroke-dashoffset": 1500 }, fillOpacity: 0 });
  const tl = gsap.timeline({ scrollTrigger: { trigger: "#logodraw", start: "top 80%", once: true } });
  tl.to(txt, { attr: { "stroke-dashoffset": 0 }, duration: 1.6, ease: "power2.inOut" })
    .to(txt, { fillOpacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.35");
})();

/* -------------------------------------------------------- giant kinetic statement */
(function kstat() {
  if (REDUCED || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  const el = document.querySelector("[data-kstat]");
  if (!el) return;
  gsap.registerPlugin(ScrollTrigger);
  // split into words (kept whole, nowrap) then chars, so words never break mid-word
  const parts = el.textContent.split(/(\s+)/);
  el.textContent = "";
  const spans = [];
  parts.forEach((part) => {
    if (part === "") return;
    if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(" ")); return; }
    const word = document.createElement("span"); word.className = "kw";
    [...part].forEach((c) => { const s = document.createElement("span"); s.className = "kc"; s.textContent = c; word.appendChild(s); spans.push(s); });
    el.appendChild(word);
  });
  gsap.from(spans, { yPercent: 120, opacity: 0, rotateX: -45, stagger: 0.03, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: "#kstat", start: "top 75%", once: true } });
})();

/* -------------------------------------------------------- split-image reveal */
(function splitReveal() {
  if (REDUCED || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  const sec = document.querySelector("#splitreveal");
  if (!sec) return;
  gsap.registerPlugin(ScrollTrigger);
  const st = { trigger: sec, start: "top bottom", end: "center center", scrub: 0.6 };
  gsap.to(sec.querySelector(".sr-left"), { xPercent: -100, ease: "none", scrollTrigger: st });
  gsap.to(sec.querySelector(".sr-right"), { xPercent: 100, ease: "none", scrollTrigger: st });
})();

/* -------------------------------------------------------- skyline rises */
(function skyline() {
  const sec = document.querySelector("#skyline");
  if (!sec) return;
  const towers = sec.querySelectorAll(".sky-tower");
  if (REDUCED || !towers.length) return; // CSS default shows the towers upright
  // arm: collapse with a staggered CSS transition (FOUC-safe — visible by default if JS is off)
  towers.forEach((t, i) => { t.style.transition = "transform .8s cubic-bezier(.22,1,.36,1) " + (i * 0.05) + "s"; t.style.transform = "scaleY(0)"; });
  let played = false;
  const play = () => { if (played) return; played = true; towers.forEach((t) => { t.style.transform = "scaleY(1)"; }); };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { play(); io.disconnect(); } }), { threshold: 0.2 });
  io.observe(sec);
  setTimeout(() => { if (!played) towers.forEach((t) => { t.style.transform = "scaleY(1)"; }); }, 4000);
})();

/* -------------------------------------------------------- blog: posts wipe in */
(function blogWipe() {
  const posts = document.querySelectorAll(".posts.wipe .post");
  if (!posts.length) return;
  if (REDUCED) { posts.forEach((p) => p.classList.add("win")); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("win"); io.unobserve(e.target); } }), { threshold: 0.15 });
  posts.forEach((p) => io.observe(p));
})();

/* -------------------------------------------------------- faq: progress rail draws */
(function faqRail() {
  if (REDUCED || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  const rail = document.querySelector(".faq-rail span");
  if (!rail) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.to(rail, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".faq-wrap", start: "top 80%", end: "bottom 65%", scrub: 0.6 } });
})();

/* -------------------------------------------------------- blueprint: condo draws, words sprout */
(function blueprint() {
  if (REDUCED || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  const sec = document.querySelector("#blueprint");
  if (!sec) return;
  const pin = sec.querySelector(".blueprint-pin");
  const lines = sec.querySelectorAll(".bp-line");
  const build = sec.querySelector(".bp-build");
  const words = sec.querySelectorAll(".bp-words span");
  gsap.registerPlugin(ScrollTrigger);
  const init = () => {
    gsap.set(build, { opacity: 1 });
    gsap.set(words, { opacity: 0, yPercent: 45, scale: 0.8 });
    lines.forEach((l) => { const len = l.getTotalLength(); gsap.set(l, { strokeDasharray: len, strokeDashoffset: len }); });
    if (window.innerWidth >= 901) {
      /* Desktop: pinned build-then-hold scrub */
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "+=1700", pin: pin, scrub: 0.6, anticipatePin: 1, refreshPriority: 2 } });
      tl.to(lines, { strokeDashoffset: 0, stagger: 0.16, duration: 2.4, ease: "none" }, 0)
        .to(build, { opacity: 0.16, duration: 0.6, ease: "power2.in" }, 3.0)
        .to(words, { opacity: 1, yPercent: 0, scale: 1, stagger: 0.12, duration: 0.7, ease: "power3.out" }, 3.1)
        .to({}, { duration: 1.2 });
    } else {
      /* Mobile: simple, reliable reveal (no pin, no finicky line-draw). Building shows, words rise in. */
      gsap.set(lines, { strokeDashoffset: 0 });   // building fully drawn
      gsap.set(build, { opacity: 0, y: 18 });
      let played = false;
      const play = () => {
        if (played) return; played = true;
        gsap.timeline()
          .to(build, { opacity: 0.42, y: 0, duration: 0.7, ease: "power3.out" }, 0)
          .to(words, { opacity: 1, yPercent: 0, scale: 1, stagger: 0.08, duration: 0.55, ease: "power3.out" }, 0.18);
      };
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { play(); io.disconnect(); } }), { threshold: 0.25 });
      io.observe(sec);
      /* failsafe: never let it stay hidden */
      setTimeout(() => { if (!played) { gsap.set(build, { opacity: 0.42, y: 0 }); gsap.set(words, { opacity: 1, yPercent: 0, scale: 1 }); } }, 2500);
    }
  };
  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);
})();

/* -------------------------------------------------------- building-into-text morph */
(function bmorph() {
  if (REDUCED || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  const sec = document.querySelector(".bmorph");
  if (!sec) return;
  const ko = sec.querySelector(".bmorph-knockout");
  const photo = sec.querySelector(".bmorph-photo");
  gsap.registerPlugin(ScrollTrigger);
  // start: full building visible; on scroll it collapses into the letters
  gsap.set(ko, { opacity: 0 });
  gsap.to(ko, { opacity: 1, ease: "none", scrollTrigger: { trigger: sec, start: "top 75%", end: "center center", scrub: 0.6 } });
  if (photo) gsap.fromTo(photo, { scale: 1.14 }, { scale: 1, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 0.6 } });
})();

/* -------------------------------------------------------- horizontal showcase (Services) */
(function hshow() {
  if (REDUCED || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  const sec = document.querySelector("#hshow");
  if (!sec) return;
  const track = sec.querySelector(".htrack");
  const pin = sec.querySelector(".hshow-pin");
  const prog = sec.querySelector(".hshow-progress span");
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: sec, start: "top top", end: () => "+=" + dist(), pin: pin, scrub: 0.6,
        anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => { if (prog) prog.style.transform = "scaleX(" + (1 + 3 * self.progress) + ")"; },
      },
    });
    return () => { if (tween.scrollTrigger) tween.scrollTrigger.kill(); tween.kill(); };
  });
})();

/* -------------------------------------------------------- cinematic videos: play only in view */
(function cineVideos() {
  const vids = document.querySelectorAll(".cine-vid, .hero-cine-vid");
  if (!vids.length) return;
  if (REDUCED) { vids.forEach((v) => { try { v.pause(); v.removeAttribute("autoplay"); } catch (e) {} }); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { const p = v.play && v.play(); if (p && p.catch) p.catch(() => {}); }
      else if (v.pause) v.pause();
    });
  }, { threshold: 0.15 });
  vids.forEach((v) => io.observe(v));
})();

/* -------------------------------------------------------- scroll progress */
(function progress() {
  const bar = document.querySelector(".scroll-prog");
  if (!bar) return;
  let ticking = false;
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    ticking = false;
  };
  update();
  window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  window.addEventListener("resize", update, { passive: true });
})();

/* -------------------------------------------------------- recompute pin positions after load
   (lazy images change section heights; without this, pinned sections can overlap) */
(function refreshPins() {
  if (typeof ScrollTrigger === "undefined") return;
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh);
  // also after fonts settle and a beat later, to catch late layout shifts
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(refresh, 80));
})();

/* -------------------------------------------------------- year stamp */
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
