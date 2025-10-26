/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. Where to look for Tailwind classes (crucial step)
  content: [
    // This typically covers all React component files (.js, .jsx, .ts, .tsx)
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // You can define custom colors or fonts here, but we are keeping it simple.
      fontFamily: {
        // Ensuring Inter is used, matching the Canvas environment default
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  // 2. Preflight reset, recommended to use the default
  plugins: [],
}