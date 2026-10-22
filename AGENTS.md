# AGENTS.md

Instructions for AI coding agents (Codex, ChatGPT, Cursor, Claude Code, ...).

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

## Full project rules

See [CLAUDE.md](./CLAUDE.md) (architecture, service switch, testing, git workflow, conventions).
