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
        bg: "#0f1117",
        "bg-card": "#1a1d27",
        "bg-hover": "#21263a",
        accent: "#5b6ef5",
        "accent-hover": "#4a5ce0",
        "accent-light": "#7b8bf7",
        border: "#2a2d3e",
        muted: "#6b7280",
        subtle: "#9ca3af",
      },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
