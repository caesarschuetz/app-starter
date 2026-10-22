// Dynamic Expo config. Identity comes from app.identity.js, secrets from env (.env / EAS env).
// Nothing project-specific is hardcoded here: no EAS project id, owner, Sentry org or update URL.
// Run `eas init` to link a project; it will add `extra.eas.projectId` (or set EAS_PROJECT_ID).
const identity = require('./app.identity');

const profile = process.env.EAS_BUILD_PROFILE; // set in eas.json
const isDevBuild = profile === 'development';

// Dev builds get their own bundle id + name so they can sit next to the store app.
const suffix = isDevBuild ? '.dev' : '';
const displayName = isDevBuild ? `${identity.name} Dev` : identity.name;

module.exports = () => {
  const projectId = process.env.EAS_PROJECT_ID;

  const plugins = [
    'expo-router',
    'expo-localization',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: identity.backgroundColor,
      },
    ],
  ];

  // Sentry plugin uploads source maps during EAS builds. Only enabled when org + project are set,
  // otherwise builds would fail trying to upload.
  if (process.env.SENTRY_ORG && process.env.SENTRY_PROJECT) {
    plugins.push([
      '@sentry/react-native/expo',
      { organization: process.env.SENTRY_ORG, project: process.env.SENTRY_PROJECT },
    ]);
  }

  return {
    name: displayName,
    slug: identity.slug,
    scheme: isDevBuild ? `${identity.scheme}-dev` : identity.scheme,
    version: identity.version,
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    ios: {
      bundleIdentifier: identity.iosBundleIdentifier + suffix,
      supportsTablet: false,
      config: { usesNonExemptEncryption: false },
    },
    android: {
      package: identity.androidPackage + suffix,
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: identity.backgroundColor,
      },
      edgeToEdgeEnabled: true,
      // Only declare permissions you actually use. Store reviewers check this.
      permissions: [],
      blockedPermissions: ['android.permission.RECORD_AUDIO'],
    },
    web: {
      output: 'single',
      favicon: './assets/images/favicon.png',
    },
    plugins,
    experiments: {
      typedRoutes: true,
    },
    extra: {
      ...(projectId ? { eas: { projectId } } : {}),
    },
    runtimeVersion: { policy: 'appVersion' },
  };
};
