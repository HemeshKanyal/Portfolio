import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, X, Share2, Check, ExternalLink, Play } from 'lucide-react';

const renderFormattedContent = (content) => {
  if (!content) return null;

  const lines = content.split('\n');
  const blocks = [];
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'p', text: currentParagraph.join('\n') });
      currentParagraph = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      return;
    }

    const ytMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      flushParagraph();
      blocks.push({ type: 'youtube', videoId: ytMatch[1], url: trimmed });
      return;
    }

    if (trimmed.startsWith('“') || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      flushParagraph();
      blocks.push({ type: 'quote', text: trimmed });
      return;
    }

    if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('→')) {
      flushParagraph();
      blocks.push({ type: 'list_item', text: trimmed });
      return;
    }

    if (trimmed === 'Human:' || trimmed === 'AI:') {
      flushParagraph();
      blocks.push({ type: 'role_header', text: trimmed });
      return;
    }

    currentParagraph.push(trimmed);
  });

  flushParagraph();

  return blocks.map((block, index) => {
    if (block.type === 'youtube') {
      return (
        <div key={index} className="my-8 overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black/60 backdrop-blur-md">
          <div className="relative aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${block.videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
          <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
              <Play size={16} className="text-accent fill-accent" />
              <span>Watch full discussion video</span>
            </div>
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-4 py-2 rounded-full bg-accent text-white hover:bg-accent/80 transition-colors flex items-center gap-1.5 shadow-lg shadow-accent/20"
            >
              Open on YouTube <ExternalLink size={12} />
            </a>
          </div>
        </div>
      );
    }

    if (block.type === 'quote') {
      return (
        <blockquote key={index} className="my-6 pl-6 border-l-4 border-accent text-white/90 text-xl font-medium italic bg-accent/5 py-4 px-6 rounded-r-2xl border-y border-r border-white/5">
          {block.text}
        </blockquote>
      );
    }

    if (block.type === 'role_header') {
      return (
        <h4 key={index} className="text-sm font-bold tracking-widest text-accent uppercase mt-6 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          {block.text}
        </h4>
      );
    }

    if (block.type === 'list_item') {
      return (
        <div key={index} className="flex items-start gap-3 my-2 pl-2 text-foreground/90 font-medium">
          <span className="text-accent font-bold text-base leading-snug mt-0.5">
            {block.text.startsWith('→') ? '→' : '•'}
          </span>
          <span className="text-base text-foreground/90 leading-relaxed">
            {block.text.replace(/^[•\->]\s*/, '')}
          </span>
        </div>
      );
    }

    return (
      <p key={index} className="text-lg text-muted leading-relaxed mb-6 font-normal">
        {block.text}
      </p>
    );
  });
};

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

              <div className="text-lg text-muted leading-relaxed space-y-2">
                {renderFormattedContent(blog.content)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BlogModal;
