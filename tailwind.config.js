/**
 * Tailwind CSS configuration for the Wav DCA Tracker.
 *
 * The content paths ensure Tailwind scans all pages and components
 * for class usage so only the styles you use end up in the final build.
 */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2db6f5',
          DEFAULT: '#0e7490',
          dark: '#075985'
        },
        secondary: {
          light: '#5eead4',
          DEFAULT: '#10b981',
          dark: '#059669'
        }
      }
    }
  },
  plugins: []
};