module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  transformIgnorePatterns: [
    "/node_modules/(?!ag-grid-vue)",
    "/node_modules/(?!ag-grid-community/vue)",
    "/node_modules/(?!ag-grid-enterprise)",
    "/node_modules/(?!ag-grid-community)"
  ],
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js', // No need to cover bootstrap file
],
}

