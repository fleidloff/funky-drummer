import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { ESLint, type Linter } from 'eslint'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildZones } from './eslint.zones.mjs'

const root = process.cwd()

const ALPHA = 'zonefixture-alpha'
const BETA = 'zonefixture-beta'

const ZONES = 'import/no-restricted-paths'
const STYLING = 'no-restricted-syntax'

const fixtureModules: Record<string, string> = {
  [`${ALPHA}/index.ts`]: 'export const alpha = 1\n',
  [`${ALPHA}/lib/decide/rule.ts`]: 'export const rule = 1\n',
  [`${ALPHA}/lib/timing/clock.ts`]: 'export const clock = 1\n',
  [`${ALPHA}/components/Panel.tsx`]: 'export const Panel = 1\n',
  [`${ALPHA}/hooks/useThing.ts`]: 'export const useThing = 1\n',
  [`${ALPHA}/state/store.ts`]: 'export const store = 1\n',
  [`${BETA}/index.ts`]: 'export const beta = 1\n',
}

const fixtureRoots = [
  path.join(root, 'src/features', ALPHA),
  path.join(root, 'src/features', BETA),
]

function removeFixtures() {
  for (const dir of fixtureRoots) rmSync(dir, { recursive: true, force: true })
}

function writeFixtures() {
  for (const [relative, source] of Object.entries(fixtureModules)) {
    const file = path.join(root, 'src/features', relative)
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, source)
  }
}

let eslint: ESLint

beforeAll(() => {
  removeFixtures()
  writeFixtures()
  eslint = new ESLint({
    cwd: root,
    overrideConfigFile: path.join(root, 'eslint.config.mjs'),
  })
})

afterAll(() => {
  removeFixtures()
})

async function lint(file: string, code: string): Promise<Linter.LintMessage[]> {
  const [result] = await eslint.lintText(code, { filePath: path.join(root, file) })
  return result.messages
}

async function zoneErrors(file: string, code: string) {
  return (await lint(file, code)).filter((message) => message.ruleId === ZONES)
}

async function stylingErrors(file: string, code: string) {
  return (await lint(file, code)).filter((message) => message.ruleId === STYLING)
}

const importing = (specifier: string) =>
  `import { thing } from '${specifier}'\nexport const used = thing\n`

describe('the ESLint config is loadable and carries the two named blocks', () => {
  it('names both blocks', async () => {
    const href = pathToFileURL(path.join(root, 'eslint.config.mjs')).href
    const blocks = (await import(href)).default as { name?: string }[]
    expect(blocks.map((block) => block.name)).toEqual(
      expect.arrayContaining([
        'funky-drummer/import-boundaries',
        'funky-drummer/no-styling-in-features',
      ]),
    )
  })

  it('applies the zones to a source file', async () => {
    const config = (await eslint.calculateConfigForFile(
      path.join(root, 'src/app/page.tsx'),
    )) as { rules: Record<string, unknown> }
    expect(config.rules[ZONES]).toBeDefined()
  })

  it('resolves the @/ alias, without which every zone silently passes', async () => {
    const errors = await zoneErrors('src/lib/clock/tick.ts', importing('@/components/layout/Stack'))
    expect(errors).toHaveLength(1)
  })
})

describe('zone 1 — the design system may not know about features', () => {
  it('fires when src/components imports a feature', async () => {
    const errors = await zoneErrors(
      'src/components/display/Readout.tsx',
      importing(`@/features/${ALPHA}`),
    )
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toMatch(/zone 1/)
  })

  it('stays quiet when src/app imports the same feature', async () => {
    const errors = await zoneErrors('src/app/page.tsx', importing(`@/features/${ALPHA}`))
    expect(errors).toEqual([])
  })
})

describe('zone 2 — a feature is reached only through its index.ts', () => {
  it('fires when src/app reaches past the index', async () => {
    const errors = await zoneErrors(
      'src/app/page.tsx',
      importing(`@/features/${ALPHA}/lib/decide/rule`),
    )
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toMatch(/zone 2/)
  })

  it('stays quiet when src/app imports the index itself', async () => {
    const errors = await zoneErrors('src/app/page.tsx', importing(`@/features/${ALPHA}`))
    expect(errors).toEqual([])
  })

  it('never examines a slice importing its own internals', async () => {
    const errors = await zoneErrors(
      `src/features/${ALPHA}/components/Panel.tsx`,
      importing('../../lib/decide/rule'),
    )
    expect(errors).toEqual([])
  })
})

describe('zone 3 — no feature imports another', () => {
  it('fires on a sibling index, which zone 2 alone would permit', async () => {
    const errors = await zoneErrors(
      `src/features/${ALPHA}/components/Panel.tsx`,
      importing(`@/features/${BETA}`),
    )
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toMatch(/zone 3/)
  })

  it('stays quiet when the same file imports src/lib', async () => {
    const errors = await zoneErrors(
      `src/features/${ALPHA}/components/Panel.tsx`,
      importing('@/lib/snippets'),
    )
    expect(errors).toEqual([])
  })

  it('is generated for every sibling pair, so a new slice inherits it', () => {
    const zones = buildZones(['alpha', 'beta', 'gamma'])
    const forAlpha = zones.filter(
      (zone) => zone.target === './src/features/alpha' && zone.except === undefined,
    )
    expect(forAlpha).toHaveLength(1)
    expect(forAlpha[0].from).toEqual(['./src/features/beta', './src/features/gamma'])
    expect(forAlpha[0].message).toMatch(/zone 3/)
  })

  it('is inert with a single slice, which is why the generator is asserted directly', () => {
    const zones = buildZones(['alpha'])
    expect(zones.some((zone) => zone.message?.includes('zone 3'))).toBe(false)
  })
})

describe('zone 4 — src/lib is a leaf', () => {
  it('fires when src/lib imports src/components', async () => {
    const errors = await zoneErrors('src/lib/clock/tick.ts', importing('@/components/layout/Stack'))
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toMatch(/zone 4/)
  })

  it('fires when src/lib imports a feature', async () => {
    const errors = await zoneErrors('src/lib/clock/tick.ts', importing(`@/features/${ALPHA}`))
    expect(errors.some((error) => /zone 4/.test(error.message))).toBe(true)
  })

  it('stays quiet on a legal import within src/lib', async () => {
    const errors = await zoneErrors('src/lib/clock/tick.ts', importing('@/lib/snippets'))
    expect(errors).toEqual([])
  })
})

describe("zone 6 — a feature's lib does not import UI, a hook or the store", () => {
  it('fires on a hook', async () => {
    const errors = await zoneErrors(
      `src/features/${ALPHA}/lib/decide/rule.ts`,
      importing('../../hooks/useThing'),
    )
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toMatch(/zone 6/)
  })

  it('fires on the store', async () => {
    const errors = await zoneErrors(
      `src/features/${ALPHA}/lib/decide/rule.ts`,
      importing('../../state/store'),
    )
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toMatch(/zone 6/)
  })

  it('fires on the design system', async () => {
    const errors = await zoneErrors(
      `src/features/${ALPHA}/lib/decide/rule.ts`,
      importing('@/components/layout/Stack'),
    )
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toMatch(/zone 6/)
  })

  it('stays quiet on a legal import between two lib concerns', async () => {
    const errors = await zoneErrors(
      `src/features/${ALPHA}/lib/decide/rule.ts`,
      importing('../timing/clock'),
    )
    expect(errors).toEqual([])
  })
})

describe('funky-drummer/no-styling-in-features', () => {
  const component = "export const Panel = () => <div className=\"p-4\">x</div>\n"
  const computed = 'export const Panel = ({ on }: { on: boolean }) => <div className={on ? "a" : "b"}>x</div>\n'

  it('rejects a className in a feature component', async () => {
    const errors = await stylingErrors(`src/features/${ALPHA}/components/Panel.tsx`, component)
    expect(errors).toHaveLength(1)
  })

  it('rejects a computed class list too, because the selector matches the attribute', async () => {
    const errors = await stylingErrors(`src/features/${ALPHA}/components/Panel.tsx`, computed)
    expect(errors).toHaveLength(1)
  })

  it('leaves the design system alone', async () => {
    const errors = await stylingErrors('src/components/surfaces/Card.tsx', component)
    expect(errors).toEqual([])
  })

  it('leaves src/app/layout.tsx alone, where next/font needs its classes', async () => {
    const errors = await stylingErrors('src/app/layout.tsx', component)
    expect(errors).toEqual([])
  })
})
