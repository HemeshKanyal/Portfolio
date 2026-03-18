import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NetworkBackground from './components/NetworkBackground';
import Hero from './components/Hero';
import About from './components/About';
import CustomCursor from './components/CustomCursor';
import Discovery from './components/Discovery';
import Projects from './components/Projects';
import Philosophy from './components/Philosophy';
import CurrentWork from './components/CurrentWork';
import TechStack from './components/TechStack';
import Contact from './components/Contact';
import BlogButton from './components/BlogButton';
import BlogPage from './components/BlogPage';

const Home = () => (
  <main className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 flex flex-col pb-6 gap-16 md:gap-32">
    <Hero />
    <About />
    <Discovery />
    <Projects />
    <Philosophy />
    <CurrentWork />
    <TechStack />
    <Contact />
  </main>
);

function App() {
  return (
    <div className="relative min-h-screen w-full bg-background font-sans text-foreground overflow-x-hidden selection:bg-accent/30 selection:text-white">
      <CustomCursor />
      <NetworkBackground />
      
      <Routes>
        <Route path="/" element={
          <>
            <BlogButton />
            <Home />
          </>
        } />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPage />} />
      </Routes>
    </div>
  );
}

export default App;
