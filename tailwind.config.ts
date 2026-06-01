import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f8fafc",
        "bg-card": "#ffffff",
        "bg-hover": "#f1f5f9",
        accent: "#5b6ef5",
        "accent-hover": "#4a5ce0",
        "accent-light": "#7b8bf7",
        border: "#e2e8f0",
        muted: "#475569",
        subtle: "#64748b",
      },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
