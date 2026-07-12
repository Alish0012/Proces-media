/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Logodaki klasör mavisinden türetildi
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#b3d4ff',
          300: '#7ab3ff',
          400: '#4f97f7',
          500: '#2f7ce0',
          600: '#205fc2',
          700: '#1a49a0',
          800: '#163b7c',
          900: '#122d5c',
        },
        // Logodaki klaket/play kırmızısından türetildi - vurgu (accent) rengi
        accent: {
          50: '#fdecec',
          100: '#fad2d0',
          200: '#f5a8a3',
          300: '#ee7871',
          400: '#e6544a',
          500: '#dd3327',
          600: '#bb2620',
          700: '#971e1c',
          800: '#741917',
          900: '#571514',
        },
        // Editoryal/koyu tema yüzeyleri: düz kart zemini ve bölüm ritmi için "bant" tonu
        surface: {
          DEFAULT: '#05060f',
          card: '#10141c',
          band: '#0d1b33',
        },
        // Referanstaki pastel kartların koyu temaya uyarlanmış, yumuşatılmış (muted) hali
        tint: {
          blue: '#16202e',
          rose: '#241716',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-radial': 'radial-gradient(circle at top, #205fc2 0%, #0b0f2b 60%)',
      },
    },
  },
  plugins: [],
};
