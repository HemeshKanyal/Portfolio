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

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="home" data-shape="planet" className="min-h-screen flex flex-col justify-center relative pt-24 pb-16">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.p
          variants={item}
          className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-accent mb-6 md:mb-8"
        >
          Blockchain · Zero-Knowledge · AI · Systems
        </motion.p>

        <motion.h1
          variants={item}
          className="font-display font-bold tracking-tighter leading-[0.82] text-[22vw] md:text-[11rem] lg:text-[13rem] xl:text-[14.5rem] text-foreground drop-shadow-[0_2px_24px_rgba(5,6,11,0.6)]"
        >
          Hemesh
        </motion.h1>
        <motion.p
          variants={item}
          aria-hidden="true"
          className="font-display font-bold tracking-tighter leading-[0.82] text-[22vw] md:text-[11rem] lg:text-[13rem] xl:text-[14.5rem] text-outline-accent mb-10 md:mb-14 select-none"
        >
          Kanyal
        </motion.p>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <motion.div variants={item} className="max-w-xl">
            <p className="text-2xl md:text-4xl text-foreground font-display font-semibold tracking-tight mb-4">
              I build ideas into reality.
            </p>
            <p className="text-lg md:text-xl text-muted leading-relaxed">
              From intelligent systems to blockchain infrastructure,
              I design and engineer products that scale.
            </p>
          </motion.div>

          <motion.div variants={item} className="flex flex-wrap gap-4 shrink-0">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => scrollTo('projects')}
              className="px-8 py-3.5 bg-accent text-background font-semibold rounded-full hover:bg-accent-hover transition-all shadow-[0_0_40px_-8px_rgba(242,196,109,0.6)]"
            >
              Explore My Work
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => scrollTo('about')}
              className="px-8 py-3.5 border border-foreground/20 text-foreground font-semibold rounded-full hover:border-accent/50 hover:text-accent transition-all backdrop-blur-sm"
            >
              Enter My World
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-8 left-0 hidden md:flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-muted"
      >
        <span className="relative block w-px h-10 bg-foreground/15 overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-accent animate-scroll-cue motion-reduce:animate-none" />
        </span>
        Scroll
      </motion.div>
    </section>
  );
};

export default Hero;
