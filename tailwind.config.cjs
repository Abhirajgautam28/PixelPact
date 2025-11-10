module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Material-inspired indigo primary palette
        primary: {
          50: '#e8eaf6',
          100: '#c5cae9',
          200: '#9fa8da',
          300: '#7986cb',
          400: '#5c6bc0',
          500: '#3f51b5',
          600: '#3949ab',
          700: '#303f9f',
          800: '#283593',
          900: '#1a237e',
          DEFAULT: '#3f51b5'
        },
        accent: '#00BFA6',
        surface: '#ffffff',
        'on-surface': '#0f172a',
        background: '#F6FBFF'
      },
      // Material-like elevation shadows mapped to boxShadow utilities
      boxShadow: {
        'elevation-1': '0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)',
        'elevation-2': '0 6px 20px rgba(16,24,40,0.08)'
      },
      // Provide a small set of design tokens for typography / spacing
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
        heading: ['Playfair Display', 'Georgia', 'serif']
      },
      fontSize: {
        'xs': '.75rem',
        'sm': '.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
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
