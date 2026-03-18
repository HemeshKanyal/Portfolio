import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, X, Share2, Check } from 'lucide-react';

const BlogModal = ({ blog, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!blog) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/blog/${blog.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Buttons */}
        <div className="absolute top-6 right-6 z-20 flex gap-3">
          <button 
            onClick={handleShare}
            className="p-2.5 rounded-full bg-black/40 border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all backdrop-blur-md group relative"
            title="Copy link"
          >
            {copied ? <Check size={20} className="text-green-400" /> : <Share2 size={20} />}
            {copied && (
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap">
                Link Copied!
              </span>
            )}
          </button>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/40 border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all backdrop-blur-md group"
          >
            <X size={20} className="transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar">
          {/* Hero Image */}
          <div className="relative h-[40vh] min-h-[300px] w-full">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/20 to-transparent" />
          </div>

          <div className="p-8 md:p-14 -mt-20 relative z-10">
            {/* Meta */}
            <div className="flex items-center gap-6 text-sm text-accent font-medium mb-6 bg-accent/10 w-fit px-4 py-2 rounded-full border border-accent/20">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{blog.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{blog.time}</span>
              </div>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
              {blog.title}
            </h2>

            <div className="prose prose-invert max-w-none">
              <p className="text-xl text-foreground/90 leading-relaxed mb-8 font-medium italic border-l-4 border-accent pl-6 py-2 bg-accent/5 rounded-r-xl">
                {blog.excerpt}
              </p>

              <div className="text-lg text-muted leading-relaxed space-y-6">
                {/* For demonstration, splitting the long content into paragraphs if it exists */}
                {blog.content.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BlogModal;
