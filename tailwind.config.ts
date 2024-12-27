import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Enables dark mode toggling via a class
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // Custom color palette for light/dark mode
        primary: {
          light: "#4F46E5",
          dark: "#818CF8",
        },
        secondary: {
          light: "#64748B",
          dark: "#94A3B8",
        },
      },
      boxShadow: {
        glow: "0px 0px 8px rgba(255, 255, 255, 0.6)", // Glowing effect
      },
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;