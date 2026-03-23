import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        panel: "var(--color-panel)",
        line: "var(--color-line)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        brand: {
          primary: "var(--brand-primary)",
          secondary: "var(--brand-secondary)",
          accent: "var(--brand-accent)"
        }
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        premium: "0 20px 70px rgba(0,0,0,0.28)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-sora)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
