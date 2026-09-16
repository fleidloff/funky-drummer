# 0003. User-facing text lives in `src/lib/snippets/`, by language

- **Status:** ✅ Accepted
- **Date:** 2026-09-16

## Context

A word the user reads is a thing that gets reworded. When it is typed into the
component that renders it, the component becomes the place wording lives, and a
reword becomes a change to a React file — reviewed as code, and liable to break
a test that quoted it.

V1 had to settle this before any component existed, because `src/app/layout.tsx`
exports `metadata.title`, which is user-facing from the first commit.

## Decision

**The app's words live in `src/lib/snippets/`, split by language, and a consumer
imports `@/lib/snippets` and nothing deeper.**

- Import the area object and read a key off it — `app.name`, `notFound.title` —
  never a destructure at module scope, so any line says which area the word came
  from.
- **No file outside `src/lib/snippets/` may write `snippets/en` in a specifier.**
  `en/` is the part a second language replaces; a consumer that names it pins the
  app to English.
- An `aria-label`, a `title` or an `alt` is a word the user is read, so the rule
  covers accessible names as well as visible text.
- Glyphs, separators, URLs, storage keys and notation (`'4/4'`, `'120 bpm'`) are
  data, not words, and stay where they are used.
- The design system is held to a stricter version: no file under
  `src/components/` holds an app word *or* imports `@/lib/snippets`. A primitive
  takes its labels as required props and the caller passes the snippets in.

**And the rule with teeth: rewording must never fail a test.** A test asserts
*which* snippet a thing shows by importing it, never by copying what it says.

## Consequences

**What it buys.** Rewording anything is one edit under `src/lib/snippets/en/`
and the suite stays green. A route that renders words — `not-found.tsx` — can
sit above the feature slices without reaching into one, which is why the module
is in `src/lib/` rather than in a slice.

**What it costs.** An indirection on every label, and a module that exists
before there is a second language to justify it.

**What is guarded, and what is not.** The `snippets/en` half is enforced outright:
`snippets.test.ts` fails if any file outside the module names that path in a
specifier.

The half that matters — no test copies out what a snippet says — is proven by
running the app's words away. `npm test` runs two Vitest projects over the same
files: `suite`, and `reword`, in which `@/lib/snippets` resolves to a generated
module whose every string has become `«reworded:notFound.body»`. A test that
asserts *which* snippet a thing shows passes both, because it reads the same
scrambled value the component does. A test that copied a word fails `reword`.
There is no heuristic left to fool.

That gate replaced one. V2 planted three violations against the string-matching
guard this record originally claimed was enough: a whole quote under `src/`,
which it caught; the same quote in a test file at the repo root, which it never
read; and `getByText(/does not exist/)`, half of `notFound.body`, which it could
not see because it matched whole fragments only. The suite was green at 53 tests
with two of them planted, and rewording turned both red. **"Both are enforced"
was the sentence this paragraph used to end on, and it was not true.**

**V3 narrowed the advisory to whole words, and that was a fix rather than a
weakening.** It matched a snippet's text by raw substring, so once the panel's
words existed it read `panel.autoFeel` as a copy of `Feel` and the ordinary
English word *nothing* as a copy of `thin` — both legitimate, both rejected. It
now requires the fragment to stand as its own word. A planted `{ name:
'Cowbell' }` still fails the advisory *and* fails `reword`, which is the gate
that matters; what the narrowing gives up is a snippet word glued to a suffix
inside a quoted string, such as `'Hi-Hats'`, which matches no rendered label and
is dead text rather than a working copy. An advisory that cries wolf gets
widened around, and that is worse than one with a named blind spot.

**V3 also pointed it at the design system.** This record has always said no file
under `src/components/` may hold an app word or import `@/lib/snippets`, and
until V3 nothing checked it. `snippets.test.ts` now fails if any design-system
component names a snippet word or writes a specifier ending `/lib/snippets`,
with a count assertion keeping the scan non-vacuous. It reads the real words in
both projects, so unlike a guard in `src/app/theme.test.ts` it is not silently
disarmed by the scrambler.

`snippets.test.ts` stays, demoted to an advisory: it names the file and the word
for a whole-fragment copy, which is a better error message than a missing DOM
node. It imports `./index` relatively, which the plugin does not intercept, so it
reads the real words in both projects and reports a whole copy in each — only the
specifier `@/lib/snippets` is scrambled, which is the one a caller is allowed to
write anyway. It is no longer widened — its length floor, its `src/`-only scan and its
whole-fragment match are covered by the `reword` project now.

The *component* half — that no new inline string is introduced — is only
partly guarded. `src/app/routes.test.ts` parses each route with the TypeScript
compiler API and rejects JSX text, inline accessible names and inline metadata
words. It does **not** catch a string literal reached through an expression
container or a local constant (`const heading = 'Funky Drummer'`, then
`<h1>{heading}</h1>`). Settling that means inverting the guard — deny every
letter-bearing string literal in a route file, allow a named set of positions
such as `className` and `href` — and that belongs to the change that first adds
a feature route, where the exposure actually is.

## Alternatives considered

- **Strings inline, extracted when a second language arrives** — the extraction
  never happens on its own, and by then every test that quoted a sentence has to
  be found and rewritten.
- **A snippets module inside each feature slice** — a route may not import a
  slice's internals, so app-wide wording would have nowhere to live.
- **An i18n library** — buys plurals, dates and locale negotiation that nothing
  in this app needs yet, and the rule that matters here is about *where a word
  lives*, which no library enforces.
