import React from 'react';
import { motion } from 'framer-motion';

const CurrentWork = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const workItems = [
    "AI Engineering",
    "Tokenisation RWAs",
    "Blockchain Development"
  ];

  return (
    <section data-shape="fractions" className="min-h-[60vh] flex flex-col justify-center py-20">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h4 variants={item} className="text-xl md:text-2xl text-accent mb-12 font-medium tracking-wide">
          CURRENT WORK
        </motion.h4>
        
        <ul className="flex flex-col gap-10 md:gap-14">
          {workItems.map((work) => (
            <motion.li 
              key={work} 
              variants={item}
              className="group flex flex-col md:flex-row md:items-center cursor-default"
            >
              <div className="hidden md:block w-8 h-[2px] bg-foreground/20 mr-8 group-hover:w-16 group-hover:bg-accent transition-all duration-300"></div>
              <span className="text-3xl md:text-5xl font-bold text-foreground tracking-tight group-hover:text-accent transition-colors">
                {work}
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
};

export default CurrentWork;
