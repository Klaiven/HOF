/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a4fa3',
        'primary-dark': '#083b79',
        'bg-light': '#f5f7fa',
        'text-dark': '#1f2933',
        'text-muted': '#5f6b7a',
      },
    },
  },
  plugins: [],
}