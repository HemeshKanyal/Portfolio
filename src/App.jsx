import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CosmosBackground from './components/CosmosBackground';
import BlogButton from './components/BlogButton';
import SideNav from './components/SideNav';
import Hero from './components/Hero';
import About from './components/About';
import CustomCursor from './components/CustomCursor';
import Discovery from './components/Discovery';
import Projects from './components/Projects';
import Philosophy from './components/Philosophy';
import CurrentWork from './components/CurrentWork';
import TechStack from './components/TechStack';
import Contact from './components/Contact';
import EventHorizon from './components/EventHorizon';
import GravityEgg from './components/GravityEgg';
import SoundToggle from './components/SoundToggle';
import BlogPage from './components/BlogPage';

const Home = () => (
  <main className="relative w-full max-w-6xl mx-auto px-6 md:px-12 flex flex-col pb-6 gap-16 md:gap-32">
    <Hero />
    <About />
    <Discovery />
    <Projects />
    <Philosophy />
    <CurrentWork />
    <TechStack />
    <EventHorizon />
    <Contact />
  </main>
);

function App() {
  return (
    <div className="relative min-h-screen w-full bg-background font-sans text-foreground overflow-x-clip">
      <CustomCursor />
      <CosmosBackground />

      <Routes>
        <Route path="/" element={
          <>
            <BlogButton />
            <SideNav />
            <GravityEgg />
            <Home />
          </>
        } />
        <Route path="/blog/*" element={
          <>
            <div className="fixed top-6 right-6 md:top-8 md:right-8 z-50">
              <SoundToggle />
            </div>
            <Routes>
              <Route index element={<BlogPage />} />
              <Route path=":slug" element={<BlogPage />} />
            </Routes>
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
