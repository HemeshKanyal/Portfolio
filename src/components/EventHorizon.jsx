import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const REDSHIFT = [255, 106, 77];
const STARLIGHT = [236, 232, 223];

const pad = (n, w = 2) => String(Math.floor(n)).padStart(w, '0');
const fmt = (s) => `${pad(s / 3600)}:${pad((s / 60) % 60)}:${pad(s % 60)}.${pad((s % 1) * 100)}`;

// A black hole at the centre of the screen (data-shape="blackhole" in three/cosmos.js) while the
// copy around it falls in: scrolling moves you toward the horizon, so your clock runs slow
// (Schwarzschild time dilation) and the text redshifts.
const EventHorizon = () => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const factorRef = useRef(null);
  const yourClockRef = useRef(null);
  const earthClockRef = useRef(null);
  const radiusRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    let frame = 0;
    let last = performance.now();
    let proper = 0;
    let earth = 0;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      // How far through the pinned part of the section we are
      const rect = section.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = span > 0 ? Math.min(Math.max(-rect.top / span, 0), 1) : 0;

      // Distance from the hole in Schwarzschild radii, falling from 8 to just outside the horizon
      const r = 1.02 + 7 * Math.pow(1 - p, 1.5);
      const factor = Math.sqrt(1 - 1 / r);
      proper += dt * factor;
      earth += dt;

      const shift = 1 - factor;
      const [cr, cg, cb] = STARLIGHT.map((c, i) => Math.round(c + (REDSHIFT[i] - c) * shift));
      headlineRef.current.style.color = `rgb(${cr} ${cg} ${cb})`;
      // Tidal stretching: taller and thinner as the hole gets closer
      headlineRef.current.style.transform = `scale(${1 - shift * 0.06}, ${1 + shift * 0.18})`;
      factorRef.current.textContent = `${factor.toFixed(3)}×`;
      factorRef.current.style.color = `rgb(${cr} ${cg} ${cb})`;
      radiusRef.current.textContent = `${r.toFixed(2)} rₛ`;
      yourClockRef.current.textContent = fmt(proper);
      earthClockRef.current.textContent = fmt(earth);
    };

    // Only run while the section is on screen
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) {
        last = performance.now();
        tick();
      }
    });
    io.observe(section);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} data-shape="blackhole" data-grid className="full-bleed relative h-[220vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="relative h-full max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-28 flex flex-col justify-between">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-xl"
          >
            <span className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-accent block mb-6">
              Event Horizon
            </span>
            <p
              ref={headlineRef}
              className="origin-top-left font-display text-3xl md:text-5xl font-semibold tracking-tight leading-[1.08] drop-shadow-[0_2px_24px_rgba(5,6,11,0.9)] will-change-transform"
            >
              Mass tells spacetime how to curve. Spacetime tells mass how to move.
            </p>
            <span className="mt-4 block font-mono text-xs uppercase tracking-[0.25em] text-muted">— John Wheeler</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-8"
          >
            <p className="max-w-sm text-lg md:text-xl text-muted leading-relaxed drop-shadow-[0_2px_16px_rgba(5,6,11,0.9)]">
              Good architecture works the same way. Get the core right and{' '}
              <span className="text-foreground">everything else falls into orbit</span> around it.
            </p>

            <dl className="font-mono text-xs uppercase tracking-[0.2em] text-muted grid grid-cols-[auto_auto] gap-x-6 gap-y-2 md:text-right p-5 rounded-2xl border border-foreground/10 bg-background/60 backdrop-blur-md">
              <dt>Time runs at</dt>
              <dd ref={factorRef} className="text-foreground text-base tabular-nums">0.935×</dd>
              <dt>Distance</dt>
              <dd ref={radiusRef} className="text-foreground tabular-nums normal-case">8.02 rₛ</dd>
              <dt>Your clock</dt>
              <dd ref={yourClockRef} className="text-accent tabular-nums">00:00:00.00</dd>
              <dt>Earth clock</dt>
              <dd ref={earthClockRef} className="text-foreground tabular-nums">00:00:00.00</dd>
            </dl>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EventHorizon;
