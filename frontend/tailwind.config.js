/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // OVERRIDE GRAY WITH SLATE (Softer on eyes)
        gray: {
          50: '#f8fafc',  // Soft background
          100: '#f1f5f9', // Soft secondary bg
          200: '#e2e8f0', // Soft borders
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569', // Subtext
          700: '#334155',
          800: '#1e293b', // Main text
          900: '#0f172a', // Headings
          950: '#020617', // Dark mode bg
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        risk: {
          high: '#dc2626',
          moderate: '#d97706',
          low: '#059669',
        }
      }
    },
  },
  plugins: [],
}