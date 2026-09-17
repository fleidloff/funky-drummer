# V4. The kit — tech spec

## Decided

* **Where the manifest lives — `src/lib/kit/`, not `src/features/kit/`.**
  `docs/music.md`'s "Where to change what" table plans the latter and the import
  zones rule it out: zone 3 forbids one feature importing another, and the
  transport feature has to read the kit. `docs/coding-guidelines.md` already
  names "one for the kit and its samples" as a `lib/` concern folder.
  **`docs/music.md`'s table row is amended by this change.**
* **How "it sounds James Brown funky" gets settled — a shortlist gate.**
  `musician` assembles 2–3 candidate kits and renders each into one two-bar funk
  loop with ffmpeg, samples mixed at fixed offsets, no engine needed. Fred plays
  them and picks. One round trip against the only criterion the suite cannot
  grade.
* **Where normalization happens — once, offline.** One pass while building this
  change, and the normalized files are what is committed. One copy in the repo,
  and the check is a measurement rather than a claim.
* **How the suite measures loudness — it shells out to ffmpeg.** Per file,
  failing with an install hint when ffmpeg is absent. It measures the committed
  files rather than a note about them, and there is no CI to break.
  *(The measure itself was `ffmpeg -af ebur128` integrated loudness until
  mid-build, when it turned out to be undefined on a one-shot — see
  `## Open — raised mid-build` below.)*

## Contracts

Frozen. Every track builds against these.

```ts
// src/lib/kit/voices.ts

export type Voice =
  | 'kick' | 'snare' | 'hihat' | 'ride'
  | 'cowbell' | 'shaker' | 'toms' | 'crash'

export type Articulation =
  | 'kick.hard'    | 'kick.soft'
  | 'snare.backbeat' | 'snare.normal' | 'snare.ghost' | 'snare.crossStick'
  | 'hihat.closed' | 'hihat.accent' | 'hihat.open' | 'hihat.pedal'
  | 'ride.bow'     | 'ride.bell'
  | 'cowbell.hit'
  | 'shaker.hit'
  | 'toms.rack'    | 'toms.floor'
  | 'crash.hit'

export declare const VOICES: readonly Voice[]
export declare const ARTICULATIONS: readonly Articulation[]
export declare function voiceOf(articulation: Articulation): Voice
```

```ts
// src/lib/kit/manifest.ts

export type SampleEntry =
  | { readonly kind: 'files'; readonly files: readonly string[] }
  | { readonly kind: 'substituted'; readonly by: Articulation; readonly why: string }

export type Kit = {
  readonly name: string
  readonly targetRmsDb: number
  readonly rmsWindowMs: number
  readonly gains: Readonly<Record<Voice, number>>
  readonly samples: Readonly<Record<Articulation, SampleEntry>>
}

export declare const KIT: Kit
```

* **`files` paths are served paths**, rooted at `/samples/`, e.g.
  `/samples/hihat/closed-1.ogg`. More than one file is a round-robin.
* **`gains` is the table in `docs/music.md` Part 3**, linear, eight entries.
* **`targetRmsDb`** is the one level every file is normalized to: RMS in dBFS
  over a fixed window anchored on the file's onset, shorter than the shortest
  sample. **Amended mid-build** — see `## Open — raised mid-build` below.
* **A `substituted` entry never points at another `substituted` entry.**

### On disk

```
public/samples/<voice>/<articulation>[-<n>].ogg
scripts/normalize-samples.mjs
docs/samples.md
```

## Epics

One epic. It ships one thing: a kit you can hear.

### Epic 1 — The kit

#### Track A — Find it and pick it

* **Role:** `musician`
* **Owns:** `specs/4-the-kit/candidates/` — the shortlist renders and the notes
  behind them. Nothing under `src/`, nothing under `public/`.
* **Needs to start:** nothing.

1. Hunt CC0 and CC-BY packs — Freesound, archive.org, Musical Artifacts — for a
   dry, damped, close-miked funk kit in the character `docs/music.md` Part 3
   describes. **Prefer CC0**, and prefer one pack over several.
2. Score each candidate against the articulation table in `spec.md`. Name every
   row it cannot fill and what would fill it from elsewhere.
3. Render each of 2–3 candidates into one two-bar funk loop with ffmpeg —
   samples mixed at fixed offsets, around 96 BPM, straight.
4. **Hand the renders to Fred and stop.** The pick goes into this file under
   `## Decided`, with the reason he gave.

#### Track B — The contract and the red tests

* **Role:** `test-writer`
* **Owns:** `src/lib/kit/voices.ts`, `src/lib/kit/manifest.test.ts`,
  `src/lib/kit/loudness.test.ts`
* **Needs to start:** the contracts above. Not Track A.

1. **red** — `voices.ts` exists and `ARTICULATIONS` has every member of the
   union, proven by a type-level exhaustiveness check that `tsc` holds.
2. **red** — every `files` path in `KIT` exists under `public/`.
3. **red** — every `.ogg` under `public/samples/` is named by exactly one entry.
   The folder and the manifest agree in **both** directions.
4. **red** — every `substituted` entry resolves to a `files` entry in one hop.
5. **red** — every `files` path appears verbatim in `docs/samples.md`, so a file
   cannot ship without its licence line.
6. **red** — `gains` matches the eight values in `docs/music.md` Part 3.
7. **red** — each file's RMS over `rmsWindowMs` from its onset is within ±0.5 dB
   of `targetRmsDb`, and no file runs out of audio inside that window. Missing
   ffmpeg fails with an install hint.

#### Track C — Build the pack

* **Role:** `implementer`
* **Owns:** `public/samples/**`, `src/lib/kit/manifest.ts`,
  `scripts/normalize-samples.mjs`, `docs/samples.md`
* **Needs to start:** Track A's pick, and Track B's `voices.ts`.

1. **green** — download the chosen sources, trim each one to the hit, and
   convert to Ogg Vorbis at 44.1 kHz.
2. **green** — `scripts/normalize-samples.mjs` normalizes the folder to
   `targetRmsDb`, measured as RMS over `rmsWindowMs` from each file's onset. Its output is what gets committed; it is
   not wired into `npm run build`.
3. **green** — write `manifest.ts`, including every substitution with the reason
   it was substituted.
4. **green** — write `docs/samples.md`: one row per file with its source URL,
   its licence, and the attribution text where the licence is CC-BY. Record
   `targetRmsDb`, `rmsWindowMs` and the ffmpeg command used.
5. Turn each of Track B's tests green.

## Waves

* **Wave 1 (parallel):** Track A, Track B
* **— gate —** Fred listens to Track A's renders and picks
* **Wave 2:** Track C — needs the pick and `voices.ts`
* **Wave 3:** `verifier` against `spec.md`'s `## Done when`, plus an ear on the
  committed pack

## Checks

* `npm test`, `npm run lint`, `npm run build`
* ffmpeg on PATH — the loudness test now requires it

## Risks

* **Ogg on iOS.** caniuse measures the `<audio>` element; this app uses
  `decodeAudioData`. If iOS refuses the file the app is silent on its target
  device. Recorded in `spec.md` as a taken risk; the fix is a second WAV pack.
* **No free pack has a real snare ghost layer.** It is the one thing
  `docs/music.md` closed and cannot be substituted. If the chosen kit lacks it,
  Track A takes the ghost from elsewhere and says so — a mismatched ghost note
  is still better than a scaled backbeat.
* **CC-BY needs attribution where a user can find it.** `docs/samples.md` in a
  public repo is defensible and is not the app. Prefer CC0 to avoid the
  question; if any CC-BY file ships, an in-app credit line is a candidate for
  `specs/features.md`.
* **A kit assembled from several packs does not sound like one room.**
  Normalization equalises level, not ambience. Mitigated by preferring one pack
  and by the ear gate.
* **`ffmpeg` becomes a prerequisite of `npm test`.** Accepted: there is no CI
  and the alternative was a test that reads numbers we typed.

---

## Open — raised mid-build, 2026-09-16

* **`targetLufs` cannot be measured on a one-shot, and the contract has to
  change.** Track A raised it and the lead reproduced it with ffmpeg:
  EBU R128 integrates in 400 ms blocks behind a −70 LUFS absolute gate, so a
  100 ms rimshot and a 350 ms hi-hat both report `I: -70.0 LUFS` — the floor,
  not a measurement. Two rescues were tried and both fail:
  * **Padding with silence** gives a number, but a duration-dependent one. The
    same −6 dB tone reads −34.1 / −31.0 / −28.4 LUFS at 0.1 s / 0.35 s / 2 s.
    A rimshot would be normalized far hotter than a crash.
  * **Momentary maximum** (K-weighted, ungated) is duration-dependent for the
    same reason: −34.1 / −28.6 / −28.0 over the same three files. The 400 ms
    window still contains silence.

  Any measure with a 400 ms window penalises a sample shorter than 400 ms, and
  most of this pack is shorter than 400 ms. The measure has to be anchored on
  the onset and no longer than the shortest sample.

  **Settled: RMS in dBFS over a fixed window anchored on each file's onset**,
  the window shorter than the shortest sample. Defined everywhere,
  duration-independent, and one `ffmpeg astats` call. `Kit.targetLufs` becomes
  `Kit.targetRmsDb`, and `docs/music.md` Part 3's "the same integrated level"
  is amended to say what is actually measured.

  K-weighting was the alternative and was turned down: it is more correct on
  paper and the biquad coefficients would be hand-rolled DSP that nothing in
  this pipeline can hear to check. True peak was turned down because it is
  exactly what Part 3 argues against.
