/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4CAF50",
        secondary: "#FF9800",
        accent: "#2196F3",
        tealAccent: "#14B8A6",
        purpleAccent: "#A855F7",
        coral: "#FF6B6B",
        warmBg: "#FFF8F1",
        warmCard: "#FFF3E0",
      },
      boxShadow: {
        glow: '0 18px 40px rgba(15, 23, 42, 0.12)',
        soft: '0 6px 18px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
