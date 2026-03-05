/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate";
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#e5e7eb",
        input: "#f3f4f6",
        ring: "#19c3e6",
        background: "#ffffff",
        foreground: "#000000",
        "family-primary": "#5fa5ba",
        "family-primary-dark": "#4d8ca0",
        "secondary-orange": "#fb923c",
        "warm-beige": "#faf7f2",
        "warm-accent": "#ffedd5",
        "background-light": "#f6f8f8",
        "background-dark": "#101f22",
        "cream-light": "#FDFBF7",
        "cream-sidebar": "#FFFFFF",
        primary: {
          DEFAULT: "#5fa5ba",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#E0F2F1",
          foreground: "#00695C",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f3f4f6",
          foreground: "#6b7280",
        },
        accent: {
          DEFAULT: "#19c3e6",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Manrope", "sans-serif"],
        manrope: ["Manrope", "sans-serif"],
        "public-sans": ["Public Sans", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "meteor-effect": "meteor 5s linear infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out",
      },
    },
  },
  plugins: [animate],
};
