import React from 'react';
import { motion } from 'framer-motion';

const Discovery = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section data-shape="neural" className="min-h-[70vh] flex flex-col justify-center py-20">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.p variants={item} className="text-xl md:text-2xl text-accent mb-8 font-medium">
          I work across domains.
        </motion.p>
        
        <div className="flex flex-col gap-6 md:gap-8">
          {[
            ['Artificial Intelligence', 'neural'],
            ['Blockchain Systems', 'chain'],
            ['Scalable Infrastructure', 'systems'],
          ].map(([domain, shape]) => (
            <motion.div
              key={domain}
              data-shape={shape}
              variants={item} 
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight hover:text-accent transition-colors cursor-default"
            >
              {domain}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Discovery;
