// postcss.config.js
module.exports = {
  plugins: [
    require("@tailwindcss/postcss"),
    require("postcss-px-to-viewport")({
      viewportWidth: 375,
    }),
  ],
};
