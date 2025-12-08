/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eee8fc",
          100: "#dcd1fa",
          200: "#b9a4f4",
          300: "#9676ef",
          400: "#7348ea",
          500: "#501be4",
          600: "#4015b7",
          700: "#301089",
          800: "#200b5b",
          900: "#10052e",
          950: "#0b0420",
        },
        secondary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          500: "#14b8a6",
          600: "#0d9488",
          900: "#134e4a",
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
