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
        background: "#0a0a0a",
        foreground: "#e8e8e8",
        card: {
          DEFAULT: "#111111",
          foreground: "#e8e8e8",
        },
        border: "#1e1e1e",
        input: "#1e1e1e",
        ring: "#c9a84c",
        primary: {
          DEFAULT: "#c9a84c",
          foreground: "#0a0a0a",
        },
        secondary: {
          DEFAULT: "#1a1a1a",
          foreground: "#a0a0a0",
        },
        muted: {
          DEFAULT: "#1a1a1a",
          foreground: "#707070",
        },
        accent: {
          DEFAULT: "#1a1a1a",
          foreground: "#c9a84c",
        },
        destructive: {
          DEFAULT: "#e05656",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#34c97a",
          foreground: "#0a0a0a",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#0a0a0a",
        },
        hotel: {
          gold: "#c9a84c",
          "gold-dim": "#7a6230",
          dark: "#0a0a0a",
          card: "#111111",
          "card-hover": "#161616",
          border: "#1e1e1e",
          "border-light": "#2a2a2a",
          available: "#34c97a",
          occupied: "#3b82f6",
          dirty: "#f59e0b",
          maintenance: "#e05656",
          "out-of-order": "#6b7280",
          clean: "#22d3ee",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
