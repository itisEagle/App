module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gaming: {
          bg: "#0b0c10",       // Deep Black
          card: "#1f2833",     // Dark Gray
          accent: "#66fcf1",   // Neon Cyan
          text: "#c5c6c7",     // Light Gray
          highlight: "#45a29e" // Muted Teal
        }
      },
      boxShadow: {
        'neon': '0 0 10px #66fcf1, 0 0 20px #66fcf1',
      }
    },
  },
  plugins: [],
}
