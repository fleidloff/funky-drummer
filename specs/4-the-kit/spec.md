# V4. The kit

Started 2026-09-16 · `/brainstorm`
**Phase:** ready to build — `/implement 4`

## What

* Find a funky drum kit — "James Brown funky" — and put its samples in
  `public/samples/`.
* One kit if one kit covers every voice and articulation `docs/music.md`
  Part 3 names. Otherwise collect from several and say which came from where.
* CC0 or CC-BY, both fine. Every file's origin and licence recorded.
* Document the pack in `docs/samples.md`.
* Ship a checked-in manifest alongside it, so the pack is a thing the suite can
  check rather than a folder nobody reads.

## What the pack has to cover

The eight voices of `docs/music.md` Part 3, and the articulations the model
actually plays:

| Voice | Articulations | Variants |
| :-- | :-- | :-- |
| Kick | hard, soft | — |
| Snare | backbeat/rimshot, normal, ghost, cross-stick | ghost ×2–3 |
| Hi-hat | closed, accented, open, pedal "chick" | closed ×2–3 |
| Ride | bow, bell | — |
| Cowbell | one | — |
| Shaker | one | ×2–3 |
| Toms | rack, floor | — |
| Crash | one | — |

The cross-stick doubles as the count-in click.

`docs/music.md` binds two things that constrain sourcing:

* **The ghost note is a layer, not a gain.** "A velocity of 0.30 only produces a
  ghost note if the sample pack has a layer down there. Scaling one snare sample
  by 0.30 produces a distant backbeat." This one is closed and has to be found.
* **Every sample is loudness-normalized to the same integrated level** before the
  fixed gain table applies. "Normalization is measurable and belongs in the
  build, not in the ear."

## Done when

* **Every row of the table above resolves** — to a file, or to an explicit
  substitution onto a neighbouring articulation. The snare ghost resolves to a
  file. *That the pack sounds like James Brown needs an ear.*
* **Every file is loudness-normalized to one integrated level**, measurably, and
  the measurement is in `docs/samples.md`.
* **A manifest names every voice, articulation, variant and path**, including the
  substitutions, and a test proves the manifest and `public/samples/` agree in
  both directions — nothing declared is missing, nothing present is undeclared.
* **`docs/samples.md` records per file where it came from and under what
  licence**, every one of them CC0 or CC-BY, with the CC-BY attributions written
  out where a user can find them.
* **`npm test`, `npm run lint` and `npm run build` all pass.**

## Decided

* **What happens to an articulation no free recording covers?** — the manifest
  maps it to the nearest real articulation and `docs/samples.md` records the
  substitution. Every file stays an honest recording, the compromise is visible
  instead of baked into a file, and it is reversible the day a better sample
  turns up. The snare ghost is exempt: `docs/music.md` closed that one.
* **Does the count-in get its own sample?** — no. It reuses the cross-stick with
  beat 1 accented by gain. A stick count is what a drummer actually does, it is
  unmistakably not the groove, and it adds no ninth voice to the gain table.
* **What format?** — Ogg Vorbis, one pack, ~250 KB. Against the check that
  caniuse measures Ogg in the `<audio>` element and not in `decodeAudioData`,
  which is the path this app uses: iOS Safari has listed Ogg support since 18.4,
  older iOS is a shrinking share, and a phone will tell us soon enough.
  **The risk stands recorded** — if `decodeAudioData` refuses the file on iOS the
  app is silent on its target device, and the fix is a second WAV pack.
* **Round-robins?** — two or three variants on the fast voices only: closed
  hi-hat, shaker and snare ghost. Those are the voices that fire on consecutive
  sixteenths and gun. A kick or a crash cannot.
* **Do articulations also get velocity layers?** — try the soft layer on kick,
  snare and hat, and fall back to one file per articulation if sourcing it
  cleanly turns out too hard. The fallback is not a failure: the binding demand
  is the snare ghost, and that is an articulation either way.
* **What does V4 ship besides the audio?** — the files, `docs/samples.md`, and a
  checked-in manifest with a test that it and the folder agree. A folder of
  audio files has nothing to grade, and the loader needs the manifest anyway, so
  writing it now costs nothing and buys a verifiable change.

## Open

*(nothing — moved to the tech spec)*
