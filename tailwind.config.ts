import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface1: "var(--surface1)",
        onWhite1: "var(--onWhite1)",
        onWhite2: "var(--onWhite2)",
        accent: "var(--accent)",
        accent2: "var(--accent2)",
        error: "var(--error)",
      },
    },
  },
  plugins: [],
};
export default config;
