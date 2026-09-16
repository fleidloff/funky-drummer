# V1. Project scaffolding — tech spec

## What the generator actually produces

Measured, not recalled — `create-next-app@latest` run in the scratchpad on
2026-09-16 with `--typescript --tailwind --app --src-dir --import-alias "@/*"
--eslint --use-npm`:

| | |
| :-- | :-- |
| Next | `16.3.5` |
| React / React DOM | `19.2.8` |
| TypeScript | `^5`, `@types/node ^20`, `@types/react ^19` |
| Tailwind | `^4` via `@tailwindcss/postcss` |
| ESLint | `^9` flat config, `eslint-config-next 16.3.5` |
| `lint` script | `eslint` — not `next lint` |

Files it writes: `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `README.md`,
`eslint.config.mjs`, `next-env.d.ts`, `next.config.ts`, `package.json`,
`postcss.config.mjs`, `public/*.svg`, `src/app/{favicon.ico,globals.css,
layout.tsx,page.tsx}`, `tsconfig.json`.

**It generates its own `CLAUDE.md` and `AGENTS.md`.** That is the collision that
matters: `CLAUDE.md` is the one file in this repo that must not be overwritten.

**Its conflict check tolerates `.claude/`, `LICENSE` and `docs/`**, and refuses
on exactly `CLAUDE.md` and `specs/`. Probed directly against a mock of this
repo's shape.

## How the scaffold lands

**Generate into the scratchpad, copy in by hand.** Your `CLAUDE.md` is never in
the blast radius, and the generator's own `CLAUDE.md` is dropped rather than
deleted after the fact.

| Copied in | Dropped |
| :-- | :-- |
| `package.json` | generated `CLAUDE.md`, `AGENTS.md`, `README.md` |
| `tsconfig.json` | `public/*.svg` |
| `next.config.ts` | `src/app/page.tsx` — V1 writes its own |
| `postcss.config.mjs` | `eslint.config.mjs` — ours replaces it |
| `.gitignore`, with `.idea/` and `.verify/` re-added | |
| `src/app/globals.css`, `src/app/layout.tsx` | |

The repo's existing `README.md` and `.gitignore` are deleted first — both were
carried over and neither holds anything this project chose.

## Contracts

* **`Space`** — a closed union in `src/components/tokens.ts`, not `number`.
  Layout primitives take it; a caller cannot pass a raw length.
* **`@/*`** — the only alias. Resolves to `src/*` in `tsconfig.json`, and ESLint
  resolves it through `eslint-import-resolver-typescript`.
* **Snippets surface** — consumers import `@/lib/snippets` and nothing deeper.
  No file outside `src/lib/snippets/` writes `snippets/en` in a specifier.
* **ESLint block names** — `funky-drummer/import-boundaries` and
  `funky-drummer/no-styling-in-features`, per `docs/coding-guidelines.md`.
* **Zone numbering** — 1, 2, 3, 4, 6. Five is skipped deliberately.
* **`funky-drummer/` is a flat-config `name` field, not a plugin.** Nobody
  writes an ESLint plugin for this. Two config objects carry
  `name: 'funky-drummer/import-boundaries'` and
  `name: 'funky-drummer/no-styling-in-features'`.
* **`buildZones(features: string[])`** in `eslint.zones.mjs` returns the zone
  array. Zones 2 and 3 are generated from its argument; the live config passes
  `readdirSync('src/features')`, and the test passes two invented names so zone 3
  is provable while only one slice exists. `basePath` is pinned to
  `import.meta.dirname`.

## Epics

One epic. The change ships one thing: a repo that builds, lints and tests.

### Epic 1 — Project scaffolding

#### Track A — the scaffold and the toolchain

* **Role:** `implementer`
* **Owns:** `package.json`, `tsconfig.json`, `next.config.ts`,
  `postcss.config.mjs`, `vitest.config.ts`, `.gitignore`, `src/app/layout.tsx`,
  `src/app/globals.css`, `src/features/.gitkeep`; deletes `README.md`
* **Needs to start:** nothing

1. Delete `README.md` and `.gitignore`.
2. Generate into the scratchpad with the flags above; copy in the table's files.
3. Re-add `.idea/` and `.verify/` to `.gitignore`.
4. Install every dev dependency the later tracks need, so no other track edits
   `package.json`: `vitest`, `jsdom`, `@testing-library/react`,
   `@testing-library/jest-dom`, `@vitejs/plugin-react`, `vite-tsconfig-paths`,
   `eslint-plugin-import`, `eslint-import-resolver-typescript`.
5. `vitest.config.ts`: jsdom environment, `vite-tsconfig-paths` so `@/` resolves,
   `passWithNoTests` so the suite is green before any test exists.
6. `@theme` in `globals.css`: the semantic colour tokens, light on `:root` and
   dark under `prefers-color-scheme`, plus radii. `layout.tsx` dresses `<body>`
   in them.
7. **green** — `npm run build` succeeds and `npm test` exits 0.

**Read `node_modules/next/dist/docs/` after step 4 and before step 6.** This is
Next 16; `CLAUDE.md` says its conventions may differ from what any of us recall.

#### Track B — the import zones

* **Role:** `implementer`
* **Owns:** `eslint.config.mjs`, `eslint.zones.mjs`, `eslint.config.test.ts`
* **Needs to start:** Track A — needs `package.json` and the installed plugins

1. **red** — `eslint.config.test.ts` drives ESLint's Node API over this repo's
   config on synthetic source with a virtual `filePath`, asserting each of zones
   1, 2, 3, 4 and 6 rejects a bad import and accepts a good one, and that the
   styling block rejects a `className` under `src/features/` while leaving one
   under `src/components/` alone. Fails: no config.
2. **green** — `eslint.zones.mjs` exporting `buildZones`, and `eslint.config.mjs`
   composing `eslint-config-next` with the two named blocks.
3. Assert zone 3 at the generator with two invented feature names.

#### Track C — the design system

* **Role:** `implementer`
* **Owns:** `src/components/tokens.ts`, `src/components/tokens.test.ts`,
  `src/components/structure.test.ts`, `src/components/layout/Stack.tsx`,
  `src/components/layout/Stack.test.tsx`, and the `surfaces/`, `controls/`,
  `typography/`, `display/` folders
* **Needs to start:** Track A — needs Vitest and the jsdom environment

1. **red** — `structure.test.ts` reads the folder set from disk and asserts the
   five role folders, `tokens.ts` at the root, no `index.ts` anywhere, and no
   specifier beginning `../`. Fails: no folders.
2. **green** — create the five folders and `tokens.ts` with the closed `Space`
   union and the radii.
3. **red** — `tokens.test.ts` pins `Space` with a `@ts-expect-error` on a raw
   `number`. This one is held by `npm run build`, not by Vitest; say so in the
   test.
4. **red** — `Stack.test.tsx` renders `<Stack gap={4}>` and asserts its children
   appear. Fails: no component.
5. **green** — `Stack.tsx`, taking `gap: Space`.

#### Track D — the words and the routes

* **Role:** `implementer`
* **Owns:** `src/lib/snippets/index.ts`, `src/lib/snippets/en/*`,
  `src/lib/snippets/snippets.test.ts`, `src/app/page.tsx`,
  `src/app/not-found.tsx`
* **Needs to start:** Track A — needs Vitest and the `@/` alias

1. **red** — `snippets.test.ts` reads every string the module can render and
   fails if any test file outside the module writes one down; and asserts no file
   outside `src/lib/snippets/` writes `snippets/en` in a specifier.
2. **green** — `index.ts` re-exporting the `en/` area objects; `en/app.ts` and
   `en/notFound.ts`.
3. **green** — `page.tsx` and `not-found.tsx` reading their words off
   `@/lib/snippets`, with no inline string.

## Waves

* **Wave 1:** Track A alone. It owns `package.json` and creates the tree; nothing
  else can start without it.
* **Wave 2 (parallel):** Tracks B, C and D. Disjoint files, and none of them
  edits `package.json` because Track A installed everything.
* **Integration:** in the lead — all three commands, then the `verifier` against
  D1–D5.

## Checks

* `npm run lint`, `npm test`, `npm run build`

## Risks

## Risks

* **`.gitignore` is being dropped and Next's replacement does not carry two
  lines this repo needs**: `.idea/` (untracked deliberately, see commit
  `b0f53ba`) and `.verify/` (the verifier agent writes its report there and
  `docs/testing.md` calls that path gitignored scratch). Both must be re-added.
* **`CLAUDE.md`'s Next.js block says to read `node_modules/next/dist/docs/`
  before writing any code.** There is no `node_modules` yet, so no step below
  can be written against the real Next 16 API until install has run. The first
  track installs; every later track reads those docs before writing app code.
* **`next-env.d.ts` is gitignored by the generated `.gitignore`** and is
  regenerated on build. Nothing should hand-edit it.
* **Vitest fails on an empty suite** unless `passWithNoTests` is set, so Track A
  cannot report `npm test` green without it. Set it in step 5, not later.
* **Tailwind v4 has no `tailwind.config.ts`.** The theme is the `@theme` block
  inside `globals.css`. Anything reaching for a config file is working from v3
  habits.
* **`eslint-config-next` 16 is flat config**, and the two custom blocks compose
  after it. Order matters: a later block wins, so the zones must come after
  whatever `eslint-config-next` sets for `import/`.
* **Track A is a serial bottleneck** by design. If it lands wrong, all three
  wave-2 tracks build on it. Run all three commands at the end of wave 1 before
  dispatching.
