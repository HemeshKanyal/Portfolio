import React from 'react';
import { motion } from 'framer-motion';

// The one "negative" moment on the page: a full-width section in inverted colours.
const Philosophy = () => {
  return (
    <section data-shape="galaxy" className="full-bleed relative bg-foreground text-background overflow-hidden">
      <span
        aria-hidden="true"
        className="absolute -right-8 -bottom-16 md:-bottom-24 font-display font-bold leading-none text-[40vw] md:text-[24rem] text-background/[0.04] select-none pointer-events-none"
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
        <span className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-background/50 block mb-10">
          Philosophy
        </span>
        <p className="font-display text-4xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
          <span className="text-background/40">I don't just build applications.</span>
          <br />
          I design systems that scale, adapt, and{' '}
          <span className="italic font-bold underline decoration-[#d9a441] decoration-4 underline-offset-8">evolve.</span>
        </p>
      </motion.div>
    </section>
  );
};

export default Philosophy;
