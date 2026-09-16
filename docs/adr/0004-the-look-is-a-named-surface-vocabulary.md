# 0004. The look is a named surface vocabulary, and no component names a colour

- **Status:** ✅ Accepted
- **Date:** 2026-09-16

## Context

The app is a skeuomorphic drum machine: brushed metal, an inset well, engraved
lettering, steel knobs, backlit pads. It ships in two colour schemes from the
first screen — `docs/concept/app2.png` is the dark one, `docs/concept/app.jpg`
the light one — and the difference between them is almost entirely **the metal**.
Everything else, the amber backlight and the green transport lamp included, is
the same in both.

V3 built eighteen primitives at once. Had each of them carried its own light and
dark look, "almost nothing changes between the themes" would have been a
statement spread across eighteen files, kept true by review alone. The first
time one of them drifted, nobody would have noticed, because there is no screen
that shows both schemes at once.

The forcing question was where the second scheme lives, and it had to be settled
before the first component was written rather than after.

## Decision

**The look is a vocabulary of named surfaces in `src/app/globals.css`, and no
file under `src/components/` or `src/features/` names a colour.**

- **Twenty CSS custom properties name the surfaces**, not the colours:
  `--color-metal-top`, `--color-well`, `--color-engrave-ink`, `--color-tick`,
  and so on. They are defined once under `@theme static` and the
  **fifteen-name surface set** is redefined inside
  `@media (prefers-color-scheme: dark)`. The **five-name lit set** — the
  engraved field, the engraved amber, the two lamps and the ink printed on a lit
  button — is defined once and never redefined. That split *is* the sentence
  "light differs from dark in the metal and in nothing else", written where a
  test can read it.
- **Composite looks are `@utility` recipes in the same file** — `surface-metal`,
  `surface-well`, `surface-steel`, `surface-collar`, `surface-field`,
  `button-steel`, `lamp-amber`,
  `lamp-amber-off`, `lamp-green`, `lamp-green-off`, `lamp-pulsing`, `engraved`,
  `etched`. A component applies one of these plus ordinary Tailwind utilities
  for size and spacing. The gradient stacks that make metal look like metal are
  unreadable as arbitrary values inline, and putting them in the components
  would put the theme back in eighteen files.
- **A component may not name a palette colour, write a literal colour, use a
  `dark:` variant, or read `prefers-color-scheme`.** Those four prohibitions are
  what make the rule mechanical rather than aspirational.
- **The scheme is the operating system's**, read through `prefers-color-scheme`.
  There is no theme control, because `app2.png` draws none. A toggle, if it is
  ever wanted, is one attribute on `<html>` and no change to any component.

## Consequences

**What it buys.** Changing what the app looks like in either scheme is an edit
to one file. Adding a component is picking from a vocabulary that already works
in both schemes, so a new primitive cannot be born half-themed. And the claim is
checked rather than believed: `src/app/theme.test.ts` reads `globals.css` and
the whole UI tree from disk and fails if a surface name goes missing from either
block, if a lit name appears in the dark block, if a recipe disappears, if a
recipe writes a literal colour, or if any component under `src/components/` or
`src/features/` names a palette colour, writes a hex value, or branches on the
scheme itself.

**What it costs.** An indirection on every surface, and a CSS file that has to
be read to know what a component will look like. A component author cannot
reach for `bg-zinc-800` even once, which is exactly the friction the rule is
for, and the honest version of the cost is that the vocabulary has to grow
before the component that needs it can be written.

**What it rules out.** Per-component theming, a second theme that is a different
palette rather than different metal, and any runtime colour decision in
JavaScript.

**What is not covered.** That the light metal actually *reads* like `app.jpg`,
and that the dark one reads like `app2.png`, is a judgement no test makes. The
structural guard proves the mechanism is wired correctly and says nothing about
whether the result is handsome. That stays a look, and V3's `## Done when`
records it as one.

## Alternatives considered

- **`dark:` variants in each component** — self-contained files, but the light
  theme becomes twenty scattered decisions and "almost nothing changes" becomes
  twenty places to keep in step. No guard could state the rule, because there
  would be no one place the rule lived.
- **A theme prop threaded down the tree** — explicit and trivially testable, but
  every component grows a prop it does not need, and the whole tree re-renders
  to change a look CSS swaps for free.
- **Texture images per theme** — closest to the mockups' photographic grain
  fastest, but it ships two assets per surface, doubles on every new surface,
  and needs the tiling re-checked at every size.
- **A filter element per surface** — an `feTurbulence` node in the markup for
  every piece of metal. A live filter per surface is the expensive thing on a
  phone, and this panel has a lot of surfaces.

## What changed once it was seen

The decision above survived first contact; the technique inside it did not.
V3 first restricted the recipes to plain gradients, on the reasoning that they
ship no asset and swap themes for free. Rendered, the panel was flat — the metal
read as grey stripes and the knobs as circles — and that reasoning turned out to
be about cost rather than about the result.

**What it cost to find out was the whole lesson: nothing had looked at the page.**
The build was green, every guard passed, and the thing was wrong in a way no
test in this repo can see. V3 added Playwright and a four-line script so the
panel can be screenshotted at two widths in both schemes, which is now the only
way a `needs a look` bullet actually gets looked at.

The recipes now layer a stretched `feTurbulence` noise as an inline data URI for
the brush grain, an angled specular sweep, and multi-stop tone gradients, with
`background-blend-mode` combining them and layered inset shadows for depth. The
noise is a *static image*, not a live filter, which is why it escapes the
alternative rejected above. Two recipes joined the vocabulary at the same time —
`surface-collar`, the dark seat a knob sits in, and `button-steel`, a dark
machined button — because the look needed them and a component may not improvise
one.

**None of that touched a single component.** Components apply recipe names, so
the entire visual rebuild was one CSS file plus geometry. That is the clearest
evidence the decision was right, and the reason it is recorded here rather than
superseded.
