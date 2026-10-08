/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deepsea: {
          50: '#f0f6fc',
          100: '#e1ecf8',
          200: '#bad7f1',
          300: '#7cb5e6',
          400: '#3891d8',
          500: '#1774c1',
          600: '#0c5aa1',
          700: '#0a3663',
          800: '#003B73', // Main Deep Sea Blue
          900: '#0A2540', // Deep Navy / Sea Blue Header
          950: '#051324'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(10, 37, 64, 0.08), 0 2px 6px -1px rgba(10, 37, 64, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(10, 37, 64, 0.12), 0 4px 10px -2px rgba(10, 37, 64, 0.06)',
        'call-controls': '0 10px 30px -5px rgba(10, 37, 64, 0.2), 0 4px 12px -2px rgba(10, 37, 64, 0.1)'
      }
    },
  },
  plugins: [],
}
