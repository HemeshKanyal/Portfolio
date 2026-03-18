import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { blogs } from '../data/blogs';
import BlogCard from './BlogCard';
import BlogModal from './BlogModal';
import NetworkBackground from './NetworkBackground';
import CustomCursor from './CustomCursor';

const BlogPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Sorting blogs to show newest at top by date
  const sortedBlogs = [...blogs].sort((a, b) => new Date(b.date) - new Date(a.date));

  useEffect(() => {
    if (slug) {
      const blog = blogs.find(b => b.slug === slug);
      if (blog) {
        setSelectedBlog(blog);
      } else {
        navigate('/blog');
      }
    } else {
      setSelectedBlog(null);
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (!slug) {
      window.scrollTo(0, 0);
    }
  }, [slug]);

  const handleCloseModal = () => {
    navigate('/blog');
  };

  const handleOpenBlog = (blog) => {
    navigate(`/blog/${blog.slug}`);
  };

  return (
    <div className="relative min-h-screen w-full bg-background font-sans text-foreground overflow-x-hidden">
      <CustomCursor />
      <NetworkBackground />
      
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 py-20 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-white/5 pb-12">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link 
                to="/" 
                className="flex items-center gap-2 text-accent font-medium mb-8 hover:opacity-80 transition-opacity"
              >
                <ArrowLeft size={18} />
                Back to Portfolio
              </Link>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
            >
              The <span className="text-accent">Journal</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-xl text-muted leading-relaxed font-medium"
            >
              Insights, experiments, and stories from the laboratory of building products.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden lg:block"
          >
            <div className="px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-muted">
              {blogs.length} Articles Published
            </div>
          </motion.div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedBlogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <BlogCard 
                blog={blog} 
                onOpen={handleOpenBlog} 
              />
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedBlog && (
            <BlogModal 
              blog={selectedBlog} 
              onClose={handleCloseModal} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default BlogPage;
