import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#111827",
          light: "#64748B",
        },
        paper: "#F5F7FF",
        indigo: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        verdant: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          400: "#4ADE80",
          500: "#16A34A",
          600: "#15803D",
        },
        amber: {
          50: "#FFFBEB",
          400: "#FBBF24",
          500: "#D97706",
        },
        clay: {
          50: "#FEF2F2",
          400: "#F87171",
          500: "#DC2626",
        },
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 20, 51, 0.06), 0 1px 0 rgba(16,20,51,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
