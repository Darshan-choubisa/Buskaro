/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0d1b2a",
        accent: "#00c9a7",
        dark: "#0d1b2a",
      },
      fontFamily: {
        sans: ["Sora", "sans-serif"],
      },
    },
  },
  plugins: [],
}
