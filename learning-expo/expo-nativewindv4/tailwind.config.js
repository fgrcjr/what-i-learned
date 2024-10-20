/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
    colors: {
      // Create a custom color that uses a CSS custom value
      primary: "rgb(var(--color-primary) / <alpha-value>)",
    },
    
  },
  plugins: [({ addBase }) => addBase({ ":root": { "--color-primary": "255 0 0" } }),],
  
}