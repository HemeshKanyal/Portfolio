import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about" className="py-12 border-t border-white/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl"
      >
        <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed mb-6">
          I’m a computer science student focused on building 
          real-world systems at the intersection of AI and blockchain.
        </p>
        <p className="text-lg md:text-xl text-muted leading-relaxed">
          Beyond code, I train, explore, and push my limits — 
          both physically and mentally.
        </p>
      </motion.div>
    </section>
  );
};

export default About;
