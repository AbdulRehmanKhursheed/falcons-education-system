import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '375px',
      },
      colors: {
        falcon: {
          sage:      '#00a3fe',   // primary blue (logo blue)
          sageLight: '#5bc4ff',   // lighter blue for soft accents
          sageDark:  '#003f72',   // dark navy — headings, active states
          cream:     '#f0f8ff',   // alice-blue — light section backgrounds
          warm:      '#e6f4ff',   // softer light blue — alternating sections
          sand:      '#b8ddf7',   // light blue for borders and dividers
          earth:     '#1a4a72',   // dark navy — body text
          sky:       '#d0eeff',   // very light blue — decorative blobs
          skyDark:   '#9dd4f5',   // slightly deeper decorative
        },
      },
      fontFamily: {
        display: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
        body: ['var(--font-quicksand)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
