import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  return (
    <section className="min-h-screen flex flex-col justify-center relative">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-xl lg:max-w-[45vw] xl:max-w-xl"
      >
        <motion.h1 
          variants={item} 
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-10 text-white"
        >
          Hi, I'm <span className="text-accent">Hemesh</span>
        </motion.h1>

        <div className="flex flex-col gap-2 mb-8">
          <motion.p variants={item} className="text-2xl md:text-4xl lg:text-5xl text-foreground font-bold tracking-tight">
            I build ideas into reality.
          </motion.p>
        </div>

        <motion.p 
          variants={item} 
          className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl mb-12 font-medium"
        >
          From intelligent systems to blockchain infrastructure,<br/>
          I design and engineer products that scale.
        </motion.p>

        <motion.div variants={item} className="flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              const projectsSection = document.getElementById('projects');
              projectsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-3.5 bg-accent text-background font-semibold rounded-full hover:bg-accent-hover transition-all shadow-lg shadow-accent/20"
          >
            Explore My Work
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              const aboutSection = document.getElementById('about');
              aboutSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-3.5 border border-white/20 text-foreground font-semibold rounded-full hover:border-accent/50 hover:text-accent transition-all"
          >
            Enter My World
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
