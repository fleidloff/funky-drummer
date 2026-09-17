# Decisions

Every architectural decision taken in this project, newest last. An ADR records
a decision that **constrains work that has not happened yet** — reversing it
would cost real rework, not just an edit.

A decision that supersedes another names the number it replaces, and the old
record is edited to ⛔ **Superseded by**. Nothing here is deleted.

[0000-template.md](0000-template.md) is the shape to copy.

| # | Decision | Status | Date |
| :-- | :-- | :-- | :-- |
| [0001](0001-a-groove-is-an-ascii-grid.md) | A groove is an ASCII grid | ✅ Accepted | 2026-09-16 |
| [0002](0002-zones-are-proven-against-real-fixtures.md) | The import zones are proven against real fixtures, not strings | ✅ Accepted | 2026-09-16 |
| [0003](0003-user-facing-text-lives-in-snippets.md) | User-facing text lives in `src/lib/snippets/`, by language | ✅ Accepted | 2026-09-16 |
| [0004](0004-the-look-is-a-named-surface-vocabulary.md) | The look is a named surface vocabulary, and no component names a colour | ✅ Accepted | 2026-09-16 |
| [0005](0005-samples-are-normalized-to-onset-window-rms.md) | Samples are normalized to onset-window RMS, not integrated loudness | ✅ Accepted | 2026-09-16 |
| [0006](0006-the-kit-ships-as-ogg-vorbis-only.md) | The kit ships as Ogg Vorbis only | ✅ Accepted | 2026-09-16 |
| [0007](0007-the-drummer-is-a-pipeline-of-same-signature-stages.md) | The drummer is a pipeline of same-signature stages | ✅ Accepted | 2026-09-17 |
| [0008](0008-the-drummer-is-domain-the-transport-is-a-slice.md) | The drummer is domain, the transport is a slice, the route joins them | ✅ Accepted | 2026-09-17 |
