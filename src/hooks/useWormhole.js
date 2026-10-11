import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Matches WORMHOLE_IN in three/cosmos.js: change pages at the deepest point of the dive
const DIVE_MS = 950;

// Returns an onClick for internal links that flies through a wormhole before navigating.
// Modified clicks (new tab etc.) and reduced-motion visitors get a plain link.
export function useWormhole(to) {
  const navigate = useNavigate();
  return useCallback(
    (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      e.preventDefault();
      const root = document.documentElement;
      if (root.classList.contains('warping')) return;
      window.dispatchEvent(new Event('cosmos:wormhole'));
      root.classList.add('warping');
      setTimeout(() => {
        navigate(to);
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Let the new page mount before it fades back in
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('warping')));
      }, DIVE_MS);
    },
    [navigate, to]
  );
}
