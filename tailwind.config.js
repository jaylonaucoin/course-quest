/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./src/**/*.{js,jsx,ts,tsx}', './App.js'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#0D6D30',
        secondary: '#418B4A',
        tertiary: '#6BA368',
        quaternary: '#515B3A',
        dark: '#353D2F',
        light: '#9CFC97',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        link: '#007bff',
        disabled: '#6c757d',
        text: '#333',
        background: '#fff',
        border: '#ced4da',
        icon: '#333',
      },
    },
  },
  plugins: [],
};
