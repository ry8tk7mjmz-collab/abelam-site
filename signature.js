/* =========================================================================
   ABE LAM REALTY — signature scroll experience (home only)
   Apple-style: native scroll + GSAP ScrollTrigger pin/scrub.
   "Build, then HOLD" — content assembles in the first part of the pin, then
   the finished frame is held still so it can be read, then it releases.
   No Lenis. Degrades to a fully visible static page if GSAP is missing or
   the visitor prefers reduced motion.
   ========================================================================= */
(function () {
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* split an element's text into per-word [clip > span] pairs, return the spans */
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    const spans = [];
    words.forEach((word, i) => {
      const clip = document.createElement("span");
      clip.className = "cw";
      const inner = document.createElement("span");
      inner.textContent = word;
      clip.appendChild(inner);
      el.appendChild(clip);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      spans.push(inner);
    });
    return spans;
  }

  if (!hasGSAP || REDUCED) return; // CSS already shows the finished state

  gsap.registerPlugin(ScrollTrigger);

  // tighter scrub tracks the scroll closely so the page keeps flowing
  const SCRUB = 0.6;

  /* ---------------------------------------------------------------- CINEMA
     Full-bleed building scales + cross-fades; headline rises word by word;
     subline rises; the "units" meter ticks 1 -> 800. Everything is assembled
     by ~55% of the pin, then HELD so the visitor can read it before release. */
  (function cinema() {
    const sec = document.querySelector("#cinema");
    if (!sec) return;
    const pin = sec.querySelector(".cinema-pin");
    const bg = sec.querySelector(".cinema-bg");
    const imgs = sec.querySelectorAll(".cinema-bg img");
    const eyebrow = sec.querySelector(".cinema-eyebrow");
    const headEls = sec.querySelectorAll("[data-words]");
    const sub = sec.querySelector(".cinema-sub");
    const meter = sec.querySelector(".cinema-meter");
    const num = sec.querySelector(".cinema-meter .n");
    const cue = sec.querySelector(".cinema-scrollcue");

    const headWords = [];
    headEls.forEach((el) => splitWords(el).forEach((w) => headWords.push(w)));

    gsap.set(bg, { scale: 1.16 });
    gsap.set(headWords, { yPercent: 118, opacity: 0 });
    gsap.set([eyebrow, sub, meter], { opacity: 0, y: 24 });
    const counter = { v: 1 };

    const tl = gsap.timeline({
      scrollTrigger: { trigger: sec, start: "top top", end: "+=1500", pin: pin, scrub: SCRUB, anticipatePin: 1, refreshPriority: 1 },
    });

    tl.to(bg, { scale: 1, ease: "none", duration: 5.6 }, 0)
      .to(cue, { opacity: 0, duration: 0.4 }, 0.6)
      .to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.2)
      .to(headWords, { yPercent: 0, opacity: 1, stagger: 0.1, duration: 1.0, ease: "power3.out" }, 0.4)
      .to(imgs[1], { opacity: 1, duration: 0.9, ease: "none" }, 1.9)
      .to(sub, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 2.2)
      .to(imgs[2], { opacity: 1, duration: 0.9, ease: "none" }, 3.2)
      .to(meter, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, 3.4)
      .to(counter, {
        v: 1000, duration: 1.9, ease: "power1.inOut",
        onUpdate: () => { if (num) num.textContent = Math.round(counter.v).toLocaleString(); },
      }, 3.5)
      // short HOLD: brief readable beat, then release
      .to({}, { duration: 1.0 });
  })();

  /* --------------------------------------------------------------- ENGINE
     The Compounding Engine. Bars grow, the curve draws itself, the readout
     ticks 0 -> 800. Assembled by ~55% of the pin, then HELD to read.
     Pinned on desktop; plays once on entry on small screens. */
  (function engine() {
    const sec = document.querySelector("#engine");
    if (!sec) return;
    const pin = sec.querySelector(".engine-pin");
    const bars = sec.querySelectorAll(".engine-bar");
    const line = sec.querySelector(".engine-line");
    const area = sec.querySelector(".engine-area");
    const dot = sec.querySelector(".engine-dot");
    const ring = sec.querySelector(".engine-ring");
    const num = sec.querySelector(".engine-readout .n");
    const copyWords = [];
    sec.querySelectorAll("[data-words]").forEach((el) => splitWords(el).forEach((w) => copyWords.push(w)));
    const len = line ? line.getTotalLength() : 0;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 901px)", () => {
      setStart();
      const counter = { v: 0 };
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sec, start: "top top", end: "+=1300", pin: pin, scrub: SCRUB, anticipatePin: 1, refreshPriority: 0 },
      });
      build(tl, counter);
      tl.to({}, { duration: 0.8 }); // short HOLD so the finished chart stays readable
      return () => {};
    });

    mm.add("(max-width: 900px)", () => {
      setStart();
      const counter = { v: 0 };
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sec, start: "top 80%", once: true },
      });
      build(tl, counter, true); // play once on entry, then it simply stays
      return () => {};
    });

    function setStart() {
      gsap.set(copyWords, { yPercent: 115, opacity: 0 });
      gsap.set(bars, { scaleY: 0 });
      if (line) gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      if (area) gsap.set(area, { opacity: 0 });
      if (dot) gsap.set(dot, { opacity: 0 });
      if (ring) gsap.set(ring, { opacity: 0 });
    }

    function build(tl, counter, real) {
      const u = real ? 0.85 : 1; // real-time version a touch quicker
      tl.to(copyWords, { yPercent: 0, opacity: 1, stagger: 0.05 * u, duration: 0.9 * u, ease: "power3.out" }, 0)
        .to(bars, { scaleY: 1, stagger: 0.1 * u, duration: 1.2 * u, ease: "power2.out" }, 0.4)
        .to(area, { opacity: 1, duration: 1.3 * u, ease: "none" }, 0.6);
      if (line) tl.to(line, { strokeDashoffset: 0, duration: 2.0 * u, ease: "power1.inOut" }, 0.6);
      tl.to(counter, {
        v: 1000, duration: 2.0 * u, ease: "power1.inOut",
        onUpdate: () => { if (num) num.textContent = Math.round(counter.v).toLocaleString() + "+"; },
      }, 0.6);
      if (dot) tl.to(dot, { opacity: 1, duration: 0.4 }, 2.2 * u);
      if (ring) tl.to(ring, { opacity: 0.28, duration: 0.5 }, 2.3 * u);
    }
  })();

  /* ----------------------------------------------------------------- ETHOS
     A house draws itself line by line, then dissolves as the headline
     resolves in its place. CSS default shows the text (FOUC-safe). */
  (function ethos() {
    const sec = document.querySelector("#ethos");
    if (!sec) return;
    const pin = sec.querySelector(".ethos-inner");
    const lines = sec.querySelectorAll(".house-line");
    const house = sec.querySelector(".house");
    const text = sec.querySelector(".ethos-text");
    const cue = sec.querySelector(".ethos-cue");
    gsap.set(house, { opacity: 1 });
    gsap.set(text, { opacity: 0, y: 30, scale: 0.96 });
    lines.forEach((l) => { const len = l.getTotalLength(); gsap.set(l, { strokeDasharray: len, strokeDashoffset: len }); });
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "+=1500", pin: pin, scrub: 0.6, anticipatePin: 1 } });
    tl.to(lines, { strokeDashoffset: 0, stagger: 0.12, duration: 2.0, ease: "none" }, 0)   // house assembles, part by part
      .to(cue, { opacity: 0, duration: 0.3 }, 0.5)
      .to(house, { opacity: 0, scale: 0.88, duration: 0.6, ease: "power2.in" }, 3.0)        // dissolve
      .to(text, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }, 3.05)    // becomes text
      .to({}, { duration: 1.4 });                                                            // hold the headline
  })();

  /* --------------------------------------------------------------- MARQUEE
     Scroll-driven only: slides left as you scroll down, back right as you
     scroll up. No auto-play. */
  (function marquee() {
    const track = document.querySelector(".marquee .mtrack");
    if (!track) return;
    gsap.fromTo(track, { xPercent: 4 }, {
      xPercent: -50, ease: "none",
      scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: 1 },
    });
  })();

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
