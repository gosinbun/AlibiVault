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
        // Sherlock Holmes Color Palette (Requested by User)
        darkbrown: {
          DEFAULT: "#140e0b",
          surface: "#18110d",
          card: "#201712",
          inner: "#160f0c",
          border: "#423227",
          borderStrong: "#543b2e",
        },
        cloudburst: {
          DEFAULT: "#1f2942",
          light: "#60729b",
          dark: "#141b2d",
        },
        bluebayoux: {
          DEFAULT: "#4b5b81",
          light: "#6b7d9f",
        },
        grannysmith: {
          DEFAULT: "#8ec2c4",
          light: "#a8dadc",
        },
        ronchi: {
          DEFAULT: "#f1c84b",
          light: "#f6d878",
          dark: "#c9a12a",
        },
        piper: {
          DEFAULT: "#d15b29",
          light: "#e27848",
        },

        // Landing page alias tokens
        ground: "#140e0b",
        surface: "#18110d",
        card: "#201712",
        hairline: "#423227",
        "hairline-strong": "#543b2e",
        gold: "#f1c84b",
        mint: "#7b9c9d",
        brick: "#d15b29",
      },
      fontFamily: {
        editorial: ["Newsreader", "Georgia", "serif"],
        sans: ["Manrope", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        subtle: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        lifted: "0 12px 36px -4px rgba(0, 0, 0, 0.65)",
        dock: "0 16px 48px -4px rgba(0, 0, 0, 0.95), 0 0 0 1.5px rgba(241, 200, 75, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
