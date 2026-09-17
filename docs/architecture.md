# Architecture

This document holds the model and the reasoning: how the tree is shaped and why.
The rules that follow from it — what you may import from where, where a file
goes, what a linter will reject — live in one place:

**[coding-guidelines.md](coding-guidelines.md)** — the concrete rulebook, every
rule tagged *lint-enforced* or *human-checked*. Read that before writing code.

See also [testing.md](testing.md) for what must be tested, and **[adr/](adr/)**
for why the shape is this one — the decisions behind it, in the order they were
taken, including the ones that have since been replaced.

## The model

The app is built as vertical feature slices. Two directories carry the weight:

- `src/components` — the design system: generic, reusable building blocks.
- `src/features/<feature>` — one self-contained feature per folder.

Everything else is glue: `src/app` for routing, `src/lib` for code that sits
below the app.

A feature owns everything it needs in one folder — its UI, its hooks, its state,
its data and its business logic — and exposes one public surface, `index.ts`.
Its tests live inside it. The point of the shape is that a slice is a unit you
can reason about, hand to someone else, or delete, without tracing it through
the rest of the app.

The design system is the other half of that bargain. Its components are reusable
*by construction*: driven by props, holding no app state, knowing no domain
concept. A primitive that has learned what a groove is, or what the Feel slider
does, is no longer a primitive, and the feature it learned about is no longer
removable.

## Why the dependency direction is the load-bearing part

Almost every rule in the guidelines is one arrow in a graph the app is allowed to
draw. The direction is what makes the slices work:

- The design system may use shared utilities, but never a feature. That one-way
  dependency is what keeps it reusable.
- Features do not reach each other. There is no sideways arrow, so anything two
  slices need moves *up* into `src/lib` or `src/components` rather than making
  one slice a dependency of the other.
- `src/lib` is a leaf — it imports nothing from the app. That is what lets it
  hold knowledge the whole app shares without any of it depending on which
  feature is on screen.

The guidelines draw the full graph and name the ESLint zone behind each arrow.
Since V1 the zones exist and are tested rather than described — each one is
watched to reject a bad import and to accept a good one
([ADR 0002](adr/0002-zones-are-proven-against-real-fixtures.md)), because a rule
that has only ever been seen to pass is a comment.

```
src/app/         → a feature's index.ts, src/components/, src/lib/
a feature slice  → src/components/, src/lib/
src/components/  → src/lib/
```

Every pair not drawn is an error.

## The arrows inside a slice

The graph above is between directories. Inside a feature folder there is a
second graph the directories do not show: which of the slice's concerns may
reach which.

**No map is drawn yet, and that is correct for now.** A slice with two or three
concern folders does not need one; a reader holds it in their head. Draw one
when a slice has grown enough concerns that the reaching between them has
stopped being obvious — and until then, importing a sibling concern folder
directly is correct rather than a violation waiting for a rule.

There are two slices, and no folder in either has earned a door.

`src/features/panel/` is UI and nothing else. `components/` is grouped into the
two screen regions the layout names, `steering/` and `surface/`, with
`components/Panel.tsx` above both; `lib/` holds `format.ts`, `ranges.ts` and
`voices.ts`; `types.ts` and `index.ts` sit at the root, and there is no
`hooks/` and no `state/`, because `Panel.tsx` takes `PanelControls` as props and
holds nothing. The components reach `lib/` by relative path, which is what an
absent door means. Zone 6 would stop `lib/` reaching back.

`src/features/transport/` is the impure half. `lib/player.ts` owns the
`AudioContext` and the sample cache, `lib/scheduler.ts` owns the lookahead loop
and its bar planning, and `hooks/useTransport.ts` owns the play state, builds
the two `lib/` objects and drives the loop with an interval. The arithmetic both
`lib/` modules need is pure and sits outside the slice, in `src/lib/time/` and
`src/lib/pipeline/`. The one arrow a rule holds is zone 6: `lib/` may not import
the hook. That `useTransport.ts` is the only file in the slice constructing an
`AudioContext` or a timer is **review only**.

**The two slices do not know about each other, and the route is what joins
them.** `src/app/page.tsx` is the only file that names both: it calls
`useTransport()` and spreads the result into `Panel`. Zone 3 makes a direct
import between them an error. What zone 3 cannot check is that the two shapes
agree — `PanelControls` in `src/features/panel/types.ts` and
`TransportControls` in `src/features/transport/types.ts` are declared
separately and match structurally, never by import. `page.tsx` is the single
place they meet, so `tsc` turns a drift into a build error. Nothing else holds
it: delete that one line and the two types are free to diverge unnoticed.

When it is worth writing, this is the section it goes in, and three things have
to be true of it:

- **Each line names a file**, so the map can be re-measured rather than believed.
- **It says what holds each arrow** — a lint zone, a structural test, or nothing
  but review. "Review only" rows are the useful ones: a guard that follows
  measured growth leaves everything that has not grown unguarded, and naming
  which parts those are is the difference between a scope and an oversight.
- **The map describes the tree, not the other way round.** If a module here does
  not survive contact with a lint zone, a guard or a folder that moved, this
  section is what changes. A map that has drifted from the import graph is worse
  than no map, because it is believed.

**A map is how a reader groups the code; a door is what an import rule can
check.** The two rarely line up. A door can only ever be one folder's
`index.ts`, so a concern spanning three folders and four hooks cannot have one
even if it wants one.
[coding-guidelines.md](coding-guidelines.md#feature-slices) says on what terms a
folder earns a door.

**One rule about concern folders is worth stating before the first one exists:
a groove that reaches for a mechanism nothing has exercised is buying that
mechanism, not just adding a file.** A groove costs nothing in machinery while
it uses a mechanism that already works. The first groove to turn swing on, or
the first to want an open hi-hat choked, is not a data change however much it
looks like one.

## Every feature must be removable

This is the standard the shape exists to serve:

> Delete `src/features/<feature>/`, delete its route folder under `src/app`,
> remove its one registration entry — and the app still builds and runs.

Removability is a test of coupling, not a plan to delete anything. A feature
whose internals have leaked into the route, into the design system, or into a
sibling cannot be moved, rewritten or replaced in one step either — deletion is
just the cheapest way to notice.

What keeps it true: a feature's inbound references are countable on one hand —
its route(s) in `src/app`, and, where it must appear in shared UI, a single
registration point such as a nav entry. Its state, its types and its styles stay
inside the folder. Its consumers, tests included, know only its `index.ts`.

Before merging a feature, ask: could I `rm -rf` this folder and still get a clean
build? If not, something leaked, and the guidelines will name what.
