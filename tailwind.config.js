/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F6E56',
          light: '#17A27D',
          dark: '#094F3D',
        },
        accent: {
          DEFAULT: '#EF9F27',
          light: '#F5B85F',
          dark: '#C77F19',
        },
        background: {
          DEFAULT: '#FAFAF8',
          dark: '#121212',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
