import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ajicolor: {
          magenta: "#e84266",
          purple: "#4f266a",
          yellow: "#ffd141",
          green: "#1ea96a",
          ink: "#1a1a1a",
          paper: "#f7f3e9",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
        script: ["var(--font-lobster)", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;
