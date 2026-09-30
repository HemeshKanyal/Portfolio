import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const items = [
  { id: 'home', label: 'Intro' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Work' },
  { id: 'contact', label: 'Contact' },
];

// Vertical scroll rail on the left: a track that fills with scroll progress,
// one star per section, and labels that slide out on hover.
const SideNav = () => {
  const [active, setActive] = useState('home');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);

      const mid = window.innerHeight * 0.5;
      let current = items[0].id;
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= mid) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <motion.nav
      aria-label="Sections"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="group/rail fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:block"
    >
      {/* Track + progress fill */}
      <div className="absolute left-[5px] top-1 bottom-1 w-px bg-foreground/10" />
      <div
        className="absolute left-[5px] top-1 w-px bg-accent origin-top"
        style={{ height: 'calc(100% - 0.5rem)', transform: `scaleY(${progress})` }}
      />

      <ul className="relative flex flex-col gap-9">
        {items.map(({ id, label }, i) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                onClick={() => goTo(id)}
                aria-current={isActive ? 'true' : undefined}
                className="group/item flex items-center gap-4"
              >
                <span
                  className={`relative w-[11px] h-[11px] rounded-full border transition-all duration-300 ${
                    isActive
                      ? 'bg-accent border-accent shadow-[0_0_14px_3px_rgba(242,196,109,0.55)] scale-110'
                      : 'bg-background border-foreground/30 group-hover/item:border-accent'
                  }`}
                />
                <span
                  className={`font-mono text-xs uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'text-accent opacity-100 translate-x-0'
                      : 'text-muted opacity-0 -translate-x-2 group-hover/rail:opacity-100 group-hover/rail:translate-x-0 group-hover/item:text-foreground'
                  }`}
                >
                  <span className="text-foreground/40 mr-2">0{i + 1}</span>
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
};

export default SideNav;
