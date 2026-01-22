import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#00FF41",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#39FF14",
          foreground: "#000000",
        },
        accent: {
          DEFAULT: "#B026FF",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#FF0041",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "#888888",
        },
        tier: {
          untrusted: "#FF0041",
          verified: "#FFD700",
          trusted: "#39FF14",
          elite: "#00FF41",
          legendary: "#B026FF",
        },
      },
      fontFamily: {
        terminal: ["VT323", "monospace"],
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-in-out",
        glitch: "glitch 0.3s ease-in-out",
        scan: "scan 8s linear infinite",
      },
    },
  },
  plugins: [],
}

export default config
