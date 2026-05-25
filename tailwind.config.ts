import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-jost)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      colors: {
        bg:      '#F7FAF8',
        bg2:     '#FFFFFF',
        bg3:     '#EEF5F1',
        card:    '#FFFFFF',
        card2:   '#F2F8F5',
        border:  '#D6E8DF',
        border2: '#B8D9C8',

        ink:  '#0F2419',
        ink2: '#2D5040',
        ink3: '#5A7A6A',
        ink4: '#8AABA0',
        ink5: '#B8D0C8',

        green: {
          primary: '#059669',
          dark:    '#047857',
          deeper:  '#065F46',
          light:   '#ECFDF5',
          mid:     '#D1FAE5',
        },
        emerald:  '#10B981',
        rose:     '#DC2626',
        gold:     '#D97706',
      },
      borderRadius: {
        DEFAULT: '16px',
        sm: '12px',
        xs: '10px',
      },
      boxShadow: {
        card:  '0 4px 24px rgba(0,80,40,0.08)',
        hover: '0 8px 40px rgba(0,80,40,0.14)',
        pink:  '0 0 40px rgba(5,150,105,0.12)',
      },
      width:  { sidebar: '256px', detail: '400px' },
      keyframes: {
        spin:    { to: { transform: 'rotate(360deg)' } },
        fadeIn:  { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        skPulse: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.5' } },
      },
      animation: {
        spin:    'spin .6s linear infinite',
        fadeIn:  'fadeIn .35s ease both',
        slideIn: 'slideIn .35s cubic-bezier(.4,0,.2,1)',
        skPulse: 'skPulse 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
