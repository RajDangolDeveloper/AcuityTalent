export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#edecf1",
          100: "#dbdae4",
          200: "#b7b5c9",
          300: "#928fad",
          400: "#6e6a92",
          500: "#4a4577", // Base Primary
          600: "#3b375f",
          700: "#2c2947",
          800: "#1e1c30",
          900: "#0f0e18",
        },
        secondary: {
          50: "#fafbed",
          100: "#f5f7dc",
          200: "#ecf0b8",
          300: "#e2e895",
          400: "#d9e171",
          500: "#cfd94e", // Base Secondary
          600: "#a6ae3e",
          700: "#7c822f",
          800: "#53571f",
          900: "#292b10",
        },
        neutral: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          400: "#9ca3af",
          600: "#4b5563",
          800: "#1f2937",
        },
        success: "#14b8a6",
        error: "#ef4444",
        warning: "#f59e0b",
        info: "#7348ea",
      },
    },
  },
  plugins: [],
};
