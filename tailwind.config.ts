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
        // Flipped for the dark glassmorphism theme: "ink" is now light text,
        // "paper" is now the dark page background. Every existing className
        // in the app (text-ink, bg-paper, etc.) stays exactly the same —
        // only what these tokens resolve to has changed.
        ink: {
          DEFAULT: "#F1F5F9",
          light: "#94A3B8",
        },
        paper: "#0D0F14",
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
          500: "#10B981",
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
          500: "#EF4444",
        },
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
      boxShadow: {
        card: "0 8px 30px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;