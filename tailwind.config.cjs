module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6C5CE7',
        accent: '#00BFA6'
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 600ms ease-out both',
        'fade-in-left': 'fadeInLeft 600ms ease-out both',
        'fade-in': 'fadeIn 500ms ease-out both'
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: [],
  safelist: [
    // common delay steps used by the stagger logic
    'delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300', 'delay-400', 'delay-500', 'delay-700', 'delay-900'
  ],
}
