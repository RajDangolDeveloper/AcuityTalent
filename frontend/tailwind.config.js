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
          50: "#8e85f0",
          100: "#867ee2",
          200: "#776fc6",
          300: "#6760ab",
          400: "#595390",
          500: "#4a4577",
          600: "#3c385e",
          700: "#2e2b47",
          800: "#211f30",
          900: "#15131c",
          950: "#0c0b11",
        },
        secondary: {
          50: "#f5f7c3",
          100: "#e7f085",
          200: "#cad276",
          300: "#afb566",
          400: "#949958",
          500: "#7a7e49",
          600: "#60633b",
          700: "#484a2e",
          800: "#313321",
          900: "#1c1d14",
          950: "#11120c",
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
