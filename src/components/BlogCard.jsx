import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

const BlogCard = ({ blog, onOpen }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={() => onOpen(blog)}
      className="group relative bg-[#121212] border border-white/5 rounded-3xl overflow-hidden hover:border-accent/30 transition-all duration-500 shadow-2xl shadow-black/50 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={blog.image} 
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="flex items-center gap-4 text-xs text-muted mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-accent/70" />
            <span>{blog.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-accent/70" />
            <span>{blog.time}</span>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-accent transition-colors duration-300">
          {blog.title}
        </h3>

        <p className="text-muted text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
          {blog.excerpt}
        </p>

        <button className="flex items-center gap-2 text-accent font-semibold text-sm group/btn">
          Read Full Story
          <ArrowRight size={16} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
      </div>

      {/* Decorative Glow */}
      <div className="absolute -inset-px bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10" />
    </motion.div>
  );
};

export default BlogCard;
