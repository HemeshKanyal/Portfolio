import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const socials = [
  { label: 'GitHub', href: 'https://github.com/HemeshKanyal' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/hemeshkanyal22' },
  { label: 'Twitter', href: 'https://x.com/HemeshKanyal' },
  { label: 'Instagram', href: 'https://www.instagram.com/hemeshkanyal22' },
];

// km/s: Earth around the Sun, and the Sun around the centre of the Milky Way
const EARTH_ORBIT = 29.78;
const SUN_ORBIT = 230;

// How far the visitor has been carried through space since the page opened
const Travelled = () => {
  const earthRef = useRef(null);
  const sunRef = useRef(null);

  useEffect(() => {
    const nf = new Intl.NumberFormat('en-US');
    const update = () => {
      const seconds = performance.now() / 1000;
      earthRef.current.textContent = nf.format(Math.floor(seconds * EARTH_ORBIT));
      sunRef.current.textContent = nf.format(Math.floor(seconds * SUN_ORBIT));
    };
    update();
    const id = setInterval(update, 100);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="max-w-2xl text-base md:text-lg text-muted leading-relaxed mb-14">
      Since you arrived, Earth has carried you{' '}
      <span className="text-foreground font-mono tabular-nums"><span ref={earthRef}>0</span> km</span> around the Sun,
      and the Sun has carried you{' '}
      <span className="text-accent font-mono tabular-nums"><span ref={sunRef}>0</span> km</span> around the galaxy.
    </p>
  );
};

// Each word drops in from above and lands with a bounce
const Falling = ({ children, index, className = '' }) => {
  const reduced = useReducedMotion();
  const tilt = ((index * 37) % 17) - 8;
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -260, rotate: tilt }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{
        opacity: { duration: 0.2, delay: index * 0.14 },
        default: { type: 'spring', stiffness: 140, damping: 9, mass: 1.3, delay: index * 0.14 },
      }}
    >
      {children}
    </motion.span>
  );
};

// Collapse the page into the singularity; cosmos.js scrolls to the top and replays the Big Bang
const bigCrunch = () => {
  const root = document.documentElement;
  if (root.classList.contains('crunching')) return;
  const main = document.querySelector('main');
  root.style.setProperty('--crunch-y', `${window.innerHeight / 2 - main.getBoundingClientRect().top}px`);
  root.classList.add('crunching');

  let fallback = 0;
  const done = () => {
    clearTimeout(fallback);
    window.removeEventListener('cosmos:crunched', done);
    root.classList.remove('crunching');
  };
  window.addEventListener('cosmos:crunched', done);
  // Without WebGL nothing answers, so restart by hand
  fallback = setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    done();
  }, 2500);
  window.dispatchEvent(new Event('cosmos:crunch'));
};

const Contact = () => {
  return (
    <section id="contact" data-shape="galaxy" className="min-h-[80vh] flex flex-col justify-end pb-16 border-t border-foreground/10 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span className="text-accent mb-8 block font-mono uppercase tracking-[0.3em] text-sm">
          Collaborate
        </span>
        <h2 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] text-foreground mb-10">
          <Falling index={0}>Let’s</Falling> <Falling index={1}>build</Falling>
          <br />
          <Falling index={2} className="text-outline-accent">something</Falling>
          <br />
          <Falling index={3}>meaningful.</Falling>
        </h2>

        <Travelled />

        <a
          href="mailto:hemeshkanyal22@gmail.com"
          className="group inline-flex items-center gap-3 text-xl md:text-3xl font-display font-semibold text-accent hover:text-accent-hover transition-colors mb-14 break-all"
        >
          hemeshkanyal22@gmail.com
          <span className="inline-block transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
        </a>

        <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-foreground/10">
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-lg font-medium">
            {socials.map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground transition-colors relative group">
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={bigCrunch}
              className="group flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-accent hover:text-accent-hover transition-colors"
            >
              <span className="inline-block transition-transform duration-500 group-hover:-rotate-[360deg]">↺</span>
              Big Crunch
            </button>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
              © {new Date().getFullYear()} Hemesh Kanyal
            </span>
          </div>
        </div>
        <p className="mt-6 hidden md:block font-mono text-[11px] text-foreground/30">
          psst. type “gravity”.
        </p>
      </motion.div>
    </section>
  );
};

export default Contact;
