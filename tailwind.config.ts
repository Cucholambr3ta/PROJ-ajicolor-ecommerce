import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
          light: "#fafafa",
        },
        // Reemplaza el gris frío por defecto de Tailwind: en modo
        // oscuro toda superficie "neutral" (dropdowns, drawers,
        // tarjetas admin) pasa a un morado derivado de ajicolor-purple
        // (#4f266a), coherente con el nuevo fondo estampado morado.
        neutral: {
          50: "#faf8fc",
          100: "#f1ebf5",
          200: "#ddd0e6",
          300: "#c3adcf",
          400: "#a180ae",
          500: "#7f5b8c",
          600: "#664571",
          700: "#4f2f5c",
          800: "#3a1f45",
          900: "#2a1533",
          950: "#180c1e",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
