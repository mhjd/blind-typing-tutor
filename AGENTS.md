# AI Agent Instructions for Blind Typing Tutor

## Project Overview

Touch typing tutor built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**. Supports 29 interface languages, 28+ keyboard layouts, and 29 learning languages.

**Fork**: https://github.com/mhjd/blind-typing-tutor
**Package manager**: yarn classic 1.22.22

## Commands

```bash
yarn dev          # Start Next.js dev server (port 3000)
yarn build        # Production build (also serves as typecheck)
yarn lint         # ESLint (flat config, eslint.config.js)
yarn test:e2e     # Playwright E2E tests
yarn test:e2e:ui  # Playwright interactive UI mode
```

**No separate typecheck command** — `yarn build` is the typecheck.

## Architecture

### Routing

Dynamic route: `/[interfaceLang]/[studyLang]/[learningMode]`

- `interfaceLang` — UI language (en, de, ar, ...)
- `studyLang` — language to practice typing (en, de, ar, ...)
- `learningMode` — `words`, `phrases`, or `custom`

Root `/` redirects to `/fr/fr/custom`. New users start with fr-fr AZERTY, the accents exercise and guided keyboard help. The primary navigation shows three exercises and the help selector; legacy modes, languages and keyboard options are in the collapsed settings panel.

### Key files

| Path | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout, dark mode flicker prevention, system fonts |
| `app/page.tsx` | Root redirect (detects Accept-Language) |
| `app/[interfaceLang]/page.tsx` | Interface language homepage |
| `app/[interfaceLang]/[studyLang]/[learningMode]/page.tsx` | Route validation and metadata |
| `app/[interfaceLang]/[studyLang]/layout.tsx` | Keeps the game mounted across mode changes |
| `app/[interfaceLang]/[studyLang]/[learningMode]/AppContent.tsx` | Client component — the actual app |
| `src/config/exercises.ts` | French exercise titles and base text |
| `src/config/exerciseContent.ts` | Editable banks for large varied rounds |
| `src/utils/exerciseRound.ts` | Local round generation, shuffle and different opening |
| `src/utils/inputPlan.ts` | Character output → physical keystroke plan |
| `src/components/Game.tsx` | Core typing game component |
| `src/components/Keyboard.tsx` | Virtual keyboard display |
| `src/hooks/useAppSettings.ts` | All app state + localStorage + URL sync |
| `src/config/constants.ts` | Language/layout options, validation |
| `src/config/layouts/` | 28 keyboard layout definitions |
| `src/translations/` | 29 language files + `types.ts` + `index.ts` |
| `src/words/` | Word lists per language (29 files) |
| `src/types/keyboard.ts` | `KeyboardLayoutId`, `LanguageCode` types |

### State management

All local component state via React hooks. Settings persisted to `localStorage`. No external state library. The `useAppSettings` hook orchestrates everything, syncing state with URL via `router.replace()`.

### Styling

Tailwind CSS v4 via `@tailwindcss/postcss`. Dark mode uses class selector (`.dark`). RTL support built in. Styles live in `app/globals.css` (the canonical source).

## Gotchas

### Stale files — do not use

- **`src/index.css`**, **`src/App.css`** — legacy Vite artifacts, not used by Next.js. Use `app/globals.css`.
- **`tailwind.config.js`** — references `./index.html` (Vite convention). Actual Tailwind config is via `@tailwindcss/postcss` in `postcss.config.js`.
- **`legacy_v1/`** — old webpack-based version, ignore entirely.

### Translation system

- Type-safe: `TranslationKeys` in `src/translations/types.ts` defines required keys.
- **29 translation files** must all implement every key — TypeScript enforces this at build.
- Each file in `src/translations/` exports a `translations` object.
- Also a `languageNames` record mapping every `LanguageCode` to its localized name.

### Adding new translation keys

1. Add key to `TranslationKeys` in `src/translations/types.ts`
2. Add to **all 29** files in `src/translations/`
3. Page-specific SEO titles/descriptions use `{lang}` placeholder (replaced with study language name at runtime)
4. Run `yarn build` to verify TypeScript catches missing keys

### Keyboard layouts

- Layout definitions in `src/config/layouts/{id}.ts`
- Type `KeyboardLayoutId` in `src/types/keyboard.ts` — must be updated for new layouts
- `POPULAR_LAYOUT_IDS` in `src/config/constants.ts` controls dropdown order

### Privacy and private-instance metadata

No Analytics, third-party fonts, server user storage or secrets. Custom text and preferences stay in browser localStorage. Metadata has no upstream canonical URLs; robots/noindex disable indexing. Preserve these properties. Do not deploy to a VPS or modify deployment Docker/infrastructure. See docs/DEPLOYMENT_HANDOFF.md.

### Typing engine

Final character output is separate from physical key plans. Dead keydown uses code and advances physical steps only; input/composition final output owns character validation. Modifier/dead presses do not count as errors. Normalize NFC. KeyboardHelpMode persists as keyboardHelpMode. Keep activeTarget, lastPressedKey and feedbackTarget distinct.

### E2E tests

- Playwright tests in `e2e/app.spec.ts` and `e2e/french.spec.ts`
- Tests auto-start dev server via `webServer` config; set `PLAYWRIGHT_PRODUCTION=1` to test a completed production build
- Firefox gets longer timeouts (30s vs 10s)
- Tests use `[data-testid="..."]` selectors
- Run specific browser: `npx playwright test --project=chromium`

### ESLint

- Flat config in `eslint.config.js`
- `no-console` is an error (only `console.warn` and `console.error` allowed)
- Ignores `dist` and `.next`

## Validation commands

After making changes, run:
```bash
yarn lint && yarn build
```
This covers both lint and typecheck. Pure input-plan assertions run in the Playwright suite alongside browser tests. Also run Chromium and, if available, Firefox against the production build and yarn audit.
