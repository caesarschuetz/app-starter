// Babel: Expo's preset. The `@/*` alias from tsconfig.json is resolved by Expo
// automatically (tsconfigPaths), both in Metro and in Jest via jest-expo.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
