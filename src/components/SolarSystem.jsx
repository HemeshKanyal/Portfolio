import React, { useEffect, useRef } from 'react';

// Inner orbits are the tools I reach for most; the outer, dashed one is what I'm exploring now
const ORBITS = [
  { label: 'Languages', radius: 0.3, items: ['Solidity', 'Noir', 'TypeScript', 'Python', 'Rust', 'JavaScript'], style: 'solid' },
  { label: 'Frameworks', radius: 0.52, items: ['Next.js', 'React', 'React Native', 'FastAPI', 'Node.js', 'Express'], style: 'outline' },
  { label: 'Chain & infra', radius: 0.74, items: ['Foundry', 'Anchor', 'Solana', 'MongoDB', 'ESP32', 'Docker', 'Linux', 'Git'], style: 'muted' },
  { label: 'Exploring', radius: 0.96, items: ['Kubernetes', 'AWS', 'CI/CD', 'Monitoring'], style: 'exploring' },
];

// Kepler's third law: angular speed ∝ r^-1.5, anchored to the outermost orbit
const OUTER_SPEED = 0.045;
const speedFor = (r) => OUTER_SPEED * Math.pow(ORBITS[ORBITS.length - 1].radius / r, 1.5);

const PILL = {
  solid: 'bg-foreground text-background border-foreground',
  outline: 'bg-background/70 text-foreground border-foreground/40',
  muted: 'bg-background/70 text-muted border-foreground/15',
  exploring: 'bg-background/70 text-accent border-accent/60 border-dashed',
};

const planets = ORBITS.flatMap((orbit, o) =>
  orbit.items.map((name, i) => ({
    name,
    orbit: o,
    // Spread evenly, with each orbit's set rotated so they don't line up
    phase: (i / orbit.items.length) * Math.PI * 2 + o * 0.9,
  }))
);

const SolarSystem = () => {
  const stageRef = useRef(null);
  const pillRefs = useRef([]);
  const ellipseRefs = useRef([]);

  useEffect(() => {
    const stage = stageRef.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let last = performance.now();
    let time = 0;
    let rate = 1;
    let hovered = -1;
    let size = { w: 1, h: 1, tilt: 0.4 };
    const pointer = { x: -9999, y: -9999 };
    const offsets = planets.map(() => ({ x: 0, y: 0 }));

    const measure = () => {
      const w = stage.clientWidth;
      const tilt = w < 640 ? 0.62 : 0.4;
      size = { w, h: stage.clientHeight, tilt };
      ORBITS.forEach((orbit, o) => {
        const el = ellipseRefs.current[o];
        el.setAttribute('cx', w / 2);
        el.setAttribute('cy', size.h / 2);
        el.setAttribute('rx', orbit.radius * w * 0.46);
        el.setAttribute('ry', orbit.radius * w * 0.46 * tilt);
      });
    };

    const render = (dt) => {
      // Hovering a planet slows time for the whole system
      rate += ((hovered >= 0 ? 0.12 : 1) - rate) * Math.min(1, dt * 5);
      time += dt * rate;
      const stageRect = stage.getBoundingClientRect();
      const cx = size.w / 2, cy = size.h / 2;

      planets.forEach((p, i) => {
        const orbit = ORBITS[p.orbit];
        const R = orbit.radius * size.w * 0.46;
        const a = p.phase + (reduced ? 0 : time * speedFor(orbit.radius));
        let x = cx + Math.cos(a) * R;
        let y = cy + Math.sin(a) * R * size.tilt;
        // Lower half of the ellipse is the near side
        const depth = Math.sin(a);

        // The cursor has a little gravity of its own
        const dx = pointer.x - stageRect.left - x;
        const dy = pointer.y - stageRect.top - y;
        const d = Math.hypot(dx, dy) + 1;
        const pull = reduced ? 0 : Math.min(16, 2400 / (d + 60)) * Math.max(0, 1 - d / 260);
        const off = offsets[i];
        off.x += ((dx / d) * pull - off.x) * Math.min(1, dt * 6);
        off.y += ((dy / d) * pull - off.y) * Math.min(1, dt * 6);
        x += off.x;
        y += off.y;

        const el = pillRefs.current[i];
        const scale = 0.82 + 0.22 * (depth + 1) / 2;
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${hovered === i ? 1.15 : scale})`;
        el.style.opacity = hovered === i ? 1 : 0.55 + 0.45 * (depth + 1) / 2;
        el.style.zIndex = hovered === i ? 100 : Math.round((depth + 1) * 40);
      });
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      render(dt);
    };

    const onMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
    };
    const hover = (target) => {
      const el = target?.closest?.('[data-planet]');
      hovered = el ? Number(el.dataset.planet) : -1;
    };
    const onOver = (e) => hover(e.target);
    const onOut = (e) => hover(e.relatedTarget);

    measure();
    render(0);
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);
    stage.addEventListener('pointerover', onOver);
    stage.addEventListener('pointerout', onOut);

    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) {
        last = performance.now();
        tick();
      }
    });
    io.observe(stage);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(frame);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      stage.removeEventListener('pointerover', onOver);
      stage.removeEventListener('pointerout', onOut);
    };
  }, []);

  return (
    <div>
      <div
        ref={stageRef}
        className="relative w-full aspect-[1/0.72] sm:aspect-[1/0.5] select-none"
        role="img"
        aria-label={ORBITS.map((o) => `${o.label}: ${o.items.join(', ')}`).join('. ')}
      >
        <svg className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
          {ORBITS.map((orbit, o) => (
            <ellipse
              key={orbit.label}
              ref={(el) => (ellipseRefs.current[o] = el)}
              fill="none"
              stroke={orbit.style === 'exploring' ? 'rgb(242 196 109 / 0.35)' : 'rgb(236 232 223 / 0.1)'}
              strokeDasharray={orbit.style === 'exploring' ? '4 6' : undefined}
            />
          ))}
        </svg>

        {/* The star everything orbits */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-20 md:h-20 rounded-full bg-[radial-gradient(circle,#fff6dd_0%,#f2c46d_35%,rgba(242,196,109,0.25)_60%,transparent_72%)] shadow-[0_0_80px_20px_rgba(242,196,109,0.25)] z-[40]" />

        <div aria-hidden="true">
          {planets.map((p, i) => (
            <span
              key={p.name}
              ref={(el) => (pillRefs.current[i] = el)}
              data-planet={i}
              className={`absolute left-0 top-0 px-3 py-1 md:px-4 md:py-1.5 rounded-full border font-mono text-[10px] md:text-sm whitespace-nowrap will-change-transform transition-colors ${PILL[ORBITS[p.orbit].style]}`}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>

      <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
        {ORBITS.map((o) => (
          <li key={o.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full border ${PILL[o.style]}`} />
            {o.label}
          </li>
        ))}
        <li className="text-foreground/40 normal-case tracking-normal">Inner orbits move faster, as Kepler said they would. Hover one to slow time.</li>
      </ul>
    </div>
  );
};

export default SolarSystem;
