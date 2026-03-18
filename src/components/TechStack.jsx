import React from 'react';
import { motion } from 'framer-motion';

const TechStack = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const techRows = [
    "Python · JavaScript · C++ . Solidity",
    "React · Tailwind · FastAPI . Node.js",
    "Blockchain · ZK · AI Systems",
    "Linux · Git · Blender"
  ];

  return (
    <section className="py-20 border-t border-white/5">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <motion.h4 variants={item} className="text-sm font-mono text-accent mb-8 tracking-widest uppercase">
          Technology Stack
        </motion.h4>

        <div className="flex flex-col gap-4">
          {techRows.map((row, idx) => (
            <motion.p
              key={idx}
              variants={item}
              className="text-xl md:text-3xl font-medium text-foreground/80 tracking-tight"
            >
              {row}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default TechStack;
