'use client';

import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PHASES = [
  {
    id: '01',
    title: '01 — The Foundation',
    location: 'Madurai, India.',
    narrative:
      'Where the drive was built. A foundation rooted in raw ambition, understanding complex systems, and the relentless pursuit of scale.',
    image: '/Madurai Ph.jpg',
  },
  {
    id: '02',
    title: '02 — The Rigor',
    location: 'Riga, Latvia. (Med)',
    narrative:
      'Three years deep into European medical science. I mastered the analytical rigor, but the vision demanded more. So, I executed a ruthless pivot.',
    image: '/Riga Ph2.png',
  },
  {
    id: '03',
    title: '03 — The Syndicate',
    location: 'Riga, Latvia. (Biz)',
    narrative:
      'Trading anatomy for algorithms and business strategy. Today, alongside my co-founders at The Lead Agents, we engineer digital infrastructure and high-performance realities.',
    image: '/Riga Ph3.jpg',
  },
];

const NUM_PANELS = PHASES.length; // 3
const TRANSLATE_PCT = -((NUM_PANELS - 1) / NUM_PANELS) * 100; // -66.666…%

export default function HorizontalJourney() {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const imagesRef = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,

          // ── Pinning ────────────────────────────────────────────────────────
          pin: true,
          pinSpacing: true,   // GSAP adds a spacer after the pinned el to
          // reserve the exact scroll-distance in the container

          start: 'top top',   // Pin fires the instant the wrapper hits viewport top

          // end = 200% of wrapper height (corresponding to the scroll distance of translating the remaining panels)
          end: '+=200%',

          scrub: 1,               // Smooth lag between scroll pos and animation
          invalidateOnRefresh: true,
        },
      });

      // ── Translate the track ──────────────────────────────────────────────
      tl.to(track, {
        xPercent: TRANSLATE_PCT,
        ease: 'none',
      });

      // ── Parallax counter-motion on images ────────────────────────────────
      imagesRef.current.forEach((img) => {
        if (!img) return;
        tl.to(img, { xPercent: 10, ease: 'none' }, '<');
      });

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    /*
     * h-screen w-full: strict viewport sizing — no margins, no padding bleeds.
     * overflow-hidden: clips the 300vw track to the visible viewport.
     */
    <section
      ref={wrapperRef}
      id="about"
      className="relative h-screen w-full overflow-hidden bg-zinc-950 mt-0"
      style={{ margin: 0, padding: 0 }}
    >
      {/* The Horizontal Track  — width = numPanels × 100vw */}
      <div
        ref={trackRef}
        className="horizontal-track flex h-full"
        style={{ width: `${NUM_PANELS * 100}vw` }}
      >
        {PHASES.map((phase, i) => (
          <div
            key={phase.id}
            className="h-panel w-screen h-full flex flex-col md:flex-row flex-shrink-0"
          >
            {/* Left: Typography — 40% */}
            <div className="w-full md:w-[40%] h-full p-12 md:p-24 flex flex-col justify-center border-r border-zinc-900">
              <span className="font-mono text-xs tracking-[0.2em] text-zinc-500 uppercase mb-4">
                {phase.title}
              </span>

              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-100 uppercase leading-[0.9]">
                {phase.location}
              </h2>

              <p className="text-zinc-400 text-sm md:text-base max-w-md mt-8 leading-relaxed">
                {phase.narrative}
              </p>
            </div>

            {/* Right: Image — 60% */}
            <div className="w-full md:w-[60%] h-full relative p-8 bg-zinc-950">
              <div className="relative w-full h-full overflow-hidden rounded-lg bg-zinc-900">
                <img
                  ref={(el) => { if (el) imagesRef.current[i] = el; }}
                  src={phase.image}
                  alt={phase.location}
                  className="absolute inset-0 w-[150%] max-w-none h-full object-cover -left-[25%] grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-zinc-950/20 mix-blend-multiply pointer-events-none" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
