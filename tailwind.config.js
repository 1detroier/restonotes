/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: '#ff6b35',
        secondary: '#f7931e',
        dark: '#2d3436'
      }
    }
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        restolight: {
          'primary': '#ff6b35',
          'secondary': '#f7931e',
          'accent': '#37cdbe',
          'neutral': '#2d3436',
          'base-100': '#ffffff',
          'base-200': '#f5f5f5',
          'base-300': '#e0e0e0',
          'info': '#3abff8',
          'success': '#36d399',
          'warning': '#fbbd23',
          'error': '#f87272'
        },
        restodark: {
          'primary': '#ff6b35',
          'secondary': '#f7931e',
          'accent': '#37cdbe',
          'neutral': '#1a1a2e',
          'base-100': '#2d3436',
          'base-200': '#1e272e',
          'base-300': '#0d1117',
          'info': '#3abff8',
          'success': '#36d399',
          'warning': '#fbbd23',
          'error': '#f87272'
        }
      }
    ]
  }
}
