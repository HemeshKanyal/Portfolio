import React from 'react';
import { motion } from 'framer-motion';

const Philosophy = () => {
  return (
    <section className="min-h-[60vh] flex flex-col justify-center items-center text-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl"
      >
        <p className="text-3xl md:text-5xl font-medium leading-relaxed md:leading-snug text-white">
          <span className="text-muted">I don't just build applications.</span>
          <br />
          I design systems that scale, adapt, and evolve.
        </p>
      </motion.div>
    </section>
  );
};

export default Philosophy;
