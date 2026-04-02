/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vistaprint's proprietary "Swan" Design System Colors
        swan: {
          blue: '#009ceb',           // Primary buttons and active states
          'blue-hover': '#0083d5',
          bg: '#f8f8f8',             // App background
          surface: '#f2f2f4',        // Canvas area background
          border: '#e6e6e6',         // Standard panel borders
          text: '#333333',           // Standard text
          dark: '#151515',           // Mobile toolbars
          safe: '#00a86d',           // Safety area green lines
          danger: '#d24345',         // Error states
          warning: '#f07000'         // Low resolution warnings
        }
      },
      boxShadow: {
        // Vistaprint's specific panel drop shadows
        'vp-floating': '0 5px 10px rgba(0,0,0,.1)',
        'vp-header': '0 2px 10px rgba(0,17,26,.12)',
        'vp-modal': '0 4px 20px rgba(0,0,0,.1)'
      }
    },
  },
  plugins: [],
}