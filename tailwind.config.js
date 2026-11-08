/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: 'rgb(var(--color-FFFFFF) / <alpha-value>)',
        // Legacy beige scale (kept for compatibility)
        beige: {
          50: 'rgb(var(--color-FFFCF8) / <alpha-value>)',
          100: 'rgb(var(--color-F5F0E6) / <alpha-value>)',
          200: 'rgb(var(--color-EDE5D5) / <alpha-value>)',
          300: 'rgb(var(--color-E0D3BC) / <alpha-value>)',
          400: 'rgb(var(--color-C8B89C) / <alpha-value>)',
          500: 'rgb(var(--color-AC9774) / <alpha-value>)',
        },
        warm: {
          surface: 'rgb(var(--color-FAF6EF) / <alpha-value>)',       // Sidebar / secondary surface
          surfaceCard: 'rgb(var(--color-FFFCF8) / <alpha-value>)',   // Card backgrounds
          border: 'rgb(var(--color-E8DED0) / <alpha-value>)',        // Primary border
          borderMuted: 'rgb(var(--color-DDD5C7) / <alpha-value>)',   // Muted border
        },
        // Espresso — primary dark brand color
        espresso: {
          DEFAULT: 'rgb(var(--color-302015) / <alpha-value>)',
          dark: 'rgb(var(--color-1A0F08) / <alpha-value>)',
          light: 'rgb(var(--color-4A3020) / <alpha-value>)',
        },
        // Refined brown palette
        softbrown: {
          DEFAULT: 'rgb(var(--color-78614B) / <alpha-value>)',
          dark: 'rgb(var(--color-5A4435) / <alpha-value>)',
          light: 'rgb(var(--color-9A7D63) / <alpha-value>)',
          muted: 'rgb(var(--color-786F65) / <alpha-value>)',
        },
        // Gold accent system
        gold: {
          muted: 'rgb(var(--color-C29B48) / <alpha-value>)',
          hover: 'rgb(var(--color-D4AC52) / <alpha-value>)',
          light: 'rgb(var(--color-E8D5AC) / <alpha-value>)',
          pale: 'rgb(var(--color-FAF3E0) / <alpha-value>)',
        },
        // Charcoal text palette
        charcoal: {
          900: 'rgb(var(--color-30251C) / <alpha-value>)',   // Primary text (warm-toned)
          800: 'rgb(var(--color-3D3028) / <alpha-value>)',
          700: 'rgb(var(--color-4F4036) / <alpha-value>)',
          600: 'rgb(var(--color-66554A) / <alpha-value>)',
          500: 'rgb(var(--color-786F65) / <alpha-value>)',   // Secondary text
          400: 'rgb(var(--color-9E948B) / <alpha-value>)',
          300: 'rgb(var(--color-C4BAB2) / <alpha-value>)',
        },
        // Warm neutrals
        parchment: 'rgb(var(--color-FAF6EF) / <alpha-value>)',
        cream: 'rgb(var(--color-FFFCF8) / <alpha-value>)',
        canvas: 'rgb(var(--color-F5F0E6) / <alpha-value>)',
      },
      backgroundColor: { charcoal: { 900: '#30251C', 800: '#3D3028' } },
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
