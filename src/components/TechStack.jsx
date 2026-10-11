import React from 'react';
import { motion } from 'framer-motion';
import SolarSystem from './SolarSystem';

const languages = ['Solidity', 'Noir', 'TypeScript', 'Python', 'Rust', 'JavaScript', 'C++'];
const tools = ['Foundry', 'Next.js', 'React Native', 'FastAPI', 'Node.js', 'Anchor', 'Solana', 'MongoDB', 'ESP32', 'Docker', 'Linux', 'Git'];

// An endless band: the list is rendered twice and the track slides by exactly half its width
const Band = ({ words, reverse, outlined }) => (
  <div className="flex overflow-hidden select-none [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
    <div
      className={`flex shrink-0 items-center gap-10 pr-10 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} motion-reduce:animate-none`}
    >
      {[...words, ...words].map((w, i) => (
        <span key={i} className="flex items-center gap-10">
          <span
            className={`font-display font-bold tracking-tight whitespace-nowrap text-6xl md:text-8xl ${
              outlined ? 'text-outline' : 'text-foreground'
            }`}
          >
            {w}
          </span>
          <span className="text-accent text-3xl md:text-4xl">✦</span>
        </span>
      ))}
    </div>
  </div>
);

const TechStack = () => {
  return (
    <section data-shape="systems" className="py-20 border-t border-foreground/5">
      <motion.h4
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-sm font-mono text-accent mb-12 tracking-widest uppercase"
      >
        Technology Stack
      </motion.h4>

      <div className="full-bleed flex flex-col gap-4 md:gap-6">
        <Band words={languages} />
        <Band words={tools} reverse outlined />
      </div>

      {/* Particles scatter into faint dust so the solar system stands on its own */}
      <motion.div
        data-shape="dust"
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="mt-20 md:mt-28"
      >
        <SolarSystem />
      </motion.div>
    </section>
  );
};

export default TechStack;
