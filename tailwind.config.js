/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: '#f5f1e8',
        primary: '#1abc9c',
        secondary: '#0f7a94',
        night: '#1b3a4b',
      },
    },
  },
  presets: [require('nativewind/preset')],
  plugins: [],
};
