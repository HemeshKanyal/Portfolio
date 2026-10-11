import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Easter egg: type "gravity" and everything on screen falls and piles up at the bottom.
// Click a fallen piece to kick it back up; type it again (or press Esc) to restore.
const WORD = 'gravity';
// Anything that is itself a thing on screen: its own text, or an image, control or diagram
const SOLID = 'img, svg, button, a, [role="img"]';
const hasOwnText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
const G = 2600; // px/s²
const COLUMN = 8; // px; resolution of the height map pieces stack on

// Containers that clip vertically (marquees, the pinned black hole section) would hide anything
// falling out of them. Horizontal clipping (the page root) doesn't matter for a fall.
const insideClip = (el) => {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p);
    if (overflowY === 'hidden' || overflowY === 'clip') return true;
  }
  return false;
};

function collect() {
  const vh = window.innerHeight;
  const all = [...document.querySelectorAll('main *')].filter((el) => {
    if (!(hasOwnText(el) || el.matches(SOLID)) || el.closest('.sr-only')) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && !insideClip(el);
  });
  // Outermost wins: a link inside a falling list item rides along with it
  const set = new Set(all);
  return all.filter((el) => {
    for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false;
    return true;
  });
}

function start() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const ground = new Float32Array(Math.ceil(vw / COLUMN) + 1).fill(vh);
  const bodies = collect().map((el) => {
    const r = el.getBoundingClientRect();
    return {
      el,
      rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom },
      x: 0, y: 0, angle: 0,
      vx: (Math.random() - 0.5) * 120,
      vy: -Math.random() * 260,
      va: (Math.random() - 0.5) * 90,
      settled: false,
      prevTransform: el.style.transform,
      prevDisplay: el.style.display,
    };
  });
  bodies.forEach((b) => {
    b.el.style.willChange = 'transform';
    // Transforms don't apply to inline boxes
    if (getComputedStyle(b.el).display === 'inline') b.el.style.display = 'inline-block';
  });

  const columns = (b) => {
    const a = Math.max(0, Math.floor((b.rect.left + b.x) / COLUMN));
    const z = Math.min(ground.length - 1, Math.floor((b.rect.right + b.x) / COLUMN));
    return [a, z];
  };

  let frame = 0;
  let last = performance.now();
  let restoring = 0;

  const step = () => {
    frame = requestAnimationFrame(step);
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;

    if (restoring) {
      // Float everything home
      const k = Math.min(1, dt * 5);
      let done = true;
      for (const b of bodies) {
        b.x -= b.x * k; b.y -= b.y * k; b.angle -= b.angle * k;
        if (Math.abs(b.x) + Math.abs(b.y) > 0.5) done = false;
        b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.angle}deg)`;
      }
      if (done) finish();
      return;
    }

    for (const b of bodies) {
      if (b.settled) continue;
      b.vy += G * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.angle += b.va * dt;

      // Walls
      if (b.rect.left + b.x < 0) { b.x = -b.rect.left; b.vx = Math.abs(b.vx) * 0.5; }
      if (b.rect.right + b.x > vw) { b.x = vw - b.rect.right; b.vx = -Math.abs(b.vx) * 0.5; }

      // Land on the floor or on whatever already landed under us
      const [a, z] = columns(b);
      let floor = vh;
      for (let c = a; c <= z; c++) floor = Math.min(floor, ground[c]);
      if (b.vy > 0 && b.rect.bottom + b.y >= floor) {
        b.y = floor - b.rect.bottom;
        if (b.vy > 420) {
          b.vy *= -0.32;
          b.vx *= 0.7;
          b.va *= 0.5;
        } else {
          b.settled = true;
          b.vy = 0;
          b.angle = Math.max(-7, Math.min(7, b.angle % 360));
          const top = b.rect.top + b.y;
          for (let c = a; c <= z; c++) ground[c] = top;
        }
      }
      b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.angle}deg)`;
    }
  };

  // Clicking a fallen piece kicks it back into the air; everything else re-settles around it
  const onPointerDown = (e) => {
    const hit = bodies.find((b) => b.el.contains(e.target));
    if (!hit || restoring) return;
    e.preventDefault();
    ground.fill(vh);
    for (const b of bodies) b.settled = false;
    hit.vy = -1500 - Math.random() * 600;
    hit.vx = (Math.random() - 0.5) * 900;
    hit.va = (Math.random() - 0.5) * 720;
  };
  // Pieces are links and buttons; while they're rubble they shouldn't navigate
  const swallowClick = (e) => {
    if (bodies.some((b) => b.el.contains(e.target))) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('click', swallowClick, true);

  const root = document.documentElement;
  const prevOverflow = root.style.overflow;
  root.style.overflow = 'hidden';
  step();

  let onFinished = null;
  const finish = () => {
    cancelAnimationFrame(frame);
    for (const b of bodies) {
      b.el.style.transform = b.prevTransform;
      b.el.style.display = b.prevDisplay;
      b.el.style.willChange = '';
    }
    window.removeEventListener('pointerdown', onPointerDown, true);
    window.removeEventListener('click', swallowClick, true);
    root.style.overflow = prevOverflow;
    onFinished?.();
  };

  return {
    restore(cb) {
      onFinished = cb;
      restoring = 1;
    },
    abort: finish,
  };
}

const GravityEgg = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let typed = '';
    let sim = null;

    const toggle = () => {
      if (sim) {
        sim.restore(() => {
          sim = null;
          window.dispatchEvent(new CustomEvent('cosmos:gravity', { detail: false }));
        });
        setActive(false);
      } else {
        window.dispatchEvent(new CustomEvent('cosmos:gravity', { detail: true }));
        sim = start();
        setActive(true);
      }
    };

    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, [contenteditable]')) return;
      if (e.key === 'Escape' && sim) {
        toggle();
        return;
      }
      if (e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-WORD.length);
      if (typed === WORD) {
        typed = '';
        toggle();
      }
    };
    const onToggle = () => toggle();

    window.addEventListener('keydown', onKey);
    window.addEventListener('gravity:toggle', onToggle);
    console.log('%c✦ psst. type "gravity" anywhere on the page.', 'color:#f2c46d;font-family:monospace');
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('gravity:toggle', onToggle);
      sim?.abort();
    };
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.button
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          onClick={() => window.dispatchEvent(new Event('gravity:toggle'))}
          // framer-motion owns transform here, so centre with its x rather than a Tailwind translate
          style={{ x: '-50%' }}
          className="fixed top-6 left-1/2 z-[60] px-5 py-2.5 rounded-full border border-accent/50 bg-background/70 backdrop-blur-md font-mono text-xs uppercase tracking-[0.2em] text-accent shadow-xl shadow-black/30"
        >
          ↑ Restore gravity <span className="text-muted normal-case tracking-normal">· esc</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default GravityEgg;
