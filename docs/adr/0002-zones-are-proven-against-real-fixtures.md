# 0002. The import zones are proven against real fixtures, not strings

- **Status:** ✅ Accepted
- **Date:** 2026-09-16

## Context

[coding-guidelines.md](../coding-guidelines.md) defines the allowed import graph
as five `import/no-restricted-paths` zones, and states the rule that makes them
worth having: a zone that has only ever been seen to pass is a comment. The
config test therefore has to watch every zone *reject* something.

It also said how: lint synthetic source strings with a virtual `filePath`,
because a fixture committed to the tree would fail `npm run lint` for everyone.

**That does not work, and V1 found out why.** `import/no-restricted-paths`
resolves each specifier and **returns early when the import does not resolve on
disk**. Zones 2, 3 and 6 all have a `from` inside `src/features/`. With
`src/features/` empty, every such import resolved to nothing, the rule never
ran, and the zones could not be made to fire at all — while the test still
reported green.

A test that cannot fail is the exact failure this project's guidelines are
written against, so it could not be left standing.

## Decision

**`eslint.config.test.ts` creates real fixture modules under
`src/features/zonefixture-*` in `beforeAll` and removes them in `afterAll`**,
and `src/features/zonefixture-*` is gitignored so an interrupted run leaves
nothing committable.

The violating code stays a synthetic string with a virtual `filePath`. The
fixtures are inert `export const x = 1` modules that exist only as import
*targets* — the thing the resolver needs in order for the rule to run at all.

Two rules follow for any later zone work:

- **A zone whose `from` or `target` is inside `src/features/` cannot be tested
  without a resolvable fixture.** Adding one and watching it fire is the only
  proof; a green test proves nothing on its own.
- **Every "stays quiet" case is a real legal import to a file that exists.** A
  module importing nothing shows no spurious firing but not that a permitted
  import is permitted.

## Consequences

**What it buys.** All five zones are watched to reject and to accept, and every
quiet case is the strong shape. The live config's `readdirSync('src/features')`
picks the fixtures up during the run, so zones 2 and 3 fire end to end rather
than only at the generator. Fifteen mutations of the config were each recorded
against the test they killed, including one — pointing the TypeScript resolver
at a paths-free tsconfig — that silenced seven tests at once, which is the
resolver dependency's absence looking exactly like success.

**What it costs.** The test writes to `src/features/` while it runs. A
`npm run lint` running concurrently would see the fixtures; they contain no
violations, so it still exits 0. A killed run self-heals, because `beforeAll`
clears the directory before creating it.

**And a cost this record did not foresee: the test cannot run twice at once.**
V2 added a second Vitest project — `reword`, see
[ADR 0003](0003-user-facing-text-lives-in-snippets.md) — over the same files, and
the two copies raced —
one deleted the fixtures while the other was mid-read. The suite failed about two
runs in five, with `ENOENT` on a fixture and, separately, in
`snippets.test.ts`, which walks `src/` and tripped on the same vanishing files.
Held by `sequence.groupOrder` in `vitest.config.ts`, which makes the projects run
one after the other.

**The rule that follows: a structural test that writes to the tree may not be run
concurrently with itself, and its failure looks like an unrelated flake.** Any
future project, shard or parallel CI job over the same files inherits this. The
fixture directory is a single shared name, so the fix is ordering rather than
isolation until someone needs otherwise.

A narrower race predates V2 and is still open: inside one project
`eslint.config.test.ts` and `snippets.test.ts` run concurrently, so a walk of
`src/` can race a fixture's lifetime. V1 shipped it; V2 only made it frequent
enough to see.

**What it rules out.** The claim that this suite never touches the real tree.
Two documents said so and both were corrected by this change.

## Alternatives considered

- **Synthetic strings only, as originally specified** — cannot fire zones 2, 3
  or 6. It is what the guidelines asked for, and it silently does nothing.
- **A permanent committed fixture feature** — would be linted like any source,
  and its deliberate violations would fail `npm run lint` for everyone.
- **Asserting only at the generator** (`buildZones` returns the right shape) —
  proves the zone list, not that ESLint enforces it. Kept as well, for zone 3,
  which is inert with a single slice, but it is not sufficient alone.
