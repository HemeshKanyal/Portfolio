import React, { useEffect, useRef } from 'react';

// Fixed WebGL backdrop. three.js is loaded lazily so it never blocks first paint;
// if WebGL isn't available the static nebula gradient below is all that shows.
const CosmosBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let dispose;
    let cancelled = false;

    import('../three/cosmos')
      .then(({ createCosmos }) => {
        if (cancelled || !canvasRef.current) return;
        dispose = createCosmos(canvasRef.current);
      })
      .catch((err) => console.warn('Cosmos background disabled:', err));

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,rgba(124,140,255,0.07),transparent_55%),radial-gradient(ellipse_at_15%_85%,rgba(242,196,109,0.04),transparent_50%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default CosmosBackground;
