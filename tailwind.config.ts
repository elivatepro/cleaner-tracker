import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F0F0F",
          light: "#1A1A1A",
          lighter: "#262626",
          border: "#333333",
        },
        secondary: {
          DEFAULT: "#FFFFFF",
          muted: "#A0A0A0",
          dim: "#6B6B6B",
        },
        accent: {
          DEFAULT: "#10B981",
          soft: "rgba(16, 185, 129, 0.12)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          soft: "rgba(245, 158, 11, 0.12)",
        },
        danger: {
          DEFAULT: "#EF4444",
          soft: "rgba(239, 68, 68, 0.12)",
        },
        surface: {
          DEFAULT: "#141414",
          raised: "#1E1E1E",
          overlay: "#252525",
        },
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 4px 6px rgba(0,0,0,0.07)",
        lg: "0 10px 15px rgba(0,0,0,0.10)",
      },
      zIndex: {
        base: "0",
        dropdown: "10",
        sticky: "20",
        overlay: "30",
        header: "50",
        modal: "60",
        toast: "70",
        loader: "80",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      height: {
        13: "3.25rem",
      },
      fontSize: {
        xxs: ["11px", "1.5"],
      },
    },
  },
  plugins: [],
};

export default config;
