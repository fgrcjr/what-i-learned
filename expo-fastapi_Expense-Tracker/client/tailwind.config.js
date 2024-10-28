/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./{app,components}/**/*.{js,jsx,ts,tsx}", 
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#f8f8f8', 
      },
    },
    fontFamily: {
      rblack: ["Raleway-Black", "sans-serif"],
      rbold: ["Raleway-Bold", "sans-serif"],
      rregular: ["Raleway-Regular", "sans-serif"],
      rsemibold: ["Raleway-SemiBold", "sans-serif"],
    }
  },
  plugins: [],
}