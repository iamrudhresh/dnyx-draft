module.exports = {
  '*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json}': [
    'biome check --write --no-errors-on-unmatched'
  ]
};
