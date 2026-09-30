import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BlogButton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="fixed top-6 right-6 md:top-8 md:right-8 z-50"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to="/blog"
          className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-foreground/10 bg-background/50 backdrop-blur-md text-foreground font-medium transition-all hover:border-accent/50 hover:text-accent shadow-xl shadow-black/20"
        >
        <span className="text-sm tracking-wide">BLOG</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="transition-transform group-hover:translate-x-1"
        >
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default BlogButton;
