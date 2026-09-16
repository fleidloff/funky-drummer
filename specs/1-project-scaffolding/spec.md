# V1. Project scaffolding

Started 2026-09-16 · `/brainstorm`
**Phase:** built, D5 open — `/implement 1` ran 2026-09-16

## What

* A Next.js project with TypeScript, initialized in this repo, that deploys to
  Vercel without extra configuration.
* An ESLint setup "with a config that makes sense" — which in this repo means
  the one `docs/coding-guidelines.md` § Enforcement already specifies, not a
  generic starter config.
* The folder structure prepared up front, including `src/components/` ready for
  the design system.
* No product feature. Nothing plays a sound in V1.

## Done when

* **D1** — `npm run build` produces a working production build, and nothing in
  the repo would break Vercel's default Next.js preset: no custom output mode,
  no committed `.next`, the Node version declared in `package.json`.
* **D2** — `npm run lint` runs the import zones, and a config test watches each
  live zone both reject a bad import and accept a good one, plus the styling
  block rejecting a `className` under `src/features/`.
* **D3** — `npm test` is green, including the design-system structural test (the
  five role folders, `tokens.ts` at the root, no barrels, no import climbing out
  of its own folder), the snippets test, and one render test that proves the
  jsdom and Testing Library path works.
* **D4** — `src/components/tokens.ts` holds a closed `Space` scale that `tsc`
  rejects widening, proven by a `@ts-expect-error` that fails `npm run build` if
  the type is loosened to `number`, and consumed by one layout primitive that
  takes `Space` rather than a raw length.
* **D5** — the landing route and `not-found.tsx` render their words by reading
  them from `@/lib/snippets`, and no user-facing string is written inline.

## Decided

* **What the tree looks like** — settled already, not re-asked:
  `src/app/`, `src/components/` (`layout/`, `surfaces/`, `controls/`,
  `typography/`, `display/` + `tokens.ts` at the root), `src/features/<feature>/`
  and `src/lib/`, per `docs/coding-guidelines.md` and `docs/architecture.md`.
* **The stack** — Next.js, TypeScript, Tailwind v4, Vitest, per `CLAUDE.md`.
* **The three commands** — `npm test`, `npm run lint`, `npm run build`. Nothing
  else is invented.
* **V1 ships the full enforcement floor** — the zones, the config test that
  watches each one reject a bad import, the design-system structural test, and
  `tokens.ts` with its closed `Space` scale. Because the alternative loads all of
  it onto the first feature change, which would then have to build a feature and
  its guards at once — and because `docs/coding-guidelines.md` is explicit that a
  zone nobody has watched reject anything is a comment.
* **Vercel is "deployable", not "deployed"** — `## Done when` claims a working
  production build and nothing that would break Vercel's default Next.js preset.
  No `vercel.json`. Because that is the whole of what the scaffolding controls,
  and the deploy itself is one click Fred would rather make himself.
* **The landing route and `not-found.tsx` take their words from
  `src/lib/snippets/`** — the module and its test ship in V1. Because the
  enforcement floor was already bought whole, and the snippets guard is the
  seventh item on that list; deferring it would leave the rule stated but
  unenforced.
* **Tokens get structure now and the look later** — the closed `Space` scale,
  radii, and a small set of semantic colour tokens in light and dark. Because
  Phase 5 then changes values in one file instead of introducing tokenization as
  a new idea mid-project, and the theme structural test needs an `@theme` block
  to guard either way.
* **V1 ships one design-system primitive** — a `layout/Stack` taking `Space`,
  with a render test. Because every other V1 test runs in Node, so without it
  nothing proves jsdom, Testing Library or the `@/` alias under Vitest actually
  work — and a test environment nobody has run a render through is what bites the
  first feature change. It also gives the structure test real files to read
  instead of `.gitkeep`, and gives `Space` a consumer.
* **The scaffold is generated in the scratchpad and copied in by hand** —
  `create-next-app` writes its own `CLAUDE.md` and `AGENTS.md`, and its conflict
  check refuses this repo over `CLAUDE.md` and `specs/`. Copying in means the one
  irreplaceable file is never in the blast radius.
* **`README.md` and `.gitignore` are deleted first** — Fred's call: "basically
  empty". Next's `.gitignore` replaces the latter, with `.idea/` and `.verify/`
  re-added because it carries neither.

* **The size test's second question is waived** — the change touches `src/app`,
  `src/components`, `src/lib` and the root config, which is more than the two or
  three areas `/brainstorm` §7 asks for. Flagged before the build and waived by
  Fred running `/implement 1` anyway. A scaffolding change is the one change that
  touches every folder once, and half of it ships a repo that does not build.

## Open

Nothing. `spec.md` is settled; the conversation has moved to `tech-spec.md`.
