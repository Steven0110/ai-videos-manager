import {heroui} from "@heroui/theme"
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [
    heroui(
      {
        prefix: "heroui",
        defaultTheme: "dark",
        defaultExtendTheme: "dark",
        themes: {
          dark: {
            colors: {
              background: "#0f1730",
            },
          },
        },
      }
    )
  ],
}

export default config;