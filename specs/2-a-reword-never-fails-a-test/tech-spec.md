# V2. A reword never fails a test — tech spec

## Contracts

Frozen. Both tracks build against these.

```ts
// vitest.reword.ts — the scrambler, exported for its own test
export function scramble(value: unknown, path: string): unknown

// vitest.reword.ts — the vite plugin
export function rewordSnippets(options: {
  real: string        // absolute path to src/lib/snippets/index.ts
  scrambler: string   // absolute path to the module exporting scramble
}): Plugin
```

* The plugin intercepts the specifier `@/lib/snippets` exactly, and nothing else.
  It resolves it to the virtual id `\0reword-snippets` and loads generated source
  that imports the real module **by absolute path** — which the plugin does not
  intercept — and re-exports each name through `scramble`.
* Export names come from parsing `src/lib/snippets/index.ts` with the TypeScript
  compiler API, so a new area added to the index is picked up with no edit here.
* The placeholder is `«reworded:<path>»`, where `<path>` is the dotted route to
  the string: `notFound.body`, `app.name`.

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    projects: [
      { plugins: [tsconfigPaths(), react()], test: { ...shared, name: 'suite' } },
      { plugins: [rewordSnippets({ real, scrambler }), tsconfigPaths(), react()],
        test: { ...shared, name: 'reword' } },
    ],
  },
})
```

`shared` is today's `test` block verbatim. `npm test` stays `vitest run`.

## Settled without a question

* **The `reword` project runs the whole file set, not just `src/`.** Excluding
  the two root config tests would reintroduce the `src/`-only blindness the probe
  found in the string guard, and it buys almost nothing: measured cost of the
  second project is 2.6–3.3s against 2.16s for one.
  **The projects run one after the other, not in parallel** — `sequence.groupOrder`
  0 and 1. Running them concurrently races on the transient lint fixtures under
  `src/features/zonefixture-*`; see `## Risks`.
* **A scrambled function appends its arguments to the placeholder.**
  `scramble(coaching.offBy, 'coaching.offBy')` returns a function whose result is
  `«reworded:coaching.offBy»` followed by the serialised arguments, so an
  interpolated value still reaches the DOM. Fred's reason: a test asserting the
  number `12` appears is asserting data rather than wording, and it should
  survive a reword. A test comparing against `coaching.offBy({ ms: 12 })` still
  passes because both sides call the same scrambled function; a test copying the
  sentence still fails, which is the point. The alternative — dropping the
  arguments — false-fails a legitimate assertion, and the pressure that follows
  is an exemption.
* **Placement is root-level, beside the config it serves.** `eslint.config.mjs`
  and its helper `eslint.zones.mjs` are the precedent, and the lint zones bind
  `src/` only, so build tooling has no home under it. The scrambler does not go
  in `src/lib/snippets/` — `src/lib/` holds runtime domain code, and a test
  scrambler is neither.

## Epics

One epic. The change is one mechanism plus the records that describe it.

### Epic 1 — A reword run proves the rule

#### Track A — The reword project

* **Role:** `implementer`
* **Owns:** `vitest.reword.ts`, `vitest.reword.test.ts`, `vitest.config.ts`
* **Needs to start:** the contracts above

1. **red** — `vitest.reword.test.ts` asserts `scramble` against the shapes the
   module can hold: a string becomes `«reworded:app.name»`; a nested object keeps
   its keys and scrambles its leaves; a function returns the placeholder with its
   arguments appended, so calling it with the same arguments twice gives the same
   string and calling it with different ones does not. It is a plain unit test of
   a plain function.
2. **green** — write `scramble`.
3. **red** — assert the plugin resolves `@/lib/snippets` to the virtual id and
   leaves every other specifier alone, and that the generated source names every
   export `index.ts` declares.
4. **green** — write `rewordSnippets`.
5. **green** — `vitest.config.ts` grows the `projects` array. `npm test` runs
   both and passes.
8. **red, added after the verifier's third round** — pin the file set. Both
   projects must carry the same `include`, and `passWithNoTests` is `false` at the
   root. Without this, adding `include: ['src/**/*.test.*']` to the `reword`
   project silently drops 46 tests — the gate's own effect test among them — and
   `npm test` exits 0; `include: ['no/such/place/**']` runs zero files and still
   exits 0. Note `passWithNoTests` is a root-only option, so the copy that sat in
   the shared project block was never doing anything.
7. **red, added after the verifier's second round** — assert the gate's *effect*,
   not its shape: a test that imports `@/lib/snippets` and the real module by
   relative path, and asserts a `«reworded:…»` placeholder under `reword` and the
   real string under `suite`. The project tells itself apart by
   `env.SNIPPETS_REWORDED`, which the config test pins. This exists because the
   verifier found a mutant that survived every shape assertion: make the generated
   module `export const app = real.app` and all 128 tests stayed green with the
   gate dead. Neither the test nor the config writes an app word down — the real
   value is compared by reference, never quoted.
6. **red, added after the verifier found the gap** — assert the config itself:
   the projects are `['suite', 'reword']`, only `reword` carries the plugin, both
   carry a distinct `groupOrder`, and both get the same file set. Killed by three
   mutants — deleting the `reword` project, dropping the plugin from it, and
   removing `groupOrder`. Without this, the whole gate can be deleted in one line
   of config and every test still passes.

#### Track B — The three holes, demonstrated

* **Role:** `test-writer`
* **Owns:** nothing permanently — it plants, observes, removes, and reports
* **Needs to start:** Track A step 5

1. Plant `getByText('Nothing here')` under `src/`. Confirm it fails in `reword`
   *and* is named by `snippets.test.ts`. Remove it.
2. Plant `getByText(/does not exist/)` under `src/`. Confirm it fails in `reword`
   and that `snippets.test.ts` stays silent — the hole the probe found. Remove it.
3. Plant `getByText('Nothing here')` in a test file at the repo root. Same two
   confirmations. Remove it.
4. Reword every snippet by hand, confirm both projects stay green, restore.
5. Report which mutant killed which guard. This is `docs/testing.md`'s "a test is
   not a test until you have seen it fail", applied to the gate itself.

#### Track C — The records

* **Role:** `architect`
* **Owns:** `docs/adr/0003-user-facing-text-lives-in-snippets.md`,
  `docs/testing.md`, `docs/coding-guidelines.md`, `.claude/agents/test-writer.md`
* **Needs to start:** the contracts above — it describes the mechanism, it does
  not wait for it

1. Amend 0003's *Consequences*: the sentence "Both are enforced" is false, as the
   probe showed. Replace it with what the `reword` project proves, and name
   `snippets.test.ts` as the fast advisory that gives the good error message.
   Keep the record's date and status; this corrects a claim, it does not reverse
   a decision.
2. `docs/testing.md` — the *Changing a word must never fail a test* section gains
   the `reword` project and what a failure in it looks like. Its *Structural
   tests* table row for snippets is reworded: the guard names the file, the
   project is the gate.
3. `docs/coding-guidelines.md` — the paragraph beginning "What a linter stops,
   and what it does not" currently describes the string guard as the whole of the
   test half. Correct it.
4. `.claude/agents/test-writer.md` — the *Never sleep, never quote a sentence*
   section gains a paragraph: `npm test` runs a `reword` project, a failure there
   that mentions `«reworded:…»` means the test copied a word, and the fix is to
   import the snippet rather than to add an exemption.

## Waves

* **Wave 1 (parallel):** Track A, Track C — disjoint files, both build against
  the frozen contracts
* **Wave 2:** Track B — needs Track A step 5 before it can plant anything

## Checks

* `npm test` — both projects green
* `npm run lint`
* `npm run build`

## Risks

* **A legitimate assertion false-fails in `reword`.** The pressure that follows is
  to add an exemption, which is how the gate erodes. Settled for the interpolation
  case above; anything else is a report, not a silent exclusion.
* **`tsconfigPaths()` versus the plugin's `resolveId`.** The plugin is
  `enforce: 'pre'`, which is what made the prototype work. If plugin order
  regresses, the `reword` project silently becomes a duplicate of `suite` and
  proves nothing. Track B step 2 is what catches that: if the partial-quote probe
  passes in `reword`, the wiring is dead.
* **The suite runs twice**, so a slow test costs double. 2.16s → 2.6–3.3s today.
* **A test that writes to the tree cannot run in both projects at once.**
  `eslint.config.test.ts` creates and deletes `src/features/zonefixture-*`, and
  two concurrent copies raced: the suite failed about two runs in five with
  `ENOENT` on a fixture, and `snippets.test.ts` — which walks `src/` — tripped on
  the same vanishing files. Held by `sequence.groupOrder`, which serialises the
  projects. **Any future structural test that writes to the tree inherits this
  constraint**, and the failure looks like an unrelated flake rather than a race.
* **Pre-existing, not introduced here, and still open:** inside a single project
  `eslint.config.test.ts` and `snippets.test.ts` already run concurrently, so a
  walk of `src/` can still race a fixture's lifetime. V1 shipped that; V2 only
  made it likely enough to see. Left alone deliberately — it is a separate change.

## Open

* Nothing. Ready to build.
