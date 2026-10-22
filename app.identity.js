// App identity: the ONE place to rename the app.
// Plain CommonJS so app.config.js (Node) can require it without a TypeScript loader.
// Every value can also be overridden by an environment variable (see .env.example).

/** @type {{ name: string; slug: string; scheme: string; iosBundleIdentifier: string; androidPackage: string; version: string; brandColor: string; backgroundColor: string }} */
const identity = {
  // Display name under the app icon
  name: process.env.APP_NAME || 'App Starter',
  // URL-safe project name (used by Expo / EAS)
  slug: process.env.APP_SLUG || 'app-starter',
  // Deep link scheme: appstarter://
  scheme: process.env.APP_SCHEME || 'appstarter',
  // Reverse-DNS identifiers. Must be unique in the stores and can't change after the first release.
  iosBundleIdentifier: process.env.APP_IOS_BUNDLE_ID || 'com.example.appstarter',
  androidPackage: process.env.APP_ANDROID_PACKAGE || 'com.example.appstarter',
  // Marketing version shown in the stores
  version: '1.0.0',
  // Used for splash screen and Android adaptive icon background. Keep in sync with src/theme.
  brandColor: '#1F6FEB',
  backgroundColor: '#FFFFFF',
};

module.exports = identity;
