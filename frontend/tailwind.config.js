/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#1F3D33",
          light: "#2E5C4C",
          dark: "#14281F",
        },
        brass: {
          DEFAULT: "#B8863B",
          light: "#D4AA66",
          dark: "#8F6626",
        },
        paper: {
          DEFAULT: "#F6F4EE",
          dim: "#EDE9DD",
        },
        ink: {
          DEFAULT: "#23261F",
          light: "#565A4F",
        },
        stamp: {
          red: "#A6433A",
          green: "#2F6B4F",
          amber: "#B8863B",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
