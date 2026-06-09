import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green:   '#44DC98',
          dark:    '#232323',
          black:   '#000000',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted:   '#F5FAF7',
          card:    '#1A1A1A',
        },
        text: {
          primary:   '#232323',
          muted:     '#8A8A8A',
          inverted:  '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
