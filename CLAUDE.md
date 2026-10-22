# CLAUDE.md
Guidelines for Claude Code when working in this repository.

---

## If you were asked to get/start this repo

Do these steps in order. One command per step. Do not skip any.

1. Not cloned yet? Run `git clone https://github.com/caesarschuetz/app-starter && cd app-starter`.
2. Run `node -v` (needs **Node 20.19.4 or newer, e.g. Node 22 LTS**) and `git --version`. If either is missing or too old, tell the user to install Node LTS from nodejs.org (and Git from git-scm.com), then **stop**.
3. Run `npm install`.
4. Do **not** create `.env` and do **not** ask for any keys. All services run in mock mode (`src/config/services.ts`).
5. Run `npm run check` (typecheck, lint, tests). Change nothing unless it fails.
6. Run `npx expo start`. If the phone cannot connect (different network, firewall), run `npx expo start --tunnel` instead.
7. Tell the user: install the **Expo Go** app, scan the QR code (iPhone: camera app; Android: inside Expo Go), the app opens. If Expo Go says "incompatible SDK" / "project is incompatible with this version of Expo Go": this project is on **Expo SDK 54**, so they need an Expo Go build that supports SDK 54 (see README, Troubleshooting).
8. Offer next steps: rename the app in `app.identity.js`, change colors in `src/theme/index.ts`, build a first feature.

---

## 🧠 Project Overview

**[Describe your app here]** – what it does, for whom, and its main features.

Built with **React Native + Expo (SDK 54)** for iOS and Android, from the app-starter template.
Integrations (each behind the central service switch, mock by default): **Supabase** (auth, database, edge functions), **RevenueCat** (purchases), **Sentry** (monitoring), **Amplitude** (analytics), an **AI** edge function (Gemini).

---

## 🚫 Terminal & Execution Rules

- Claude **may** run terminal commands **without** asking for permission
- Claude **may** use WebFetch, WebSearch, and all research tools **without** asking for permission
- Claude **darf** Contribution- (git) und CD-/Build-Befehle **selbst ausführen**, wenn der User es beauftragt – z.B. `git add/commit/push`, `eas build`, `npx expo prebuild`, `npx expo run:ios` / `run:android`, `npx expo start`, `rm -rf ios` / `android` / `.expo`
  - Ebenso `gh pr create` / `gh pr merge` (Merge nur bei grüner CI) und `npm run check` / `npm test` (Tests darf Claude jederzeit ungefragt ausführen).
  - **Nur auf Auftrag** – nie proaktiv oder ungefragt starten (kein "wild builden").
  - Vor allen **nach außen gerichteten / kaum umkehrbaren** Schritten kurz bestätigen lassen: `eas submit`, `eas update`, alles mit Production-Profil, Freigabe an externe Tester / Production-Rollout.
- Claude must **NEVER** run destructive git commands – diese sind **TABU**:
  - `git push --force`
  - `git reset --hard`
  - `git clean -f`
  - `git checkout .` (discard all changes)
  - `git branch -D`
  → Diese Befehle führt **nur der User** aus!
- Claude must **NEVER**:
  - trigger production deployments
  - modify `.env` files without confirmation

---

## ✅ Allowed Behavior

Claude may:
- Explain code and architecture
- Propose code snippets
- Suggest commands (non-executable)
- Ask clarifying questions

---

## 🔌 Services: interfaces + central switch

Every backend service lives in `src/services/<name>/` with exactly three files:

| File | Purpose |
|---|---|
| `types.ts` | The TypeScript **interface** (the contract). Screens only know this. |
| `mock.ts` | Works offline, no account, no keys. Default. |
| `live.ts` | Talks to the real vendor SDK / API. |

Services: `auth` (Supabase), `purchases` (RevenueCat), `ai` (Supabase edge function → Gemini), `monitoring` (Sentry), `analytics` (Amplitude). Device helpers without keys: `storage` (AsyncStorage), `haptics` (expo-haptics).

- **One switch:** `src/config/services.ts` → `SERVICE_MODE = { auth: 'mock', … }`. Flip a service to `'live'` there, nowhere else. The repo ships **all `'mock'`** so it runs right after cloning.
- **One accessor:** screens, hooks and contexts use **only** `import { services } from '@/services'` → `services.auth.signInWithEmail(…)`. `src/services/index.ts` builds the registry from the switch.
- **Fallback, never crash:** `'live'` without its env keys (or a native module in Expo Go, e.g. RevenueCat) → **one** `console.warn` and the mock is used. `liveBlocker()` in `src/services/index.ts` decides this; covered by `src/services/__tests__/registry.test.ts`.
- **Vendor SDK imports** (`@supabase/*`, `react-native-purchases`, `@sentry/*`, `@amplitude/*`, `expo-haptics`, AsyncStorage) **only** inside `src/services/*/live.ts` or `src/lib/` (shared clients like `src/lib/supabase.ts`). Live modules are loaded lazily with `require` in `src/services/index.ts`, so Expo Go never loads a native module in mock mode.
- **Env vars** are read only in `src/lib/env.ts` (static `process.env.EXPO_PUBLIC_*` names). Every variable is listed with a comment in `.env.example`.
- **New service:** create `types.ts` + `mock.ts` + `live.ts`, add it to `SERVICE_MODE`, `liveBlocker()`, `Services`/`buildServices()`, add tests (mock resolves with no env, live without keys falls back), and document its env vars in `.env.example`.
- Settings shows the **actual** mode of each service (`activeModes()`), after any fallback.

---

## 🧩 Architecture Overview

### Routing (Expo Router)
- `app/_layout.tsx` – Root layout and providers
- `app/index.tsx` – Entry redirect (onboarding → login → tabs)
- `app/(tabs)/` – Main app tabs (`index` Home, `ai`, `settings`)
- `app/login.tsx`, `app/onboarding.tsx`, `app/paywall.tsx` (modal)
- Deep linking scheme: from `app.identity.js` (`scheme`)

### Contexts
- **AuthContext** – Session, sign in / sign up / continue without account / sign out (via `services.auth`)
- **PurchasesContext** – `isPro`, purchase, restore (via `services.purchases`)
- **LanguageContext** – `t()` and language switch

### Services (`src/services/`)
- See „🔌 Services: interfaces + central switch“

### Backend
- **Supabase** for auth, database and edge functions
- Tables: `profiles` (`supabase/migrations/0001_profiles.sql`, RLS, `is_pro` only writable by the server)
- Edge Functions: `ai` (Gemini proxy, JWT required), `revenuecat-webhook` (sets `profiles.is_pro`)
- **Alle Edge Functions gehören ins Repo** (`supabase/functions/`), deploy via `supabase functions deploy <name>`. Code, der nur auf dem Server liegt, ist bei alten Deployments nicht mehr abrufbar.
- ⚠️ **`revenuecat-webhook` immer mit `--no-verify-jwt` deployen**: RevenueCat sendet ein eigenes Secret (`REVENUECAT_WEBHOOK_SECRET`, Prüfung im Code), kein JWT → mit JWT-Prüfung lehnt Supabase jeden Aufruf mit 401 ab.
- Server-Secrets (`GEMINI_API_KEY`, `REVENUECAT_WEBHOOK_SECRET`, …) nur per `supabase secrets set`, nie als `EXPO_PUBLIC_*`.

### Analytics (Amplitude)
- Events **nur** über `services.analytics.track()` senden; alle Events + Properties sind in `src/services/analytics/types.ts` typisiert (`AnalyticsEvents`). Neues Event = dort eintragen.
- Mock-Modus loggt Events nur in der Metro-Konsole (`[analytics:mock] …`).
- Event-Namen **nie umbenennen**, sobald sie live sind (bricht Funnels); neue Events bekommen einen neuen Namen.

---

## ⚙️ Configuration & Environments

- `app.config.js` – Dynamic Expo configuration (reads `app.identity.js`)
- `app.identity.js` – Name, slug, scheme, bundle id / package (the ONE place to rename the app)
- `eas.json` – Build profiles (development / preview / production)
- Environment variables via `EXPO_PUBLIC_*` (see `.env.example`)
- Development builds use `.dev` bundle ID suffix
- `.env` must **never** be overwritten without explicit confirmation

---

## 🚀 Production Pipeline (User-Workflow)

> ⚠️ **WICHTIG für Claude:** Dies ist der Deploy-Workflow des Users. Claude **darf** diese Befehle auf Auftrag selbst ausführen (siehe Terminal & Execution Rules) – aber **nur auf Auftrag, nie ungefragt**, und vor `eas submit` / `eas update` / Production kurz bestätigen lassen. Jede Stufe hat ein **manuelles Test-Gate** beim User.

**Gesamtablauf (verbindlich, jede Stufe muss grün sein, bevor die nächste startet):**

```
Branch → Commits → npm run check → Push → Pull Request → CI grün → Merge in main
  → Dev-Build testen → Staging (TestFlight / Play intern) → Production → Git-Tag
```

Gebaut (EAS) wird **nur von `main`** – Ausnahme: Dev-Builds zum Testen eines Feature-Branches.

### 1. Codebase (Git-Workflow, Details siehe „🌿 Git Workflow“)
```
git checkout main && git pull
git checkout -b feat/kurze-beschreibung
… arbeiten …
npm run check                       # Typen · Lint · Tests lokal
git add <dateien> && git commit -m "feat(scope): …"
git push -u origin feat/kurze-beschreibung
gh pr create                        # Pull Request → CI läuft automatisch
→ CI grün → auf GitHub "Squash and merge" → Branch löschen
git checkout main && git pull
```

### 2. Development Environment
```
npx expo start -c
```

> **Kein lokaler Prebuild nötig (Managed Workflow):** `ios/` und `android/` sind nicht im Repo (`.gitignore`). EAS Build führt `expo prebuild` selbst auf dem Build-Server aus – inkl. aller Config-Plugins und `EAS_BUILD_PROFILE` aus `eas.json`. **Immer `--clear-cache`** – der Server ist die einzige Prebuild-Instanz. Lokaler Prebuild nur als Test, wenn an Config-Plugins gearbeitet wird.

### 3. Test
Expo Go reicht, solange alle nativen Services im Mock-Modus sind. Für RevenueCat live (natives Modul) ist ein **Development Build** nötig (`npx expo install expo-dev-client`, dann):

- **iOS:**
  `eas build --profile development --platform ios --clear-cache && EAS_BUILD_PROFILE=development npx expo start -c`
- **Android:**
  `eas build --profile development --platform android --clear-cache && EAS_BUILD_PROFILE=development npx expo start -c`

### 4. Staging intern (TestFlight intern / Play interner Test)
- **Apple:** `eas build --profile production --platform ios --clear-cache && eas submit --platform ios --latest`
- **Android:** `eas build --profile production --platform android --clear-cache && eas submit --platform android --latest` (beim ersten Mal AAB manuell in der Play Console hochladen; Track in `eas.json` → `submit.production.android.track`)

### 5. Staging extern
Hier bekommen echte User die Beta-Änderungen.
- **Apple:** (in App Store Connect für externe TestFlight-Tester freigeben)
- **Google:** (geschlossener Test; neue private Developer-Accounts brauchen ≥ 12 Tester über 14 Tage vor Production)

### 6. Production
- App Store Connect / Google Play Console
- **Nach dem Release:** Git-Tag setzen, damit jeder Release-Stand wiederauffindbar ist:
  `git tag v1.0.0 && git push origin v1.0.0`

### Versionsnummern (Regeln)
| Feld | Wo | Wann ändern |
|---|---|---|
| `version` (z. B. `1.0.0`) | `app.identity.js` | Bei jedem Store-Release mit neuen Features/Fixes. **Pflicht** bei nativen Änderungen (neues natives Paket, SDK-Update, Config-Plugin, Permissions), weil `runtimeVersion` der `appVersion`-Policy folgt |
| iOS `buildNumber` / Android `versionCode` | EAS (remote) | automatisch: `appVersionSource: "remote"` + `autoIncrement` im `production`-Profil |

---

## 🛡️ Release-Prinzip: „Daneben statt drüber“

Neue Funktionen werden so gebaut, dass **Production für bestehende Nutzer unverändert bleibt**, bis der User sie per Schalter aktiviert.

- **Edge Functions:** bestehende Function nicht ändern, sondern neue Version **daneben** (`<name>-v2`). Alte App-Versionen rufen weiter v1 auf. v1 erst löschen, wenn v2 bei allen stabil läuft.
- **Datenbank: nur additiv** – neue Tabellen, neue **nullable** Spalten. Bestehende Spalten, Daten, Policies und Bedeutungen nicht ändern. Neue Werte in eigene Spalten (z. B. `score_v2` neben `score`).
- **App:** neuer Code-Pfad hinter **Feature-Flag**. Flag aus = exakt der bisherige Code-Pfad.
- **Rollout in Stufen:** aus → nur der eigene Account (im echten Production-Betrieb) → kleiner Prozentsatz → alle. **Not-Aus** jederzeit ohne Deploy/App-Update.
- **Migrationen** vorher in einem Supabase-Branch oder lokal testen.
- **Ausnahmen** nur für echte Bugfixes/Sicherheitslücken am bestehenden Pfad – dann im PR begründen.

## 🧪 Coding Workflow Rules

- Focus **only** on task-relevant code
- Do **not** touch unrelated files
- Avoid architectural changes unless explicitly requested
- Exhaust existing implementations before introducing new patterns
- Always consider side effects on related systems
- Debug step by step and identify the **root cause first**
- Mock data only in two places: **Testdateien** (`__tests__/`, `*.test.ts(x)`, `jest.setup.js`) und die **Mock-Services** `src/services/*/mock.ts` hinter dem zentralen Schalter. Nie Mock-Daten in Screens oder `live.ts`.
- **Tests sind Pflicht** für geänderte/neue Logik (siehe „✅ Testing & Quality Gates“)
- **Boy-Scout-Regel (Pfadfinder):** Eine Datei, die man *für die aktuelle Aufgabe ohnehin* anfasst, etwas sauberer hinterlassen (unbenutzte Imports/Variablen entfernen, Lint-Warnung beheben, Typfehler fixen). **Nicht** dafür: fremde Dateien anfassen, große Umbauten, Verhalten ändern. Größere Aufräumarbeiten = eigener `refactor/…`-Branch mit Tests **vorher**.

---

## 🌿 Git Workflow

### Grundregeln
- **`main` ist immer releasefähig.** Nie direkt auf `main` committen oder pushen – Ausnahme: reine `chore(release)`-Versions-Commits direkt nach einem Store-Build.
- **Jede Änderung auf einem kurzen Branch** (Stunden bis wenige Tage), dann **Pull Request** → CI grün → Merge.
- **Merge-Art:** „Squash and merge“ (ein sauberer Commit pro Feature auf `main`). Danach Branch auf GitHub löschen.
- **Ein Branch = ein Thema.** Nicht Feature + nebenbei Refactoring mischen.
- Vor jedem Commit: `git status` / `git diff` prüfen – nur Dateien committen, die zur Aufgabe gehören (`.env`, Credentials, `ios/`, `android/`, `dist/` nie).

### Branch-Namen
| Präfix | Wofür | Beispiel |
|---|---|---|
| `feat/` | neue Funktion | `feat/notes-list` |
| `fix/` | Bugfix | `fix/android-insets` |
| `refactor/` | Umbau ohne Verhaltensänderung | `refactor/split-settings-screen` |
| `test/` | nur Tests | `test/auth-service` |
| `chore/` | Tooling, Abhängigkeiten, Release | `chore/sdk-55` |
| `docs/` | nur Doku | `docs/readme` |

### Commit-Nachrichten (Conventional Commits)
Format: `typ(scope): kurze Beschreibung im Imperativ` – Typen wie bei Branches (`feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `ci`).
Beispiele: `fix(android): edge-to-edge insets in modals`, `feat(onboarding): add welcome step`.
Commits von Claude enden mit den Attributionszeilen (`Co-Authored-By: …`).

### Pull Requests
- Titel wie eine Commit-Nachricht. Beschreibung: **Was** wurde geändert, **warum**, **wie getestet**, bekannte Risiken.
- Merge **nur bei grüner CI**. (GitHub Free sperrt den Merge bei roter CI nicht technisch – die Regel gilt trotzdem.)
- Claude darf PRs erstellen (`gh pr create`) und auf Auftrag mergen – nie bei roter CI.

### Releases
- Pro Store-Release ein Tag: `vMAJOR.MINOR.PATCH` (z. B. `v1.0.0`) auf dem `main`-Commit, der gebaut wurde.
- Rollback = alten Tag auschecken und neu bauen, nicht Commits löschen.

---

## ✅ Testing & Quality Gates

### Werkzeuge
| Befehl | Was | Wann |
|---|---|---|
| `npm test` | Unit-Tests (Jest + `jest-expo`) | immer vor dem Commit |
| `npm run test:coverage` | Tests + Abdeckung der **Logik** (`src/services`, `src/utils`) | bei Bedarf / CI |
| `npm run typecheck` | TypeScript (`strict`), **0 Fehler** | vor dem Commit |
| `npm run lint` | ESLint (`eslint-config-expo`), **0 Fehler** | vor dem Commit |
| `npm run check` | alle drei nacheinander | **Pflicht vor jedem Push** |
| `npm run format` | Prettier | nur neue Dateien oder komplett überarbeitete |

### CI (`.github/workflows/ci.yml`)
Läuft automatisch bei jedem Pull Request und jedem Push auf `main`:
1. **Typen · Lint · Tests** (= `npm run check`)
2. **Bundle iOS + Android** (`expo export`) – fängt fehlende Pakete/Imports und Metro-Fehler ab, ohne EAS-Build.

**Rot = nicht mergen, nicht builden.** Erst lokal reproduzieren (`npm run check` bzw. `npx expo export --platform ios`), dann fixen.

### Abdeckung (Coverage)
- Gezählt wird nur die **Logik** (`src/services/**`, `src/utils/**`) – Bildschirme/Komponenten werden über E2E-Tests abgesichert, nicht über eine Quote.
- Sobald es echte Logik gibt: Mindestquote in `jest.config.js` (`coverageThreshold`) setzen. **Darf nur steigen, nie senken.**

### Wo Tests liegen und was getestet wird
- Ort: `__tests__/`-Ordner neben dem Modul, Datei `<Modul>.test.ts` (z. B. `src/services/__tests__/registry.test.ts`).
- **Test-Pflicht:** Jede neue oder geänderte **Logik** in `src/services/`, `src/utils/`, `src/i18n/` und reine Berechnungen in Contexts bekommt Unit-Tests. Bugfix → erst ein Test, der den Bug zeigt (rot), dann Fix (grün).
- **Was** testen: Ergebnis/Verhalten (Eingabe → Ausgabe), Randfälle (0, leer, Datumsgrenzen, unbekannte Werte). **Nicht** testen: Implementierungsdetails, `console.log`.
- **Mocks:** Native Module (`expo-*`, RevenueCat) und Supabase in Tests durch Attrappen ersetzen (`jest.mock(...)` bzw. die `mock.ts`-Services). Nie echte Netzwerk-/DB-Aufrufe in Tests. AsyncStorage ist global in `jest.setup.js` gemockt.
- **Datum:** Tagesdaten sind **lokale** `YYYY-MM-DD`-Strings – nie per `toISOString()` bilden (UTC → ggf. Vortag).
- **Zeit:** Datumsabhängige Tests immer mit `jest.useFakeTimers().setSystemTime(...)`.
- **Bekannte Bugs** als `it.failing(...)` festhalten (Test ist erwartet rot und wird grün gemeldet); nach dem Fix in `it(...)` umwandeln.
- Erwartete Werte **von Hand herleiten** (Kommentar mit Rechenweg), nicht einfach den aktuellen Output abschreiben.
- Findet ein Test einen echten Bug: **nicht still im selben Schritt fixen**, sondern dem User melden; ggf. als bekannte Lücke im Test dokumentieren.
- Aktuell **nur Unit-Tests**. Komponenten-Tests (React Native Testing Library) und E2E (Maestro) sind bewusst noch nicht eingeführt.

### Definition of Done (jede Aufgabe)
1. Nur aufgabenrelevante Dateien geändert
2. Tests für geänderte Logik geschrieben, `npm run check` grün
3. Übersetzungen in allen Sprachen in `src/i18n/locales/` (Test prüft es)
4. Bei UI-Änderungen: iOS **und** Android bedacht (Insets, Tastatur, Dark Mode)
5. CLAUDE.md aktualisiert, falls Feature/Architektur/Integration betroffen
6. PR mit Beschreibung, CI grün, gemergt
7. Manueller Test in Expo Go / Dev-Build bzw. Staging durch den User

---

## 📦 Tech-Stack-Constraints (Expo SDK 54)

- **Expo SDK 54, React Native 0.81, React 19.1, expo-router 6, Node ≥ 20.19.4.** Versionen nur über `npx expo install <paket>` hinzufügen (wählt die SDK-54-kompatible Version); prüfen mit `npx expo install --check` und `npx expo-doctor`.
- **Expo Go** unterstützt nur Module aus dem Expo SDK. Native Pakete wie `react-native-purchases` → nur lazy in `live.ts` laden und im Development Build testen.
- **Android Edge-to-Edge ist Pflicht** (`edgeToEdgeEnabled`): Inhalte laufen unter Status- und Navigationsleiste.
  - Abstände über `Screen` (`src/components/ui/Screen.tsx`, nutzt `SafeAreaView` aus `react-native-safe-area-context`) oder `useSafeAreaInsets()`.
  - RN-`SafeAreaView` wirkt auf Android **nicht**.
  - Tastatur: `KeyboardAvoidingView` mit `behavior="padding"` nur auf iOS (Beispiel: `app/(tabs)/ai.tsx`).
- **Dark Mode:** `userInterfaceStyle: "automatic"`; Farben folgen dem System über `useTheme()`. `expo-system-ui` muss installiert bleiben.
- **expo-localization:** `getLocales()[0]` verwenden (`locale`/`region` gibt es nicht mehr).
- **expo-file-system:** Import aus `'expo-file-system/legacy'`, falls die alte API gebraucht wird.
- `metro.config.js` nutzt `getSentryExpoConfig` – nicht auf `withSentryConfig` zurückstellen.

---

## 🧹 Bekannte Problemzonen (für Boy-Scout / spätere Refactorings)

Nur anfassen, wenn die Aufgabe dort ohnehin arbeitet – und dann zuerst Tests schreiben.

| Datei | Problem |
|---|---|
| – | (noch keine – hier eintragen, sobald welche auftauchen) |

---

## 🧱 Coding Principles

- Prefer **simple solutions**
- Avoid code duplication
- Apply **encapsulation**:
  - create sub-components and helper functions when appropriate
- Avoid one-off scripts
- Keep code clean, readable, and well organized

---

## 🎨 Centralization Rules

- **Text-Komponenten:** Immer `Text` aus `@/components/ui` verwenden – **niemals** rohes `<Text>` aus React Native
  - `Text` nutzt intern `useTheme()` (Typografie-Varianten `title`, `heading`, `body`, `label`, `caption`)
- **UI-Bausteine:** `Screen`, `Card`, `Button`, `Input`, `MockBadge` aus `@/components/ui`
- **Farben:** Immer `useTheme()` aus `@/theme` verwenden – **niemals** Hex-Werte hardcoden
  - Semantische Tokens nutzen: `colors.text`, `colors.background`, `colors.surface`, `colors.primary`, etc.
  - Feature-spezifische Akzentfarben als neues Token in `src/theme/index.ts` definieren, nicht als inline Hex
  - Branding (Farben, Abstände, Radien, Typografie) nur in `src/theme/index.ts`; App-Name/IDs nur in `app.identity.js`

---

## 🌍 Internationalization (i18n) & Localization (L10n)

### Supported Languages (2)
en, de

### Key Contexts & Utilities
- **LanguageContext** (`src/contexts/LanguageContext.tsx`)
  - Provides: `t()`, `language`, `setLanguage()`
  - Keys are type-checked: a typo in a key is a TypeScript error

### Localization Priority Rules
| Setting | Priority Order |
|---------|---------------|
| Language | 1. Saved choice (storage) → 2. Device Locale → 3. English |

### Translation Files
| Bereich | Speicherort | Format |
|---------|-------------|--------|
| App (React Native) | `src/i18n/locales/*.ts` | TypeScript (`en.ts` is the source of truth) |

### Rules for New Features
When adding new features, always consider:
1. **Use `t()` for all user-facing strings** – never hardcode text
2. **Add translation keys** to all language files in `src/i18n/locales/` (key parity is tested)
3. New language: add `locales/<code>.ts` typed as `Translations`, register it in `src/i18n/index.ts`

### Code Comments
- Code comments are in **English**

---

## 🔁 Recursive Documentation Rule (Living CLAUDE.md)

This repository uses **living documentation**.

### Mandatory Rule
Whenever a change introduces or modifies:
- a feature
- a service
- a context
- a data flow
- an architectural decision
- an integration (SDK, API, platform feature)

Claude must:
1. Explicitly state that `CLAUDE.md` should be updated
2. Propose a **minimal, focused change**
3. Ask for confirmation **before** suggesting the updated text

### Scope
Document only:
- high-level behavior
- responsibilities
- constraints
- invariants

Do NOT document:
- implementation details
- temporary experiments
- short-lived debugging changes

### Final Check
Before completing any feature-related task, Claude must internally answer:
> “Would a future Claude benefit from knowing this?”

If yes → an update to `CLAUDE.md` is required.

---

## ⚠️ Final Rule

When in doubt:
→ **Ask before acting.**  
→ **Explain instead of executing.**
