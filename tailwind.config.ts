import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        red: {
          400: '#f87171',
          500: '#ef4444',
        },
        cyan: {
          400: '#22d3ee',
        },
        gray: {
          800: '#1f2937',
          900: '#111827',
          700: '#374151',
          400: '#9ca3af',
          300: '#d1d5db',
          200: '#e5e7eb',
        }
      },
    },
  },
  plugins: [],
}
export default config
