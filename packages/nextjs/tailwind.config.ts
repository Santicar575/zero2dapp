import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        celo: {
          yellow: "#FCFF52",
          black: "#000000",
          gold: "#FBCC5C",
          green: "#35D07F",
          blue: "#5EA33B",
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        celo: {
          primary: "#FCFF52",
          secondary: "#000000",
          accent: "#FBCC5C",
          neutral: "#1a1a1a",
          "base-100": "#ffffff",
          "base-200": "#f5f5f5",
          "base-300": "#e5e5e5",
          info: "#3b82f6",
          success: "#35D07F",
          warning: "#FBCC5C",
          error: "#ef4444",
        },
        "celo-dark": {
          primary: "#FCFF52",
          secondary: "#ffffff",
          accent: "#FBCC5C",
          neutral: "#1a1a1a",
          "base-100": "#000000",
          "base-200": "#1a1a1a",
          "base-300": "#2a2a2a",
          info: "#3b82f6",
          success: "#35D07F",
          warning: "#FBCC5C",
          error: "#ef4444",
        },
      },
      "light",
      "dark",
    ],
    darkTheme: "celo-dark",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
};

export default config;
