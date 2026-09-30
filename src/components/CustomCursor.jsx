import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [isPointerDevice, setIsPointerDevice] = useState(() => window.matchMedia('(pointer: fine)').matches);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring physics for fluid movement
  const springConfig = { damping: 30, stiffness: 400, mass: 0.4 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only enable custom cursor on fine pointer devices (mouse/trackpad), bypass on touch screens
    const mediaQuery = window.matchMedia('(pointer: fine)');

    const handleMediaChange = (e) => setIsPointerDevice(e.matches);
    mediaQuery.addEventListener('change', handleMediaChange);

    if (!mediaQuery.matches) return;

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      // Grow (and invert what's underneath) only over things worth pointing at:
      // links, buttons and large headings — not every paragraph on the page.
      setIsHovering(Boolean(target.closest('a, button, input, textarea, [role="button"], h1, h2, h3')));
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseX, mouseY]);

  if (!isPointerDevice) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference bg-foreground will-change-transform"
        style={{
          left: cursorX,
          top: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovering ? 64 : 14,
          height: isHovering ? 64 : 14,
          scale: isClicked ? 0.9 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
          mass: 0.4,
          width: { duration: 0.2 },
          height: { duration: 0.2 }
        }}
      />
      
      {!isHovering && (
        <motion.div
          className="fixed top-0 left-0 w-8 h-8 border border-foreground/20 rounded-full pointer-events-none z-[9998] will-change-transform"
          style={{
            left: cursorX,
            top: cursorY,
            translateX: '-50%',
            translateY: '-50%',
          }}
          transition={{ type: 'spring', damping: 35, stiffness: 350, mass: 0.8 }}
        />
      )}
    </>
  );
};

export default CustomCursor;
