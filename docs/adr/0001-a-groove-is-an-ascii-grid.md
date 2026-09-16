# 0001. A groove is an ASCII grid

- **Status:** ✅ Accepted
- **Date:** 2026-09-16

## Context

[Project.md](../concept/Project.md) says grooves are hand-authored on a
16th-note grid where each instrument is switched on or off per step, and that
this is *all* that is entered — velocity, micro-timing, fills and variation are
the app's job. It also says the library is content that grows over the life of
the project, from ten grooves to a hundred.

So the groove format is read and written by a human, repeatedly, for years. That
is the constraint that decides it. A format that is comfortable for a parser and
awkward for a person will slow down the only part of this project that has no
ceiling.

[music.md](../music.md) already notates ten grooves as ASCII grids, because that
is how the research reads and how a drum machine looks. Having a second,
different representation in code would mean every groove exists twice, in two
notations, with nothing checking that they agree. The library would drift from
its own documentation on the first edit.

There is a second thing the grid has to carry. music.md's model gives the
drummer permission to thin a groove, displace a backbeat, and redistribute a
muted voice — and then says some notes are exempt from all three. Those anchors
are part of the groove, not part of the engine, so the author has to be able to
write them down.

## Decision

**A groove is authored as an ASCII grid, and that grid is the input format in
code.** The notation in music.md is not documentation of the data; it *is* the
data.

A groove is an object with metadata and one string per voice per bar:

```ts
{
  id: 'cold-sweat',
  name: 'Cold Sweat',
  after: 'Clyde Stubblefield',
  tempo: 108,
  swing: 52,
  secondaryOne: 2,
  bars: [
    {
      hihat: 'x x x x x x x x x x x x x x x x',
      snare: '. . . . # . . o . o . . . . # .',
      kick:  'X . . . . . x . . . . . . . . .',
    },
    {
      hihat: 'x x x x x x x x x x x x x x x x',
      snare: '. o . . # . . o . o . . # . . .',
      kick:  '. . x . . . . . . . . . x . . .',
    },
  ],
}
```

### The lanes

Nine, one per voice. `tom1` and `tom2` are separate lanes that share one mute
button, because a tom part needs two pitches and the panel has eight buttons.

`kick` · `snare` · `hihat` · `ride` · `cowbell` · `shaker` · `tom1` · `tom2` ·
`crash`

**An omitted lane is silent.** A groove writes only the lanes it uses, so the
common case is three lines rather than nine blank ones.

### The symbols

One character per step. Whitespace is insignificant and exists so the grid lines
up under a counting ruler; after it is stripped, a lane must be exactly sixteen
characters.

| Symbol | Meaning | Valid on |
| :-- | :-- | :-- |
| `.` | rest | every lane |
| `o` | ghost | every lane |
| `x` | normal | every lane |
| `X` | accent | every lane |
| `#` | anchored accent | every lane |
| `O` | open hi-hat, at accent level | `hihat` |
| `B` | ride bell, at accent level | `ride` |

Anything else is a parse error, including a lowercase `b` or a lane of the wrong
length. A typo fails loudly rather than becoming a rest.

**`o`, `x` and `X` are levels, not volumes.** The grid says a note is
structurally a ghost; [music.md](../music.md) says what a ghost is worth. The
author never types a number.

**`#` is the one that carries meaning beyond sound.** It marks a note the
drummer may not thin away, may not displace, and may not drop when its voice is
muted. It is how Cold Sweat says that its backbeat lives on the "&" of 4 and
must stay there.

### The metadata

| Field | Meaning |
| :-- | :-- |
| `id` | Stable kebab-case key. Never reused, never renamed |
| `name` | What the UI would show |
| `after` | The drummer the figure is modelled on, or omitted |
| `tempo` | The groove's own tempo in BPM |
| `swing` | The groove's own swing percentage |
| `secondaryOne` | 1-based bar whose downbeat is a secondary One, or omitted |
| `bars` | One or two bar objects. Never more |

`tempo` and `swing` record what the groove is, not what the transport does with
it. [music.md](../music.md) decides that the swing knob always wins, so `swing`
is read by a human and by nothing else; `tempo` is the groove's own tempo and
the transport's use of it is that document's call, not this one.

## Consequences

**The library is reviewable in a diff.** A groove change shows up as a changed
character in a line that looks like a drum machine. Fred reads the diff; this is
the format that makes that worth doing.

**music.md and the code cannot disagree**, because a grid pasted out of the
document parses. The ten grooves in Part 2 are the seed library, not a sketch of
one.

**The parser is the validator.** Lane length, symbol validity and per-lane symbol
restrictions are all checked in one place, and a malformed groove never reaches
the scheduler. Authoring errors surface at load, not as a missing note four bars
in.

**Anchors live with the notes they anchor.** No second file, no index list to
keep in step with a grid that moved.

**It costs a character-level encoding for two orthogonal things.** A symbol
carries both a loudness level and, on two lanes, an articulation — so `O` is
"open *and* accented" and there is no notation for a quiet open hat. That is
deliberate: the grid stays one character wide and readable at a glance, and the
articulations funk actually uses at low volume are ghost notes, which are a snare
thing.

**`o` and `O` differ only in case**, on lanes that sit next to each other. The
parser rejects `O` outside `hihat`, so the dangerous direction — a hi-hat ghost
typed as an open hat — is the one that fails. The reverse, a snare open-hat
typo, is caught too.

**Sixteen steps is baked in.** A triplet groove, a half-time shuffle notated as
triplets, or any meter but 4/4 cannot be written down. That matches
[Project.md](../concept/Project.md), which puts other time signatures out of
scope, and music.md, which reaches a shuffle by warping the grid with swing
rather than by changing it.

**Two bars is the ceiling.** A four-bar figure is not authorable. Length beyond
two bars is the drummer's job, not the grid's.

## Alternatives considered

- **A per-step object array** (`{ step: 4, voice: 'snare', level: 'ghost' }`) —
  the obvious typed representation, and unreadable in bulk. A sixteen-step
  groove across three voices becomes forty lines in which the shape of the
  groove is invisible. It optimises for the parser, which is written once, over
  the author, who writes a hundred grooves.

- **A bitmask or step-index array per voice** (`kick: [0, 3, 6, 10]`) — compact
  and impossible to proofread. It also has nowhere to put a level, so velocity
  would need a parallel array, which is the drift problem again in miniature.

- **MIDI files** — the format drummers' tools already speak, and it carries far
  more than the concept wants: absolute velocities, absolute timing, note
  lengths. Project.md is explicit that velocity and micro-timing are the app's
  job, so a MIDI groove would arrive pre-decided and the engine would have to
  throw most of it away. It is also not diffable.

- **The grid as documentation, a typed structure as code** — two sources of
  truth for the same ten grooves, with a hand-maintained correspondence. This is
  the thing the decision exists to prevent.

- **Anchors as a separate `anchors: [...]` field** — keeps the symbol set to five
  characters, at the cost of a list of step indices that has to be re-checked
  every time a note moves. Anchors are a property of a note, so they belong on
  the note.
