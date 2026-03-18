import React from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <section id="contact" className="min-h-[50vh] flex flex-col justify-end pb-24 border-t border-white/10 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span className="text-accent mb-6 block font-medium uppercase tracking-widest text-sm">
          Collaborate
        </span>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-12">
          Let’s build something meaningful.
        </h2>
        
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-lg font-medium">
          <a href="mailto:hemeshkanyal22@gmail.com" className="text-muted hover:text-white transition-colors relative group">
            Email
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
          </a>
          <a href="https://github.com/HemeshKanyal" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-white transition-colors relative group">
            GitHub
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
          </a>
          <a href="https://linkedin.com/in/hemeshkanyal22" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-white transition-colors relative group">
            LinkedIn
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
          </a>
          <a href="https://x.com/HemeshKanyal" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-white transition-colors relative group">
            Twitter
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
          </a>
          <a href="https://www.instagram.com/hemeshkanyal22" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-white transition-colors relative group">
            Instagram
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;
