/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}", // Aggiunto per sicurezza se usi la cartella src
  ],
  theme: {
    extend: {
      colors: {
        // Scala Indigo/Blue professionale per l'header e i tasti principali
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          600: '#4338ca', 
          700: '#3730a3',
          900: '#1e1b4b', // Il blu scuro "Godzy" per l'header a pillola
        },
        // Scala Slate/Gray per bordi, sfondi tabella e testi secondari
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#334155',
        }
      },
      // Opzionale: puoi definire un'arrotondatura personalizzata estrema
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      }
    },
  },
  plugins: [],
}