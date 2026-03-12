import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        falcon: {
          sage: '#7A9B76',
          sageLight: '#9BB597',
          sageDark: '#5A7B56',
          cream: '#F8F6F0',
          warm: '#F5EDE4',
          sand: '#E8E0D5',
          earth: '#8B7355',
          sky: '#A8D4E6',
          skyDark: '#7BB8D0',
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
