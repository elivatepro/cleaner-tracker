export const defaultTheme = {
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
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
    "3xl": 64,
  },
  radius: {
    sm: 4,
    md: 6,
    lg: 8,
    full: 9999,
  },
} as const;
