const colors = require("tailwindcss/colors");
const production = !process.env.ROLLUP_WATCH;

module.exports = {
  purge: {
    content: [
      "./src/**/*.svelte",
    ],
    enabled: false // disable purge in dev
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
      red: colors.red,
      yellow: colors.amber,
      blue: colors.blue,
      green: colors.emerald
    },
    extend: {
      spacing: {
        '240': '60rem',
        '160': '40rem',
        '180': '45rem',
        '168': '42rem',
        '172': '43rem'
      },
      width: {
        '1/8': '12.5%'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
}
