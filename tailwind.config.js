/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep space: near-black with a faint blue tint, softer on the eyes than pure black
        background: "#05060b",
        surface: "#0c0e18",
        // Warm starlight instead of pure white — less glare for long reading
        foreground: "#ece8df",
        muted: "#8b8fa3",
        // Stellar gold. Under the difference-blend cursor it inverts to deep cosmic blue (#0d3b92)
        accent: {
          DEFAULT: "#f2c46d",
          hover: "#f7d693",
        },
        // Cool nebula tone, used sparingly (particles, small highlights)
        nebula: "#7c8cff",
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'scroll-cue': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(200%)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'marquee-reverse': 'marquee 48s linear infinite reverse',
        'scroll-cue': 'scroll-cue 1.8s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
