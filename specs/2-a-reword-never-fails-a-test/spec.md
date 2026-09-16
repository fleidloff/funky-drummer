# V2. A reword never fails a test

Started 2026-09-16 · `/brainstorm`
**Phase:** ready to build — `/implement 2`

## What

* "Make sure that changing a snippet never makes a test fail" — the rule is
  already written in `docs/coding-guidelines.md` and `docs/testing.md`, and the
  `test-writer` agent already carries it. What is missing is a mechanism that
  cannot be fooled, an ADR, and a pass over the tests that exist.
* Tell the `test-writer` agent.
* Write the ADR.
* Adjust existing tests if any of them need it.

## What the probe found

Measured in a copy of the tree under the scratchpad; the tree itself was not touched.

**The rule is followed today.** Every snippet reworded, all 48 tests green.

**It holds by luck, not by construction.** Two planted violations, both plausible,
both invisible to `snippets.test.ts`:

| Planted violation | Guard catches it | Survives a reword |
| :-- | :-- | :-- |
| `getByText('Nothing here')` under `src/` | yes | — |
| `getByText(/does not exist/)` — half of `notFound.body` | **no** | **no** |
| `getByText('Nothing here')` in a root-level test file | **no** | **no** |

With both planted the suite was 53 tests, all green. Rewording `notFound` turned
two of them red and the guard never spoke.

The guard's three holes, confirmed rather than suspected:

* it matches a **whole** fragment, so any partial quote passes
* it scans `src/` only — `deployability.test.ts` and `eslint.config.test.ts` are
  never read
* fragments under 4 characters are not guarded at all

**Nothing is broken today because no test in this repo renders an app word.**
`routes.test.ts` parses source with the TypeScript compiler API, `Stack.test.tsx`
renders its own strings. The rule has never been exercised.

**The fix was prototyped and works.** A `reword` vitest project — a ~35-line vite
plugin that resolves `@/lib/snippets` to a virtual module re-exporting every
snippet scrambled to `«reworded:notFound.body»`. It caught both planted
violations, failing in the `reword` project alone while `suite` stayed green. On
the clean tree both projects pass: 96 tests in 2.2s against 2.16s for one.

## Done when

* `npm test` runs a `reword` project alongside the suite, in which every snippet
  is replaced by a self-describing placeholder, and both projects pass on a
  clean tree. The three pre-push commands are unchanged.
* A test that copies a snippet fails in the `reword` project in all three shapes
  the probe found — quoted whole, quoted in part, and quoted from a test file at
  the repo root. Each is demonstrated by planting it, watching it go red, and
  removing it.
* `snippets.test.ts` still names the offending file and word for a whole-fragment
  copy, and is described in the docs as the fast advisory rather than the gate.
* ADR 0003 no longer claims the test half is fully enforced, and says what proves
  it instead.
* The `test-writer` brief tells the agent what the `reword` project is and what a
  failure in it means; `docs/testing.md` and `docs/coding-guidelines.md` agree
  with it and with 0003.

## Decided

* **Is the change even necessary, given the rule already passes?** — **Yes, and
  it is built now.** The probe showed the rule holds today only because no test
  in the repo renders an app word. The exposure starts with the very next
  change: Phase 1 is *it plays*, which means the first feature route and the
  first tests that render words. Fred's reason: those tests are written by the
  `test-writer` agent, unattended — a human might remember the rule, but an
  agent reaching for text it cannot conveniently import writes
  `getByText(/…/)`, which is exactly the hole the probe confirmed. Waiting means
  every test written before then is unaudited.
* **What makes the rule true — a source-reading heuristic, or a run that
  actually rewords?** — **Both.** A scramble run is the gate that proves it: a
  `vitest` run with `@/lib/snippets` aliased to a copy whose every string is a
  self-describing placeholder, and the suite has to stay green. The existing
  string guard in `snippets.test.ts` stays as the fast failure that names the
  file and the word. Fred's reason: the scramble proves the rule and the guard
  explains the breakage, and they are doing two different jobs.
* **How the scramble run gets run** — **a second `vitest` project.**
  `vitest.config.ts` grows a `projects` array: the suite as it is today, and a
  `reword` project that aliases `@/lib/snippets` to a generated scramble. Fred's
  reason: `npm test` then runs both, the three pre-push commands stay as they
  are, and no CI path can carry the suite without carrying the rule — the exact
  failure `docs/testing.md` already warns about for `npm run lint`. Cost is the
  suite running twice, about two seconds today.
* **The scramble module is generated from the real one, never hand-written.** It
  imports `@/lib/snippets`, walks it, and replaces every string with a
  self-describing placeholder such as `«reworded:notFound.body»`, preserving
  object shape and function arity. A hand-written scramble would be a second
  place the module's shape lives, which is the sin this whole change is about.
* **Where the mechanism is recorded** — **ADR 0003 is amended in place.** Its
  *Consequences* section claims `snippets.test.ts` holds two halves and "both are
  enforced"; the probe disproved that sentence. Fred's reason: amending fixes a
  record that is now false, rather than leaving it standing for a second file to
  correct. The policy never changed — only what proves it. `adrs.md` keeps three
  rows.
* **No existing test needs adjusting.** Measured, not assumed: rewording every
  snippet left all 48 tests green. `Stack.test.tsx` renders `first` / `second`,
  which are test-owned strings, and `routes.test.ts` parses source rather than
  rendering it. The "adjust existing tests if needed" part of the ask is
  satisfied by there being nothing to adjust.
* **Found during the build: the two projects may not run concurrently.**
  `eslint.config.test.ts` writes transient fixtures into `src/features/zonefixture-*`
  ([ADR 0002](../../docs/adr/0002-zones-are-proven-against-real-fixtures.md)).
  Running it in two projects at once made them race — one deleted the fixtures
  while the other was mid-read — and `snippets.test.ts`, which walks `src/`, hit
  the same vanishing files. The suite failed about two runs in five. Fixed with
  `sequence.groupOrder` on each project, so `suite` finishes before `reword`
  starts. 18 consecutive green runs afterwards.
  **This corrects the reason the whole-file-set decision was recorded with, not
  the decision.** The tech spec said both projects cost 2.21s against 2.16s
  "because Vitest runs them in parallel" — they no longer do. Measured cost is
  now 2.6–3.3s against 2.16s, still small enough that narrowing the reword
  project's file set buys nothing.
* **The string guard stops being widened.** Its length floor, its `src/`-only
  scan and its whole-fragment match are no longer holes that have to be closed,
  because the scramble run covers all three. It is an advisory with a good error
  message, not the gate.

## Open

* Nothing. The spec is settled; the remaining questions are about how it is
  built and live in `tech-spec.md`.
