import React, { useEffect, useRef } from 'react';

// Letters with mass: each one leans toward the cursor on a spring, gets dragged hard while the
// background is a black hole, and is thrown outward by the supernova (events from three/cosmos.js).
const HOVER_PULL = 9;
const HOLE_PULL = 70;
const REACH = 260;

const HeavyWord = ({ text }) => {
  const rootRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    const letters = [...rootRef.current.children];
    const state = letters.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    const pointer = { x: -9999, y: -9999 };
    let hole = 0;
    let holding = false;
    let frame = 0;
    let last = performance.now();
    let visible = true;
    // While the gravity easter egg owns the letters, keep our hands off their transforms
    let paused = false;

    // Letter centres without our own transform, so the spring doesn't chase itself
    const centre = (el, s) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - s.x, y: r.top + r.height / 2 - s.y };
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      if (paused) return;
      hole += ((holding ? 1 : 0) - hole) * Math.min(1, dt * (holding ? 1.6 : 6));

      letters.forEach((el, i) => {
        const s = state[i];
        const c = centre(el, s);
        const dx = pointer.x - c.x;
        const dy = pointer.y - c.y;
        const d = Math.hypot(dx, dy) + 1;
        const reach = REACH * (1 + hole * 2.5);
        const strength = (HOVER_PULL + (HOLE_PULL - HOVER_PULL) * hole) / (1 + (d / reach) ** 2);
        const pull = Math.min(strength, d * 0.45);
        const tx = (dx / d) * pull;
        const ty = (dy / d) * pull;
        // Damped spring toward the target offset
        s.vx += ((tx - s.x) * 90 - s.vx * 11) * dt;
        s.vy += ((ty - s.y) * 90 - s.vy * 11) * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const tilt = s.x * 0.25;
        const stretch = 1 + Math.min(Math.hypot(s.x, s.y) / 300, 0.15);
        el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${tilt}deg) scale(${1 / stretch}, ${stretch})`;
      });
    };

    const onMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onHole = (e) => { holding = e.detail; };
    const onGravity = (e) => {
      paused = e.detail;
      if (paused) state.forEach((s) => Object.assign(s, { x: 0, y: 0, vx: 0, vy: 0 }));
    };
    const onBurst = (e) => {
      const power = e.detail;
      letters.forEach((el, i) => {
        const s = state[i];
        const c = centre(el, s);
        const dx = c.x - pointer.x;
        const dy = c.y - pointer.y;
        const d = Math.hypot(dx, dy) + 1;
        const kick = (1400 * power) / (1 + d / 400);
        s.vx += (dx / d) * kick;
        s.vy += (dy / d) * kick;
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('cosmos:hole', onHole);
    window.addEventListener('cosmos:burst', onBurst);
    window.addEventListener('cosmos:ripple', onBurst);
    window.addEventListener('cosmos:gravity', onGravity);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) {
        last = performance.now();
        tick();
      }
    });
    io.observe(rootRef.current);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('cosmos:hole', onHole);
      window.removeEventListener('cosmos:burst', onBurst);
      window.removeEventListener('cosmos:ripple', onBurst);
      window.removeEventListener('cosmos:gravity', onGravity);
    };
  }, []);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span ref={rootRef} aria-hidden="true">
        {[...text].map((ch, i) => (
          <span key={i} className="inline-block will-change-transform">
            {ch}
          </span>
        ))}
      </span>
    </>
  );
};

export default HeavyWord;
