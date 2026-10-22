// Metro bundler. getSentryExpoConfig = Expo default config + Sentry serializer
// (official way for Expo projects; harmless when Sentry is in mock mode).
// The `@/*` path alias from tsconfig.json is supported by Expo out of the box.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

module.exports = config;
