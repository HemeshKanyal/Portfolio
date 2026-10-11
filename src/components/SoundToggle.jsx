import React, { useState } from 'react';

// One drone for the whole app, so the sound carries on through the wormhole between pages.
// Off by default; it's only created on the first click (browsers need a gesture for audio).
let drone = null;
let playing = false;

const SoundToggle = () => {
  const [on, setOn] = useState(playing);

  const toggle = async () => {
    if (!drone) {
      const { createDrone } = await import('../audio/drone');
      drone = createDrone();
    }
    if (on) drone.stop();
    else await drone.start();
    playing = !on;
    setOn(playing);
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Mute ambient sound' : 'Play ambient sound'}
      className={`flex items-center justify-center gap-[3px] w-11 h-11 rounded-full border bg-background/50 backdrop-blur-md shadow-xl shadow-black/20 transition-colors ${
        on ? 'border-accent/60 text-accent' : 'border-foreground/10 text-muted hover:text-foreground hover:border-foreground/30'
      }`}
    >
      {/* Equaliser bars: moving when on, flat when off */}
      {[0.9, 0.5, 1, 0.65].map((h, i) => (
        <span
          key={i}
          className={`w-[2px] rounded-full bg-current origin-center ${on ? 'animate-eq motion-reduce:animate-none' : ''}`}
          style={{ height: on ? `${h * 16}px` : '3px', animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </button>
  );
};

export default SoundToggle;
