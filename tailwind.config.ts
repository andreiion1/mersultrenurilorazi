import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          soft: "var(--color-primary-soft)",
        },
        navy: {
          DEFAULT: "var(--color-navy)",
          2: "var(--color-navy-2)",
          3: "var(--color-navy-3)",
        },
        accent: "var(--color-accent)",
        success: { DEFAULT: "var(--color-success)", bg: "var(--color-success-bg)" },
        warning: { DEFAULT: "var(--color-warning)", bg: "var(--color-warning-bg)" },
        danger: { DEFAULT: "var(--color-danger)", bg: "var(--color-danger-bg)" },
        info: "var(--color-info)",
        base: "var(--bg-base)",
        subtle: "var(--bg-subtle)",
        card: "var(--bg-card)",
        line: "var(--border)",
        strong: "var(--text-strong)",
        body: "var(--text-default)",
        muted: "var(--text-muted)",
      },
      borderRadius: { sm: "8px", md: "12px", lg: "16px", xl: "20px" },
      boxShadow: {
        sm: "0 1px 2px rgba(6,17,39,.06)",
        md: "0 2px 8px rgba(6,17,39,.08)",
        card: "0 2px 8px rgba(6,17,39,.08)",
        amber: "0 4px 16px rgba(245,160,0,.25)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      maxWidth: { container: "1200px" },
    },
  },
  plugins: [],
};

export default config;
