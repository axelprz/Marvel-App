// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,css,scss,sass,less,styl}", // Cubre todos los archivos relevantes en src
  ],
  theme: {
    extend: {
      colors: {
        'marvel-red': '#ED1D24',
        'marvel-dark': '#151515',
        'marvel-charcoal': '#202020',
        'marvel-light-gray': '#EAEAEA',
        'marvel-medium-gray': '#393939',
        'marvel-accent-blue': '#007AFF',
        'marvel-accent-green': '#28a745',
        'marvel-border-gray': '#4A4A4A',
      },
      fontFamily: {
        // Si decides usar una fuente personalizada, la configuras aquí. Ejemplo:
        // sans: ['Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in-out': 'fadeInOut 4s ease-in-out forwards',
        'subtle-pulse': 'subtlePulse 2s infinite ease-in-out',
        'slide-in-down-fast': 'slideInDownFast 0.3s ease-out forwards',
        'button-press': 'buttonPress 0.2s ease-out',
      },
      keyframes: {
        fadeInOut: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '10%': { opacity: '1', transform: 'translateY(0)' },
          '90%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-20px)' },
        },
        subtlePulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(237, 29, 36, 0.4)' },
          '50%': { transform: 'scale(1.03)', boxShadow: '0 0 0 8px rgba(237, 29, 36, 0)' },
        },
        slideInDownFast: {
          '0%': { opacity: '0', transform: 'translateY(-15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        buttonPress: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      boxShadow: {
        'marvel-glow-red': '0 0 15px 0px rgba(237, 29, 36, 0.5)',
        'marvel-glow-blue': '0 0 15px 0px rgba(0, 122, 255, 0.5)',
        'marvel-glow-green': '0 0 15px 0px rgba(40, 167, 69, 0.5)',
      }
    },
  },
  plugins: [
    // Aquí puedes añadir plugins si los necesitas más adelante, por ejemplo:
    // require('@tailwindcss/forms'),
  ],
}