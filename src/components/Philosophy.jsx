import React from 'react';
import { motion } from 'framer-motion';

// Sits directly on the cosmos: the galaxy shape swirls behind this text
const Philosophy = () => {
  return (
    <section data-shape="galaxy" className="full-bleed relative overflow-hidden">
      <span
        aria-hidden="true"
        className="absolute -right-8 -bottom-16 md:-bottom-24 font-display font-bold leading-none text-[40vw] md:text-[24rem] text-outline-faint select-none pointer-events-none"
      >
        ∞
      </span>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative max-w-6xl mx-auto px-6 md:px-12 py-28 md:py-44"
      >
        <span className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-accent block mb-10">
          Philosophy
        </span>
        <p className="font-display text-4xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-foreground drop-shadow-[0_2px_24px_rgba(5,6,11,0.8)]">
          <span className="text-muted">I don't just build applications.</span>
          <br />
          I design systems that scale, adapt, and{' '}
          <span className="italic font-bold text-accent">evolve.</span>
        </p>
      </motion.div>
    </section>
  );
};

export default Philosophy;
