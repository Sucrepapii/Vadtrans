/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E31E24",
          dark: "#BD141A",
          light: "#FF454A",
          glow: "rgba(227, 30, 36, 0.15)",
        },
        charcoal: {
          DEFAULT: "#121212",
          light: "#1E1E1E",
          subtle: "#2A2A2A",
        },
        accent: {
          emerald: "#10B981",
          amber: "#F59E0B",
          violet: "#8B5CF6",
        },
        neutral: {
          50: "#FAF9F9",
          100: "#F4F3F3",
          200: "#EAE7E7",
          300: "#DCD8D7",
          400: "#A39E9D",
          500: "#736E6D",
          600: "#55504F",
          700: "#3D3837",
          800: "#241F1E",
          900: "#140F0F",
        },
      },
      fontFamily: {
        raleway: ["Outfit", "Raleway", "sans-serif"],
        poppins: ["Inter", "Poppins", "sans-serif"],
      },
      borderRadius: {
        button: "12px",
        premium: "16px",
      },
      boxShadow: {
        premium: "0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)",
        glow: "0 0 20px rgba(227, 30, 36, 0.2)",
        hover: "0 20px 40px -15px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};
