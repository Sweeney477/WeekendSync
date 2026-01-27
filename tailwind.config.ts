import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
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
        "background-dark": "#1E1C1A",
        // Dark paper theme tokens (warm, vintage feel)
        "surface-dark": "#2A2826",
        "surface-dark-2": "#353230",
        "ink-dark": "#E8E4DF",
        "muted-dark": "#9A9590",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      }
    }
  }
} satisfies Config;

