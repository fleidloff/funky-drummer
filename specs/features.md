# Features

Every change to this app, and every change we have considered. One row per
change, in both tables.

- **`specs/<N>-<title>/`** is where a change is designed and built. The folder
  stays after it ships — it is the record, not scratch.
- **Implemented** is the archive: what landed, when, and what it produced.
  `/implement` writes the row.
- **Candidates** is the backlog: things worth building, with enough of a note to
  pick one up cold. A candidate is not a commitment and carries no number until
  `/brainstorm` allocates one.

Numbers are never reused. `N` for a new change is one higher than the largest
in either table.

---

## Implemented

| N | Title | Shipped | What landed |
| :-- | :-- | :-- | :-- |
| [1](1-project-scaffolding/) | Project scaffolding | 🚧 | Next.js 16 + TypeScript + Tailwind v4 + Vitest, deployable on Vercel defaults. The enforcement floor shipped whole: five generated ESLint import zones each watched to reject and accept, the design system's five role folders with a closed `Space` scale held by `tsc`, `src/lib/snippets/` with the words of the app, and a placeholder landing route and `not-found`. 48 tests. Produced [ADR 0002](../docs/adr/0002-zones-are-proven-against-real-fixtures.md) and [ADR 0003](../docs/adr/0003-user-facing-text-lives-in-snippets.md). D5 graded **partly** — the inline-string guard does not catch a string reached through a local constant, deferred to the first feature route. |
| [2](2-a-reword-never-fails-a-test/) | A reword never fails a test | 2026-09-16 | `npm test` now runs two Vitest projects: `suite`, and `reword`, where `@/lib/snippets` resolves to a generated module whose every string has become `«reworded:notFound.body»`. A test that copied a word passes `suite` and fails `reword`, so the rule is proven rather than reviewed. A probe first measured that the rule held only by luck — the old string guard missed a partial quote and never read the repo root, and two planted violations sat in a green suite of 53 tests. `snippets.test.ts` is demoted to a fast advisory. Amended [ADR 0003](../docs/adr/0003-user-facing-text-lives-in-snippets.md), whose "both are enforced" was false, and [ADR 0002](../docs/adr/0002-zones-are-proven-against-real-fixtures.md), which gained the constraint the second project uncovered: a structural test that writes to the tree cannot run concurrently with itself, held by `sequence.groupOrder`. Three verification rounds each found a live mutant — a fixture race, a gate that served real words while every test passed, and a one-line `include` that silently disabled it. 136 tests. |
| [3](3-the-front-panel/) | The front panel | 🚧 | The skeuomorphic panel from `app2.png`, in dark and light, with every control a working dummy and no audio. Twenty-one design-system primitives across all five role folders, and the first feature slice, `src/features/panel/`. The look is a named surface vocabulary in `globals.css` — twenty CSS variables split into a metal set the dark block redefines and a lit set it never touches, plus thirteen `@utility` recipes — and no component may name a colour, write a hex, use a `dark:` variant or read `prefers-color-scheme`. Produced [ADR 0004](../docs/adr/0004-the-look-is-a-named-surface-vocabulary.md). **The build was green and the panel was flat**: nothing in the repo renders a pixel, so V3 added Playwright and `.shots/shoot.mjs`, and `docs/testing.md` now says to take the shot before calling a visual bullet done. Four reversals followed from looking: the fader drags along its own axis, "CSS gradients only" gave way to inline `feTurbulence` noise and real fonts, the knob and fader thumb became SVG geometry with knurled teeth and turned grain, and the corner screws went. None of them touched a component contract — components only apply recipe names. Also fixed: `snippets.test.ts` matched copies by raw substring, so `panel.autoFeel` read as a copy of "Feel" and the word "nothing" as a copy of "thin"; it matches whole words now and finally enforces ADR 0003's design-system half. 600 tests. |
---

## Candidates


| Candidate                                                                              | Why | Notes |
|:---------------------------------------------------------------------------------------| :-- | :-- |
| Isolate the lint fixtures from the tree walkers | `eslint.config.test.ts` creates and deletes `src/features/zonefixture-*` while `snippets.test.ts` walks `src/`, inside the same project. A walk can still race a fixture's lifetime. | Predates V2 — V1 shipped it, V2 only made it frequent enough to see, and `sequence.groupOrder` only removed the cross-project half. Fix is a per-run fixture name or a walker that tolerates `ENOENT`. Shows up as an unrelated flake. |
