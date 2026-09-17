# 0008. The drummer is domain, the transport is a slice, the route joins them

- **Status:** ✅ Accepted
- **Date:** 2026-09-17

## Context

[music.md](../music.md)'s *Where to change what* table planned two feature
slices: `src/features/groove-library/` and `src/features/transport/`. V5 built
the first audible path and both rows turned out to be wrong, for two different
reasons that only appear once the code exists.

**A feature cannot import a feature.** [architecture.md](architecture.md) has no
sideways arrow and `eslint.zones.mjs` zone 3 enforces it. The transport needs the
groove library, and the panel's Play button needs the transport, so the planned
shape had two illegal imports in it.

**`src/lib/` must be pure.** [coding-guidelines.md](coding-guidelines.md) sets
four bars for a module there, and the first is absolute: a function of its
arguments, no state, no clock, no DOM. An `AudioContext`, a sample cache and a
25 ms scheduling loop fail it. So the drummer could not simply all move down.

The change had to put the line somewhere, and wherever it went, every later
stage, groove and control would follow it.

## Decision

**The line is purity, not subject matter.**

Everything about what the drummer plays is domain knowledge and pure, so it
lives in `src/lib/`:

| | |
| :-- | :-- |
| `src/lib/groove/` | the ASCII grid parser of [ADR 0001](0001-a-groove-is-an-ascii-grid.md) |
| `src/lib/grooves/` | the library, one file per groove |
| `src/lib/pipeline/` | the stages of [ADR 0007](0007-the-drummer-is-a-pipeline-of-same-signature-stages.md) |
| `src/lib/time/` | step and offset to seconds |

Everything that touches a clock or a device is impure and lives in one feature
slice, `src/features/transport/`: the `AudioContext`, the sample cache, the
lookahead loop, and the app's play state.

**The two slices never name each other. `src/app/page.tsx` joins them**, and it
is the only file in the tree that mentions both:

```tsx
const controls = useTransport()
return <Panel {...controls} />
```

`PanelControls` and `TransportControls` are declared separately in their own
slices and agree **structurally**, never by import. That one spread is where
they meet, so `tsc` turns a drift into a build error.

`docs/music.md`'s *Where to change what* table is corrected to match, and split
into what exists and what does not.

## Consequences

**The drummer is testable in Node, with no browser and no fakes.** Around a
thousand of the suite's tests run against pure functions. The parser, the ten
grooves, the pipeline and the step arithmetic need no `AudioContext` and no
injected clock — only the scheduler and the player do.

**Every later stage has an obvious home, and it is not a feature.** Swing,
humanize, fills, Feel and redistribution are all pure bar-to-bar functions, so
they go to `src/lib/pipeline/stages/`. The corrected table says so in advance,
which is the point of correcting it.

**A groove is data, not a feature.** Adding one is adding a file under
`src/lib/grooves/` and a line in its `index.ts`, with no slice, no door and no
zone.

**Neither slice is removable without editing the route body.** This is the real
cost and it is worth stating plainly. [architecture.md](architecture.md)'s
standard is that deleting a slice, its route folder and its one registration
entry leaves the app building. Here the route *composes* the two rather than
registering them, so deleting either one is a two-line rewrite of `page.tsx`. For
a single-route app that is the honest shape; a second route would change the
calculation.

**The structural agreement is held by exactly one line and nothing else.** Zone 3
proves the slices do not import each other. It cannot prove their two control
types still match. Delete the spread in `page.tsx` and they are free to diverge
unnoticed, and no test in the repo would say so.

## Alternatives considered

- **The transport inside the panel slice** — no new slice, no route wiring, and
  the state stays where V3 put it. It makes the panel slice the app: delete the
  folder and the drummer goes with it, which is the one standard
  architecture.md exists to protect.

- **The scheduler in `src/lib/`, next to the pipeline** — keeps the whole drummer
  in one place and breaks the first of the four bars for a module there. The
  purity rule is what makes everything else down there trivially testable, and
  spending it on one module would be the last time it meant anything.

- **A shared `src/lib/` module holding the control state, imported by both
  slices** — removes the structural-agreement risk by giving the two types one
  definition. It also moves product state, which is knowledge about this app
  rather than about the domain, below the app — failing the fourth bar in
  coding-guidelines.md, the one that is explicitly the one that gets stretched.
  Rejected to keep that bar meaning something, at the price named above.

- **Keeping `src/features/groove-library/` as planned** — a slice the transport
  may not import, holding pure data that has no reason to be a slice.
