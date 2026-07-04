/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        stone: {
          50: '#F6F5F1',
          100: '#EEEBE3',
        },
        ink: {
          DEFAULT: '#14323A',
          light: '#1F4A55',
          dark: '#0B1F24',
        },
        amber: {
          DEFAULT: '#E8A33D',
          dark: '#C7862A',
        },
        okgreen: '#3F7D58',
        brick: '#C1443C',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'perforation': 'repeating-linear-gradient(to bottom, transparent 0 6px, #D8D4C8 6px 8px)',
      },
    },
  },
  plugins: [],
};
