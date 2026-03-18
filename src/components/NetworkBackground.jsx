import React, { useEffect, useRef } from 'react';

const NetworkBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    // Sphere config — right side
    let sphereCx = width * 0.65;
    let sphereCy = height * 0.45;
    let sphereRadius = Math.min(width, height) * 0.32;

    // Counts — ultra dense ~12000 total particles
    const sphereParticleCount = Math.max(300, Math.min(Math.floor((width * height) / 2000), 500));
    const ambientParticleCount = Math.max(2000, Math.min(Math.floor((width * height) / 350), 5000));
    const bgStarCount = Math.max(2000, Math.min(Math.floor((width * height) / 350), 5000));
    const connectionDistance = width > 768 ? 100 : 70;

    let mouse = { x: sphereCx, y: sphereCy, targetX: sphereCx, targetY: sphereCy };
    let scrollY = 0;

    let sphereParticles = [];
    let ambientParticles = [];
    let bgStars = [];

    // ─── Sphere particles (shell-concentrated) ───
    function createSphereParticle() {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const isShell = Math.random() < 0.85;
      const r = isShell
        ? sphereRadius * (0.85 + Math.random() * 0.15)
        : sphereRadius * Math.cbrt(Math.random()) * 0.85;

      return {
        baseX: sphereCx + r * Math.sin(phi) * Math.cos(theta),
        baseY: sphereCy + r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        x: 0, y: 0,
        size: Math.random() * 2.2 + 0.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.4,
        isShell,
      };
    }

    // ─── Ambient particles with gravity distribution ───
    function createAmbientParticle() {
      const angle = Math.random() * Math.PI * 2;
      // Very strong gravity bias: pow(0.2) heavily clusters near the sphere
      const raw = Math.pow(Math.random(), 0.2);
      const maxDist = Math.max(width, height) * 0.9;
      const minDist = sphereRadius * 1.02;
      const dist = minDist + raw * (maxDist - minDist);

      const px = sphereCx + Math.cos(angle) * dist;
      const py = sphereCy + Math.sin(angle) * dist;
      const x = Math.max(-50, Math.min(width + 50, px));
      const y = Math.max(-50, Math.min(height + 50, py));

      const proximity = 1 - Math.min((dist - minDist) / (maxDist - minDist), 1);
      const baseSize = 0.5 + proximity * 3.0 + Math.random() * 1.0;
      const baseAlpha = 0.1 + proximity * 0.5;

      return {
        homeX: x, homeY: y, x, y,
        vx: 0, vy: 0,
        size: baseSize, baseAlpha, proximity,
        phase: Math.random() * Math.PI * 2,
        driftSpeed: 0.2 + Math.random() * 0.8,
        mouseReactivity: 0.3 + proximity * 0.7,
      };
    }

    // ─── Background stars (uniform, fill entire screen like galaxy dust) ───
    function createBgStar() {
      // 30% white/silver stars, 70% violet-tinted stars
      const isWhite = Math.random() < 0.3;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.0 + 0.3,
        baseAlpha: Math.random() * 0.35 + 0.05,
        phase: Math.random() * Math.PI * 2,
        blinkSpeed: 0.3 + Math.random() * 1.5,
        isWhite,
      };
    }

    for (let i = 0; i < sphereParticleCount; i++) sphereParticles.push(createSphereParticle());
    for (let i = 0; i < ambientParticleCount; i++) ambientParticles.push(createAmbientParticle());
    for (let i = 0; i < bgStarCount; i++) bgStars.push(createBgStar());

    let animationFrameId, smoothMouseFrameId;

    const animate = (time) => {
      ctx.clearRect(0, 0, width, height);
      const t = time * 0.0003;

      // ─── Background stars (uniform starfield) ───
      for (const s of bgStars) {
        const blink = 0.5 + 0.5 * Math.sin(t * 2 * s.blinkSpeed + s.phase);
        const alpha = s.baseAlpha * blink;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.isWhite
          ? `rgba(210, 200, 240, ${alpha})`
          : `rgba(139, 92, 246, ${alpha})`;
        ctx.fill();
      }

      // ─── Sphere glow halo ───
      const grad = ctx.createRadialGradient(sphereCx, sphereCy, sphereRadius * 0.2, sphereCx, sphereCy, sphereRadius * 1.6);
      grad.addColorStop(0, 'rgba(139, 92, 246, 0.07)');
      grad.addColorStop(0.4, 'rgba(139, 92, 246, 0.03)');
      grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // ─── Ambient particles (interactive, gravity-distributed) ───
      for (const p of ambientParticles) {
        // Subtle drift around home position
        const driftX = Math.sin(t * p.driftSpeed + p.phase) * (6 + p.proximity * 10);
        const driftY = Math.cos(t * p.driftSpeed * 0.7 + p.phase) * (6 + p.proximity * 10);

        // Mouse interaction: particles push away from cursor
        const dmx = p.homeX + driftX - mouse.x;
        const dmy = p.homeY + driftY - mouse.y;
        const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy) || 1;
        const mouseInfluenceRadius = 200;
        let pushX = 0, pushY = 0;

        if (mouseDist < mouseInfluenceRadius) {
          const force = (1 - mouseDist / mouseInfluenceRadius) * 30 * p.mouseReactivity;
          pushX = (dmx / mouseDist) * force;
          pushY = (dmy / mouseDist) * force;
        }

        // Smooth velocity with damping
        p.vx += (pushX - p.vx) * 0.08;
        p.vy += (pushY - p.vy) * 0.08;

        p.x = p.homeX + driftX + p.vx;
        p.y = p.homeY + driftY + p.vy;

        // Twinkle effect
        const twinkle = 0.6 + 0.4 * Math.sin(t * 2 * p.driftSpeed + p.phase);
        const alpha = p.baseAlpha * twinkle;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
        ctx.fill();

        // Glow for closer particles
        if (p.proximity > 0.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139, 92, 246, ${(p.proximity - 0.5) * 0.08 * twinkle})`;
          ctx.fill();
        }
      }

      // ─── Sphere particles ───
      for (let i = 0; i < sphereParticles.length; i++) {
        const p = sphereParticles[i];
        const drift = t * p.speed;
        p.x = p.baseX + Math.sin(drift + p.phase) * 8;
        p.y = p.baseY + Math.cos(drift + p.phase * 1.3) * 8;

        // Mouse parallax
        p.x += (mouse.x - sphereCx) * (p.z / sphereRadius) * 0.12;
        p.y += (mouse.y - sphereCy) * (p.z / sphereRadius) * 0.12;

        // Scroll parallax
        p.y -= scrollY * (p.z / sphereRadius) * 0.06;

        const depthFactor = (p.z + sphereRadius) / (2 * sphereRadius);
        const actualSize = p.size * (0.5 + depthFactor * 0.7);
        const baseAlpha = p.isShell ? 0.55 : 0.3;
        const alpha = baseAlpha + depthFactor * 0.4;

        // Particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, actualSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
        ctx.fill();

        // Glow on front particles
        if (depthFactor > 0.55) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, actualSize * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139, 92, 246, ${(depthFactor - 0.55) * 0.2})`;
          ctx.fill();
        }

        // Bright white highlight on closest particles
        if (depthFactor > 0.8 && p.isShell) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, actualSize * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 180, 255, ${(depthFactor - 0.8) * 1.5})`;
          ctx.fill();
        }

        // Connections
        for (let j = i + 1; j < sphereParticles.length; j++) {
          const dx = p.x - sphereParticles[j].x;
          const dy = p.y - sphereParticles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < connectionDistance * connectionDistance) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 * (1 - dist / connectionDistance)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(sphereParticles[j].x, sphereParticles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // ─── Event handlers ───
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      sphereCx = width * 0.65;
      sphereCy = height * 0.45;
      sphereRadius = Math.min(width, height) * 0.32;

      sphereParticles.forEach(p => {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const isShell = Math.random() < 0.85;
        const r = isShell
          ? sphereRadius * (0.85 + Math.random() * 0.15)
          : sphereRadius * Math.cbrt(Math.random()) * 0.85;
        p.baseX = sphereCx + r * Math.sin(phi) * Math.cos(theta);
        p.baseY = sphereCy + r * Math.sin(phi) * Math.sin(theta);
        p.z = r * Math.cos(phi);
        p.isShell = isShell;
      });

      // Redistribute ambient particles with gravity
      const maxDist = Math.max(width, height) * 0.9;
      const minDist = sphereRadius * 1.02;
      ambientParticles.forEach(p => {
        const angle = Math.random() * Math.PI * 2;
        const raw = Math.pow(Math.random(), 0.2);
        const dist = minDist + raw * (maxDist - minDist);
        const px = Math.max(-50, Math.min(width + 50, sphereCx + Math.cos(angle) * dist));
        const py = Math.max(-50, Math.min(height + 50, sphereCy + Math.sin(angle) * dist));
        const proximity = 1 - Math.min((dist - minDist) / (maxDist - minDist), 1);
        p.homeX = px; p.homeY = py; p.x = px; p.y = py;
        p.proximity = proximity;
        p.baseAlpha = 0.1 + proximity * 0.5;
        p.size = 0.3 + proximity * 2.2 + Math.random() * 0.6;
        p.mouseReactivity = 0.3 + proximity * 0.7;
      });

      // Redistribute background stars
      bgStars.forEach(s => {
        s.x = Math.random() * width;
        s.y = Math.random() * height;
      });
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleScroll = () => { scrollY = window.scrollY; };

    const smoothMouse = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;
      smoothMouseFrameId = requestAnimationFrame(smoothMouse);
    };
    smoothMouseFrameId = requestAnimationFrame(smoothMouse);

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
      cancelAnimationFrame(smoothMouseFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default NetworkBackground;
