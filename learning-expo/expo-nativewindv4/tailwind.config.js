/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    './App.{js,jsx,ts,tsx}',       // Main app file
    './components/**/*.{js,jsx,ts,tsx}', // Include all files in the components folder
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
   
  },
  plugins: [],
  
}