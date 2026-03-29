import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      colors: {
        // Corporate Glass theme colors
        primary: "#FFFFFF",
        secondary: "#E5E5E5",
        accent: "#007AFF", 
        background: "#F8FAFC",
        textMain: "#0F172A",
        textMuted: "#475569",
        glass: "rgba(255, 255, 255, 0.8)",
        glassBorder: "rgba(255, 255, 255, 0.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
