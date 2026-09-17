# Testing

This document holds the standard: what must be tested and how a test is judged.
Where a test file goes, and the shapes to avoid, are rules —
**[coding-guidelines.md](coding-guidelines.md)** owns those. See also
[architecture.md](architecture.md) for the shape the tests are protecting.

## What must be tested

- **Every feature must be unit tested.** A feature is not done without tests.
- **Design-system components are tested against their own contract** — props,
  states, accessibility — independently of any feature. A primitive that can
  only be tested through a feature has stopped being a primitive.
- **Logic in `lib/` is tested directly.** It is plain functions; test them as
  plain functions.

## How a test is judged

- **Test behaviour through the feature's public surface, not its internals.** A
  test that reaches past `index.ts` couples the feature's internal layout to its
  test suite, and the feature stops being something you can refactor in one step.
  A `vi.mock` of an internal path is the same coupling wearing a different hat.
- **Test rendered behaviour, not implementation details.** What the user sees
  and does, not which hook fired or how state is held.
- **A relocated assertion keeps its subject.** Moving a test to the file that
  owns its subject is a move; rewriting it as an isolated render with hand-made
  props is a different assertion wearing the old one's name.

## Timing is not a wall clock

This app's correctness is a scheduling question, so the audio clock and the
test clock both have to be substitutable. Drive time from an injected source —
a fake `AudioContext`, a fake scheduler — never from `Date.now()` or a real
`setTimeout` the test has to wait out. A test that sleeps is a test that will be
flaky on a loaded machine, and a drift assertion that sleeps proves nothing
about drift.

**An assertion nothing but an ear can settle is stated as such**, in the spec
and in the report, rather than dressed up as a passing test.

**The same goes for an eye, and V3 paid for learning it.** The front panel was
green on all three commands, passed every structural guard, and looked wrong —
flat metal, flat knobs — because no test in this repo renders a pixel. A
`needs a look` bullet is only settled by looking, so the repo carries the means
to look: Playwright as a devDependency and `.shots/shoot.mjs`, which screenshots
the running app at a given width and colour scheme. Take the shot at a phone
width and a desktop width in both schemes before calling a visual bullet done.

## Not every assertion runs under `npm test`

A type-level assertion is checked by `tsc`, which runs in `npm run build` — not
by Vitest. A test that pins the closed `Space` scale with a `@ts-expect-error` is
the standard case: widening the type to `number` passes all of `npm test` while
failing the build. Know which command holds a given guard before trusting a green
run, and say so in the test when it is not the obvious one.

**The styling boundary has two halves, held by different commands.** *Where*
styling may be written is held by `npm run lint` alone; *what* a component may
write is held by a structural test. `src/app/theme.test.ts` reads `globals.css`
and the whole UI tree from disk and fails on a palette utility, a literal
colour, a `dark:` variant or a read of `prefers-color-scheme`
([ADR 0004](adr/0004-the-look-is-a-named-surface-vocabulary.md)). So a component
that hard-wires itself to one colour scheme is caught by `npm test`, while a
`className` reintroduced into a feature is caught only by lint. Knowing which is
which is the difference between a green run and a checked one.

**The `className` half is held by `npm run lint` alone.**
[coding-guidelines.md](coding-guidelines.md#feature-slices) bans `className`
under `src/features/`, and `eslint.config.test.ts` lints the styling block
against *fixture strings* — so it proves the block is configured and fails if it
is deleted, but it never reads a real feature file. A `className` reintroduced
into one passes the whole suite and is caught only by lint. A CI path running
`npm test` without `npm run lint` does not carry that rule.

**The import zones are a different case, and the distinction matters.** They
*do* touch the tree: `import/no-restricted-paths` returns early when a specifier
does not resolve on disk, so a zone reaching into `src/features/` cannot fire
against a string alone. That test writes transient fixtures and deletes them —
see [ADR 0002](adr/0002-zones-are-proven-against-real-fixtures.md).

## Changing a word must never fail a test

Rewording anything the user is shown is one edit in `src/lib/snippets/en/`, and
the suite stays green. A test that quotes the app's words makes the test file a
second place that wording lives, so a reword breaks a test that has nothing to
do with wording — and everyone learns that changing copy is risky.

Assert *which* snippet a thing shows by importing it:
`getByRole('button', { name: transport.play })`.

**The rule is proven by rewording, not by reading the source.** `npm test` runs
two Vitest projects over the same files:

| Project | What it runs |
| :-- | :-- |
| `suite` | the app as it is written |
| `reword` | the same files, with `@/lib/snippets` resolved to a generated module whose every string has become `«reworded:notFound.body»` |

A test that imports the snippet reads the same scrambled value the component
renders, so it passes both. A test that copied a word passes `suite` and fails
`reword`. **A failure mentioning `«reworded:…»` means the test wrote down a word
it should have imported** — import the snippet, never reach for an exemption. An
interpolating snippet keeps its arguments under the scramble, so an assertion
about an interpolated *value* — the number, not the sentence — survives.

`vitest.reword.ts` holds the scrambler and the Vite plugin, beside the config it
serves.

**Only the specifier `@/lib/snippets` is scrambled.** A module that reaches the
snippets by relative path still reads the real words in both projects — which is
why `snippets.test.ts`, which imports `./index`, keeps working as an advisory
inside the `reword` run and reports a whole-fragment copy there too. Nothing else
in the tree reaches snippets that way, and nothing should: the rule is that
`@/lib/snippets` is the only path a caller writes.

**Why a reword run rather than a cleverer string search.** V2 planted three
violations against the string-matching guard that used to be the whole of this
rule. It caught a whole quote under `src/`. It never read a test file at the repo
root. And it could not see `getByText(/does not exist/)` — half of
`notFound.body` — because it matched whole fragments only. Two planted violations
sat in a green suite of 53 tests until a reword turned them red. A heuristic that
reads the source can always be fooled by a quote written slightly differently; a
run with the words actually changed cannot.

`snippets.test.ts` stays as the fast advisory. For a whole-fragment copy it names
the file and the word, which beats a missing DOM node. It is not widened any
further — its length floor, its `src/`-only scan and its whole-fragment match are
the `reword` project's job now. See
[ADR 0003](adr/0003-user-facing-text-lives-in-snippets.md).

## A test is not a test until you have seen it fail

**Write it red, or break the code and watch it go red.** This is not ceremony.
The project these rules came from shipped three tests that read correctly,
passed, and asserted nothing:

- one probed a *perfect* tapper to prove a window had to be two beats wide —
  but a perfect tap survives a one-beat window too, so the assertion was true
  for every value of the constant it existed to justify;
- one claimed the slider "carries on from" a tapped tempo, while
  `fireEvent.change` writes an absolute value and never reads the previous one;
- one proved a scheduling window adapted to the tapped tempo in the module,
  while the component that used it could have been hard-coded to a constant and
  every test would still have passed.

All three were found by **mutation** — change the constant, delete the guard,
replace the call with a literal, and see whether anything goes red. None was
findable by reading, because each one looked right.

Two habits follow:

- **When a test cannot be red first** — because the code already exists, or
  because it asserts a contract — mutate deliberately, watch it fail, restore,
  and say in the report which mutant killed it.
- **Probe the case the rule exists for, not the easy one.** A rule about
  tolerating a late player is not tested by a punctual one.

## Some questions are answered by hardware, not by tests

A probe is a page that reports what a device did. It asserts nothing, has no
test, and is not loaded by the suite — and that is correct rather than a gap.
Its output is a measurement a person reads.

**A probe is also disposable.** It lives under `public/`, answers its question
and is deleted; what survives is the measurement, in an ADR, and the method, in
that change's tech spec. Keep the finding, not the instrument.

Write one when a decision turns on behaviour no test can reach: firmware, an OS
routing rule, a browser's private threshold, what a phone's audio stack does
when the screen locks. Run it before building, record the numbers in the spec,
and turn what it found into an ADR. A change specced as four tracks can ship as
one because a probe answered its central question in twenty minutes.

**What still needs a test is everything the probe's answer then implies.** That a
platform refuses gracefully, that a file is the length it claims — those are
ordinary assertions and they are not excused by the probe.

## Structural tests

Some conventions no linter can check are guarded by tests that read the tree or
the source from disk and fail when it drifts. They run under `npm test`, not
`npm run lint`. Shipped in V1:

| Test | Guards |
| :-- | :-- |
| `src/components/structure.test.ts` | the five component groups, `tokens.ts` at the root, no barrels, no import climbing out of its folder |
| `eslint.config.test.ts` | each live zone fires on a bad import and stays quiet on a *real legal* one, and the styling block rejects a `className` in a feature while leaving the design system alone. Writes transient fixtures under `src/features/zonefixture-*`, per [ADR 0002](adr/0002-zones-are-proven-against-real-fixtures.md) |
| `src/lib/snippets/snippets.test.ts` | the language folder is private to the index — enforced. That no test writes out what a snippet says is *advised* here, with a good error message, and **proven** by the `reword` project |
| `inlineWords.test.ts` | no `.tsx` under `src/app/` or `src/features/` writes JSX text, and no letter-bearing string literal in one sits outside a named position — a structural prop, a font-config key, a module specifier or a directive. Parsed with the TypeScript compiler API. V1 shipped it as `src/app/routes.test.ts` over `src/app/` alone; V3 moved every word in the app into `src/features/panel/`, where it did not reach. It denies by default, so a string reached through a local constant or an expression container dies too. Blind spot: `.ts` files, where a literal is an identifier like `'kick'` far more often than a word |
| `deployability.test.ts` | `engines.node` declared, the script set invents no command, no custom `output` mode, `.next` ignored |
| `vitest.reword.test.ts` | three layers of the gate. The scrambler's shapes and the plugin's `enforce: 'pre'` ordering; that `vitest.config.ts` installs both projects, with the plugin on exactly one and a distinct `groupOrder` on both; and — the layer that matters — that `@/lib/snippets` actually **yields a placeholder under `reword` and the real word under `suite`**. The first two pin the gate's shape and a mutant can slip under them: make the generated module re-export the real snippets and every shape assertion still passes while the gate is dead. The third kills it. A fourth pins the *file set*: both projects must get the same `include`, and `passWithNoTests` is off at the root — otherwise one line narrowing `reword` to `src/`, or pointing it at nothing, disables the gate with a green suite. Runs in the `node` environment, since importing the config pulls in esbuild |

**A structural test that writes to the tree may not run concurrently with
itself.** `eslint.config.test.ts` creates and deletes `src/features/zonefixture-*`
while it runs. When V2 added the `reword` project over the same files, the two
copies raced and the suite failed about two runs in five — `ENOENT` on a fixture,
and the same files vanishing under `snippets.test.ts`, which walks `src/`. The
projects are ordered by `sequence.groupOrder` in `vitest.config.ts` so that never
overlaps. **Before adding a project, a shard or a parallel CI job over these
files, check what writes to the tree** — the failure reads as an unrelated flake,
not as a race. See [ADR 0002](adr/0002-zones-are-proven-against-real-fixtures.md).

Still to write, each with the code that first needs it:

| Test | Guards |
| :-- | :-- |
| route boundary | a route reaches a feature only through its `index.ts` — including `vi.mock`, dynamic `import()` and `require()`, which lint cannot see. Nothing to guard until a feature slice exists |
| theme | every custom property `@theme` reaches for is declared somewhere, and the body is dressed in the theme |
| docs | every record in `docs/adr/` has a row in `adrs.md` with a status, and the numbers run without a gap or a repeat |
| groove data | every groove file imports the shape, the shared records and the step grid — and never another groove |

The guidelines say which rule each one stands behind, and which rules
`npm run lint` enforces instead.

**A structural test reads the tree through `import.meta.dirname`, never
`fileURLToPath(new URL(…, import.meta.url))`.** Under Vitest's jsdom environment
`import.meta.url` is rewritten to an `http:` URL and `fileURLToPath` throws
*The URL must be of scheme file*. Every guard in this repo reads from disk, so
every one of them meets this.

Write one when a convention is a fact about the tree — a folder set, a public
surface, a file that may not import something a linter cannot see, such as a
`vi.mock` path. A guard that reads source has to keep itself out of its own
search: spell any constant it looks for as an expression, so the test file is
not a second place that constant is written.
