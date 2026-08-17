/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 自定义品牌色
        brand: {
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#bbdcfd',
          300: '#7fbffc',
          400: '#3a9ef9',
          500: '#1283e8',
          600: '#0568c4',
          700: '#0452a0',
          800: '#064584',
          900: '#0a3a6e'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'Menlo', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      transitionDuration: {
        DEFAULT: '200ms'
      }
    }
  },
  plugins: []
};
