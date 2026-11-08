/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy beige scale (kept for compatibility)
        beige: {
          50: '#FFFCF8',
          100: '#F5F0E6',
          200: '#EDE5D5',
          300: '#E0D3BC',
          400: '#C8B89C',
          500: '#AC9774',
        },
        warm: {
          surface: '#FAF6EF',       // Sidebar / secondary surface
          surfaceCard: '#FFFCF8',   // Card backgrounds
          border: '#E8DED0',        // Primary border
          borderMuted: '#DDD5C7',   // Muted border
        },
        // Espresso — primary dark brand color
        espresso: {
          DEFAULT: '#302015',
          dark: '#1A0F08',
          light: '#4A3020',
        },
        // Refined brown palette
        softbrown: {
          DEFAULT: '#78614B',
          dark: '#5A4435',
          light: '#9A7D63',
          muted: '#786F65',
        },
        // Gold accent system
        gold: {
          muted: '#C29B48',
          hover: '#D4AC52',
          light: '#E8D5AC',
          pale: '#FAF3E0',
        },
        // Charcoal text palette
        charcoal: {
          900: '#30251C',   // Primary text (warm-toned)
          800: '#3D3028',
          700: '#4F4036',
          600: '#66554A',
          500: '#786F65',   // Secondary text
          400: '#9E948B',
          300: '#C4BAB2',
        },
        // Warm neutrals
        parchment: '#FAF6EF',
        cream: '#FFFCF8',
        canvas: '#F5F0E6',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          'Newsreader',
          'Merriweather',
          'Georgia',
          'serif',
        ],
      },
      boxShadow: {
        'warm-sm': '0 2px 3px rgba(107, 70, 30, 0.10)',
        'warm': '0 10px 28px -12px rgba(107, 70, 30, 0.22), 0 2px 4px rgba(107, 70, 30, 0.04)',
        'warm-md': '0 4px 14px -2px rgba(44, 39, 36, 0.08), 0 2px 6px -2px rgba(44, 39, 36, 0.04)',
        'warm-lg': '0 10px 25px -3px rgba(44, 39, 36, 0.09), 0 4px 10px -3px rgba(44, 39, 36, 0.05)',
      }
    },
  },
  plugins: [],
}
