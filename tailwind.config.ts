import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63"
        },
        primary: "#E52320", // Red from the poster
        "poster-yellow": "#FFD700",
        "poster-green": "#588E52",
        "poster-blue": "#336699",
        "poster-orange": "#F39200",
        "background-light": "#EFE9D5", // More distinct vintage paper tone
        "background-dark": "#1A1A1A",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      }
    }
  }
} satisfies Config;

