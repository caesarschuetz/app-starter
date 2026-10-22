# App Starter

A clean Expo (React Native) template for iOS and Android: onboarding, login, tabs, AI screen, paywall, settings, English + German.
Every backend (auth, purchases, AI, monitoring, analytics) runs in **mock mode** out of the box, so it works right after cloning, with no accounts or keys.

## Prerequisites

- **Node.js LTS** (20.19.4 or newer, Node 22 LTS recommended), from [nodejs.org](https://nodejs.org)
- **Git**, from [git-scm.com](https://git-scm.com)
- The **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Optional: [Claude Code](https://claude.com/claude-code) to build features with AI

## Run it in 2 minutes

```bash
git clone https://github.com/caesarschuetz/app-starter
cd app-starter
npm install
npx expo start
```

Scan the QR code: iPhone with the camera app, Android inside Expo Go. The app opens on your phone.

### Or let your AI do it

Paste this into Claude Code or ChatGPT (Codex):

```
Get https://github.com/caesarschuetz/app-starter and start it.
```

The agent follows [AGENTS.md](./AGENTS.md) / [CLAUDE.md](./CLAUDE.md) and does the whole setup.

## Make it yours

1. **Name and bundle id:** edit `app.identity.js` (name, slug, scheme, `com.yourname.yourapp`).
2. **Colors and fonts:** edit `src/theme/index.ts`. Every screen uses these tokens.
3. **Screens:** edit the files in `app/` (one file = one screen, thanks to Expo Router).
4. **Build a feature with Claude Code:** open the folder in a terminal, run `claude`, and ask for example:
   ```
   Add a "Notes" tab where I can add, list and delete short notes. Save them on the device,
   use the UI components from src/components/ui and add English and German texts.
   ```

## Turn on real services

Start from `cp .env.example .env`. Do one service at a time, in this order. After every change to `.env`, restart with `npx expo start -c`. Settings shows each service as `live` or `mock`.

1. **Supabase (auth + database)**
   - Create a project at [database.new](https://database.new) (Supabase dashboard). In Authentication -> Sign In / Providers, enable Email and Anonymous sign-ins.
   - Put the Project URL and anon key into `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
   - Run the migration: `npx supabase link --project-ref <ref>` then `npx supabase db push`.
   - Flip `auth: 'live'` in `src/config/services.ts`.
   - Verify: create an account on the login screen; it appears under Authentication -> Users and in the `profiles` table.
2. **AI function**
   - Get a Gemini API key at [aistudio.google.com](https://aistudio.google.com).
   - `npx supabase secrets set GEMINI_API_KEY=...` (optional `GEMINI_MODEL`), then `npx supabase functions deploy ai`.
   - Flip `ai: 'live'` (needs `auth: 'live'` too).
   - Verify: ask a question in the AI tab; the mock badge is gone and you get a real answer.
3. **RevenueCat (purchases)**
   - Create a project at [revenuecat.com](https://www.revenuecat.com), add your iOS / Android apps, products, an entitlement `pro` and a current offering.
   - Put the public SDK keys into `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`.
   - Flip `purchases: 'live'`.
   - **Needs a development build, not Expo Go:** `npx expo install expo-dev-client`, then `eas build --profile development --platform ios` (or `android`).
   - Optional: deploy `supabase/functions/revenuecat-webhook` with `--no-verify-jwt` to keep `profiles.is_pro` in sync.
   - Verify: the paywall lists your real products and a sandbox purchase unlocks Pro.
4. **Sentry (monitoring)**
   - Create a React Native project at [sentry.io](https://sentry.io), copy the DSN into `EXPO_PUBLIC_SENTRY_DSN`.
   - Flip `monitoring: 'live'`. For readable stack traces in EAS builds also set `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` as EAS secrets.
   - Verify: trigger an error (e.g. send an AI prompt with the network off); it shows up in Sentry Issues.
5. **Analytics (Amplitude)**
   - Create a project at [amplitude.com](https://amplitude.com), copy the API key into `EXPO_PUBLIC_AMPLITUDE_API_KEY`.
   - Flip `analytics: 'live'`.
   - Verify: open the app; `app_opened` appears in Amplitude's live event stream within a minute.

A service set to `'live'` without its keys prints one warning and keeps using the mock, so nothing crashes.

## Ship to the stores

- Accounts: [Apple Developer Program](https://developer.apple.com/programs/) (yearly fee) and a [Google Play developer account](https://play.google.com/console) (one-time fee).
- Install EAS and link the project: `npm i -g eas-cli`, `eas login`, `eas init`. `eas init` prints a project id: put it into `EAS_PROJECT_ID` (in `.env` and as an EAS environment variable).
- Build: `eas build --profile production --platform ios` (or `android`, or `all`).
- Submit: `eas submit --platform ios --latest` (or `android`).
- Google: new **personal** developer accounts must run a closed test with **at least 12 testers for 14 days** before they can publish to production.

## Project structure

```
app-starter/
├── app/                      Screens (Expo Router: one file = one route)
│   ├── (tabs)/               Home, AI, Settings tabs
│   ├── _layout.tsx           Providers + navigation stack
│   ├── onboarding.tsx, login.tsx, paywall.tsx
├── src/
│   ├── config/services.ts    The mock/live switch for every service
│   ├── services/             auth, purchases, ai, monitoring, analytics, storage, haptics
│   │   └── <name>/           types.ts (interface), mock.ts, live.ts
│   ├── components/ui/        Button, Card, Input, Screen, Text, MockBadge
│   ├── contexts/             Auth, Purchases, Language
│   ├── i18n/locales/         en.ts, de.ts
│   ├── lib/                  env.ts, shared Supabase client
│   ├── theme/index.ts        Colors, spacing, radius, typography
│   └── utils/
├── supabase/                 migrations/ + edge functions (ai, revenuecat-webhook)
├── assets/images/            App icon, splash, favicon (placeholders)
├── app.identity.js           App name, bundle id, scheme
├── app.config.js             Expo config (reads app.identity.js)
├── eas.json                  Build profiles
├── .env.example              All environment variables, documented
├── AGENTS.md / CLAUDE.md     Instructions for AI coding agents
```

## Troubleshooting

- **QR code does not connect:** phone and computer must be on the same Wi-Fi. Otherwise run `npx expo start --tunnel`.
- **"Incompatible SDK" / "Project is incompatible with this version of Expo Go":** each Expo Go app supports only one SDK, and this project is on **SDK 54**. Either use an Expo Go build that matches SDK 54, or upgrade the project with `npx expo install expo@latest --fix`, then run `npx expo-doctor`.
