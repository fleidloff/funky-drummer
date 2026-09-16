# V3. The front panel — tech spec

## Contracts

Frozen. Every track builds against these, so no track waits on another for a
name.

### The surface vocabulary — `src/app/globals.css`

A named vocabulary of surfaces, defined once under `@theme` for light and
redefined inside the existing `@media (prefers-color-scheme: dark)` block. **No
component names a colour**; every one of them reads a variable, which is what
makes the light theme one file rather than twenty.

```css
--color-bezel            /* the dark shell the metal panel is set into      */
--color-metal-top        /* brushed panel, gradient top stop                */
--color-metal-bottom     /* brushed panel, gradient bottom stop             */
--color-metal-grain      /* the brush line; an rgba, not an opaque colour   */
--color-metal-edge       /* the 1px highlight along a raised metal edge     */
--color-well             /* the inset recess the pad grid sits in           */
--color-well-edge        /* the inner shadow that makes the recess read     */
--color-engrave-field    /* the dark field the nameplate's letters sit in   */
--color-engrave-ink      /* the amber of an engraved letter                 */
--color-etch             /* a small etched label on bare metal              */
--color-etch-shadow      /* the bevel under an etched letter                */
--color-steel-top        /* knob body, fader thumb, momentary button        */
--color-steel-bottom
--color-tick             /* one scale tick on metal                         */
--color-lamp-amber       /* a lit amber backlight                           */
--color-lamp-amber-off   /* the same button, unlit                          */
--color-lamp-green       /* a lit green backlight                           */
--color-lamp-green-off
--color-lamp-ink         /* the label printed on a lit button               */
--color-lamp-ink-off

--shadow-raised          /* a part standing off the panel                   */
--shadow-recessed        /* a part sunk into it                             */
--shadow-glow-amber      /* the halo a lit amber pad throws                 */
--shadow-glow-green
```

**Light is not a second palette, it is brighter metal.** `--color-metal-*`,
`--color-steel-*`, `--color-well`, `--color-etch*` and `--color-tick` change
between the two. The lamps, the engraved amber and the green do not.

**The recipes are not restricted to gradients.** That was frozen here and
reversed mid-build once the panel was rendered and seen; `spec.md` records why.
They now use inline `feTurbulence` noise as a data URI, specular sweeps,
`background-blend-mode` and layered inset shadows, and the vocabulary grew two
recipes the look needed — `surface-collar` and `button-steel`.

Composite recipes — the brush grain, the knob dish, the pad glow, the bezel —
are `@utility` classes in the same file (`surface-metal`, `surface-well`,
`surface-steel`, `lamp-amber`, `lamp-green`, `engraved`, `etched`). A component
applies one of those plus ordinary Tailwind utilities for size and spacing. Two
reasons: the gradient stacks are unreadable as arbitrary values inline, and both
themes then live in the one file the previous paragraph promised.

### `src/components/tokens.ts`

```ts
export type Space = 0 | 1 | 2 | 3 | 4 | 6 | 8   // unchanged
export type Radius = 'panel' | 'control'        // unchanged
export type Tone = 'amber' | 'green' | 'steel'
export type Columns = 2 | 4
```

### The primitives

Every one of them is a function of its props. None imports `@/lib/snippets`,
none holds an app word, none knows what a groove is. Labels arrive as required
props.

```ts
// layout/  — arranges children, renders no content
function Stack(props: { gap: Space; children: ReactNode }): ReactNode          // exists
function Row(props: { gap: Space; align?: 'start' | 'center' | 'end' | 'between'
                      children: ReactNode }): ReactNode
function Grid(props: { columns: Columns; gap: Space; children: ReactNode }): ReactNode
function Split(props: { gap: Space; start: ReactNode; end: ReactNode }): ReactNode
function PageFrame(props: { children: ReactNode }): ReactNode

// surfaces/ — a background other content sits on
function MetalSurface(props: { radius: Radius; screws?: boolean
                               children: ReactNode }): ReactNode
function Well(props: { children: ReactNode }): ReactNode
function EngravedPlate(props: { children: ReactNode }): ReactNode

// typography/ — text styling, nothing else
function EngravedText(props: { size: 'title' | 'caption'
                               children: ReactNode }): ReactNode
function EtchedLabel(props: { size: 'control' | 'scale'
                              children: ReactNode }): ReactNode

// display/ — renders a value read-only
function Readout(props: { children: ReactNode }): ReactNode
function TickArc(props: { count: number }): ReactNode
function KnobFace(props: { angle: number }): ReactNode      // the turned cap, in SVG
function ThumbFace(): ReactNode                             // the fader thumb, in SVG
function TickBar(props: { count: number }): ReactNode
function Glyph(props: { name: 'speaker' }): ReactNode        // aria-hidden, inert

// controls/ — the user presses, toggles or drags it
type ContinuousProps = {
  label: string        // the accessible name; the caller passes the snippet
  value: number
  min: number
  max: number
  step: number
  valueLabel: string   // already formatted — '96 BPM', '54%'
  scaleStart: string
  scaleEnd: string
  onChange: (value: number) => void
}
function Knob(props: ContinuousProps): ReactNode
function Fader(props: ContinuousProps): ReactNode

function BacklitButton(props: { label: string; tone: Tone; lit: boolean
                                pressed?: boolean; pulsing?: boolean
                                onToggle: () => void }): ReactNode
function MomentaryButton(props: { label: string; tone: Tone
                                  onPress: () => void }): ReactNode
function Pad(props: { label: string; lit: boolean; onToggle: () => void }): ReactNode

// controls/useContinuous.ts — ContinuousProps lives here, with the shared
// drag-and-keyboard mechanism both controls are built on
function useContinuous(props: ContinuousProps, axis: 'vertical' | 'horizontal'): {
  ratio: number
  slider: Record<string, unknown>   // the role, the four ARIA values, the handlers
}

// controls/dragValue.ts — plain function, no DOM
function dragValue(args: { start: number; deltaPx: number; min: number
                           max: number; step: number; travelPx: number }): number
```

`Knob` and `Fader` are `role="slider"` with `aria-label`, `aria-valuenow`,
`aria-valuemin`, `aria-valuemax` and `aria-valuetext={valueLabel}`, focusable,
and driven by arrow keys as well as by drag. `BacklitButton` and `Pad` are
`<button aria-pressed>`. `MomentaryButton` is a plain `<button>` — it latches
nothing, so it carries no pressed state.

### The slice's surface — `src/features/panel/index.ts`

```ts
export { Panel } from './components/Panel'
```

One export. `src/app/page.tsx` renders it and nothing else.

### The words — `src/lib/snippets/en/panel.ts`

```ts
export const panel = {
  title, subtitle,
  swing, tempo, feel,
  play, stop, tapTempo, autoFill, autoFeel,
  thin, fat,
  kick, snare, hiHat, ride, cowbell, shaker, toms, crash,
} as const
```

Re-exported from `src/lib/snippets/index.ts` as `panel`. The knob scale ends
(`50`, `67`, `60`, `180`) and the readout suffixes (`%`, `BPM`) are notation, so
per ADR 0003 they stay in the feature's `lib/format.ts`.

## Settled without a question

* **The panel's numbers come from `docs/music.md`, not from the mockups.**
  Tempo 60–180, default 96. Swing 50–66.7%, default 54. Feel 0–1, default 0.5,
  shown as a percentage. The two mockups draw different scales and neither
  agrees with the document.
* **Drag geometry:** 160px of travel sweeps the full range on both controls, so
  they take the same hand movement — but each drags along its own axis: the knob
  vertically, the fader horizontally along the track it is drawn on. Arrow keys
  move one `step`, Page keys ten, Home/End go to the ends. *Whether 160px is
  right needs a look, not a test.*
  **This line was frozen as "vertical on both" and corrected mid-build**, once
  Track E pointed out it made the fader's thumb move at ninety degrees to the
  finger. `spec.md` records the decision.
* **The feature holds its dummy state in one hook**, `hooks/usePanelState.ts`,
  returning the values and the setters the regions need. Nothing is persisted —
  persistence is `Project.md`'s phase 6.
* **Feature components are grouped by screen region**, which the decided layout
  names for us: `components/steering/` is the left column and
  `components/surface/` the right one, with `components/Panel.tsx` above both.
* **`src/components/structure.test.ts` needs no change** — the five role folders
  are the five this change fills.

## Epics

Two. The design system is provable on its own; the screen is what proves it was
the right set.

### Epic 1 — The design system

Five tracks, disjoint by role folder, all able to start at once because the
contracts above freeze every name they share.

#### Track A — The surface vocabulary

* **Role:** `implementer`
* **Owns:** `src/app/globals.css`, `src/components/tokens.ts`,
  `src/components/tokens.test.ts`
* **Needs to start:** the contracts

1. **red** — `tokens.test.ts` pins `Tone` and `Columns` closed with
   `@ts-expect-error`, the way `Space` already is. Per `docs/testing.md` this
   guard is held by `npm run build`, not by Vitest, and the test says so.
2. **green** — widen `tokens.ts`.
3. **green** — write the vocabulary and the `@utility` recipes into
   `globals.css`, light under `@theme`, dark in the existing media block.
4. **red** — a structural test reads `globals.css` and asserts every variable
   named in the contract is defined in both blocks, and that the dark block
   redefines exactly the metal set and nothing else. This is the guard that
   catches a light theme drifting into a second palette.

#### Track B — Layout

* **Role:** `implementer`
* **Owns:** `src/components/layout/{Row,Grid,Split,PageFrame}.tsx` and their
  tests. `Stack.tsx` is untouched.
* **Needs to start:** `Space` and `Columns` from the contracts

1. **red** — each primitive renders its children in order, and takes its spacing
   only through `Space` — a raw length must not type-check.
2. **green** — write them.
3. **red** — `Split` renders `start` before `end` in the DOM at every width, so
   the phone stack and the desktop split are the same document order.
4. **green** — one media query in `Split`. *That it reads as two columns above
   the breakpoint needs a look; jsdom does no layout.*

#### Track C — Surfaces

* **Role:** `implementer`
* **Owns:** `src/components/surfaces/{MetalSurface,Well,EngravedPlate}.tsx`
  and their tests
* **Needs to start:** the `@utility` names from the contracts

1. **red** — each renders its children and applies its recipe class.
   **The screws this step originally required were cut mid-build** at Fred's
   request; `spec.md` records it, and the prop and the `screw` recipe went with
   them rather than staying as an option nobody passes.
2. **green** — write them.

#### Track D — Typography and display

* **Role:** `implementer`
* **Owns:** `src/components/typography/{EngravedText,EtchedLabel}.tsx`,
  `src/components/display/{Readout,TickArc,TickBar,Glyph}.tsx`, and their tests
* **Needs to start:** the contracts

1. **red** — `TickArc` and `TickBar` render exactly `count` ticks and are
   hidden from the accessibility tree; `Glyph` likewise. `Readout`,
   `EngravedText` and `EtchedLabel` render their children and nothing else.
2. **green** — write them.

#### Track E — Controls

* **Role:** `implementer`
* **Owns:** `src/components/controls/{dragValue.ts,Knob,Fader,BacklitButton,
  MomentaryButton,Pad}.tsx` and their tests
* **Needs to start:** `Tone` and the control contracts

1. **red** — `dragValue` as a plain function: it clamps at both ends, snaps to
   `step`, and a drag of `travelPx` from `min` lands exactly on `max`. No DOM.
2. **green** — write it.
3. **red** — `Knob` and `Fader` expose `role="slider"` with the four ARIA values
   and `aria-valuetext`; arrow keys move one step and stop at the bounds;
   a pointer drag calls `onChange` with what `dragValue` computes.
4. **green** — write them over `dragValue`.
5. **red** — `BacklitButton` and `Pad` report `aria-pressed` from `lit` and call
   `onToggle` once per press; `pulsing` adds the animation only when `lit`;
   `MomentaryButton` has no `aria-pressed` and lights only while held.
6. **green** — write them.

#### Track F — The words

* **Role:** `implementer`
* **Owns:** `src/lib/snippets/en/panel.ts`, `src/lib/snippets/index.ts`
* **Needs to start:** the contracts. It shares no file with A–E.

1. **green** — write `panel.ts` and re-export it. `snippets.test.ts` and the
   `reword` project pick the new area up with no edit, because the index is
   parsed rather than listed.

### Epic 2 — The panel

#### Track G — The slice

* **Role:** `implementer`
* **Owns:** `src/features/panel/**`
* **Needs to start:** every primitive from Epic 1, and Track F's `panel` area

1. **red** — `lib/format.ts` as plain functions: a tempo renders `96 BPM`, a
   swing `54%`, a feel `50%`. Notation, so asserted literally.
2. **green** — write them.
3. **red** — render `Panel` and assert the dummies through the accessible
   surface, importing snippets for every name rather than quoting one:
   eight pads all pressed at first and one unpressing on click; `PLAY` swapping
   to `panel.stop` and back; `AUTO FILL` and `AUTO FEEL` latching; `TAP TEMPO`
   carrying no pressed state; the two knobs and the fader starting at the
   `music.md` defaults and moving one step on an arrow key.
4. **green** — write `hooks/usePanelState.ts`, the two region folders and
   `components/Panel.tsx`, composing primitives only. **No `className` appears
   anywhere in the slice** — `npm run lint` is what holds that.
5. **red** — render `Panel` twice with `prefers-color-scheme` stubbed either
   way and assert it renders in both. *That light reads as `app.jpg`'s brighter
   metal needs a look.*

#### Track H — The route

* **Role:** `implementer`
* **Owns:** `src/app/page.tsx`
* **Needs to start:** Track G's `index.ts`

1. **green** — `page.tsx` renders `<Panel />` from `@/features/panel` and holds
   no word of its own, so `src/app/routes.test.ts` keeps passing unchanged.

## Waves

* **Wave 1 (parallel):** Track A, B, C, D, E, F — six tracks, no shared file,
  every shared name frozen in `## Contracts`.
* **Wave 2:** Track G — needs all of Epic 1.
* **Wave 3:** Track H — needs G's `index.ts`.

## Checks

* `npm test` — both Vitest projects, `suite` and `reword`
* `npm run lint` — the only thing holding the `className` ban in the slice
* `npm run build` — the only thing holding the closed `Tone` and `Columns` types
* A look, at a phone width and a desktop width, in both colour schemes. Four
  screenshots, and they settle the three `needs a look` bullets in `spec.md`.

## Risks

* **jsdom has no `setPointerCapture`.** The drag tests would throw on it.
  Held by feature-detecting the call in `Knob`/`Fader` and listening on
  `window` for move and up, which is the shape that survives a pointer leaving
  the element anyway.
* **Tailwind v4 `@utility` inside `@theme`-driven variables.** The recipes read
  `var(--color-metal-top)`, which resolves at use time, so the dark media block
  swaps them with no rebuild. `globals.css` already proves the pattern for
  `--color-bg`; Track A's step 4 is what keeps it proven.
* **Eighteen new primitives is the real exposure.** The failure mode is a
  component nobody composes — built to a guessed contract, tested against
  itself, and wrong. Held by Wave 2: Track G composes every one of them, and a
  primitive that does not fit is a Wave 1 bug found before the change lands.
* **The transient lint fixtures under `src/features/zonefixture-*`** race a tree
  walker; Track A adds one more walker (`globals.css` only, not `src/`), so it
  does not widen the window. Already a candidate row in `specs/features.md`.
