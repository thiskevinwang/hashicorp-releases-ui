module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      boxShadow: ["dark"],
    },
    boxShadow: {
      DEFAULT: "0 5px 10px rgba(0,0,0,0.12)",
      dark: "0 0 0 1px #333",
      none: "none",
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
