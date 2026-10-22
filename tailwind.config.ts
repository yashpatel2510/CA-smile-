import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/config/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Top-level theme tokens for shadcn UI components
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        primary: "var(--color-primary)",
        border: "var(--color-border)",
        // Dynamic Clinic Theme Tokens
        brand: {
          primary: "var(--color-primary)",
          "primary-hover": "var(--color-primary-hover)",
          "primary-foreground": "var(--color-primary-foreground)",
          secondary: "var(--color-secondary)",
          "secondary-hover": "var(--color-secondary-hover)",
          "secondary-foreground": "var(--color-secondary-foreground)",
          accent: "var(--color-accent)",
          "accent-foreground": "var(--color-accent-foreground)",
          background: "var(--color-background)",
          surface: "var(--color-surface)",
          border: "var(--color-border)",
          text: "var(--color-text-primary)",
          muted: "var(--color-text-muted)",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        clinic: "var(--radius)",
      },
    },
  },
  plugins: [],
};

export default config;
