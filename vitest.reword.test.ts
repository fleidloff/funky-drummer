/** @vitest-environment node */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { rewordSnippets, scramble } from './vitest.reword'
import config from './vitest.config'
import { app as reachedByAlias } from '@/lib/snippets'
import { app as realApp } from './src/lib/snippets/index'

describe('scramble', () => {
  it('replaces a string with a placeholder naming its path', () => {
    expect(scramble('Zork Zork', 'app.name')).toBe('«reworded:app.name»')
  })

  it('keeps an object shape and accumulates the dotted path', () => {
    expect(scramble({ title: 'Wibble', body: 'Frotzed beyond recognition.' }, 'notFound')).toEqual({
      title: '«reworded:notFound.title»',
      body: '«reworded:notFound.body»',
    })
  })

  it('accumulates the path through nesting', () => {
    expect(scramble({ transport: { play: 'Play' } }, 'controls')).toEqual({
      transport: { play: '«reworded:controls.transport.play»' },
    })
  })

  it('appends the arguments of a call to the placeholder', () => {
    const offBy = scramble((ms: number) => `You are ${ms}ms late.`, 'coaching.offBy') as (
      argument: unknown,
    ) => string

    expect(offBy({ ms: 12 })).toContain('«reworded:coaching.offBy»')
    expect(offBy({ ms: 12 })).toContain('12')
  })

  it('returns the same string for the same arguments and a different one for different arguments', () => {
    const offBy = scramble((ms: number) => `You are ${ms}ms late.`, 'coaching.offBy') as (
      argument: unknown,
    ) => string

    expect(offBy({ ms: 12 })).toBe(offBy({ ms: 12 }))
    expect(offBy({ ms: 12 })).not.toBe(offBy({ ms: 40 }))
  })
})

const here = import.meta.dirname
const real = join(here, 'src/lib/snippets/index.ts')
const scrambler = join(here, 'vitest.reword.ts')

const declaredExports = (file: string): string[] => {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const names: string[] = []
  source.forEachChild((node) => {
    if (!ts.isExportDeclaration(node)) return
    const bindings = node.exportClause
    if (!bindings || !ts.isNamedExports(bindings)) return
    bindings.elements.forEach((element) => names.push(element.name.text))
  })
  return names
}

const hooks = () => {
  const plugin = rewordSnippets({ real, scrambler })
  return {
    enforce: plugin.enforce,
    resolveId: plugin.resolveId as unknown as (source: string) => string | null,
    load: plugin.load as unknown as (id: string) => string | null,
  }
}

describe('rewordSnippets', () => {
  it('runs before the alias plugin that would otherwise resolve the specifier', () => {
    expect(hooks().enforce).toBe('pre')
  })

  it('resolves the snippets specifier to the virtual id', () => {
    expect(hooks().resolveId('@/lib/snippets')).toBe('\0reword-snippets')
  })

  it('leaves every other specifier alone', () => {
    const { resolveId } = hooks()

    expect(resolveId('@/lib/snippets/en/app')).toBeNull()
    expect(resolveId('react')).toBeNull()
    expect(resolveId(real)).toBeNull()
  })

  it('loads nothing for an id it does not own', () => {
    expect(hooks().load('react')).toBeNull()
  })

  it('names every export the snippets index declares', () => {
    const source = hooks().load('\0reword-snippets') ?? ''
    const names = declaredExports(real)

    expect(names.length).toBeGreaterThan(0)
    names.forEach((name) => expect(source).toContain(`export const ${name} =`))
  })

  it('reaches the real module by absolute path, so it never intercepts its own import', () => {
    const source = hooks().load('\0reword-snippets') ?? ''

    expect(source).toContain(real)
    expect(source).not.toContain("'@/lib/snippets'")
  })
})

describe('the vitest config installs the gate', () => {
  const projects = () => {
    const configured = config.test?.projects ?? []
    return configured as { plugins?: unknown[]; test?: Record<string, unknown> }[]
  }

  const named = (name: string) =>
    projects().find((project) => project.test?.name === name)

  const pluginNames = (project: { plugins?: unknown[] } | undefined) =>
    (project?.plugins ?? [])
      .flat(Infinity)
      .map((plugin) => (plugin as { name?: string } | null)?.name)

  it('runs the suite twice, once as written and once reworded', () => {
    expect(projects().map((project) => project.test?.name)).toEqual(['suite', 'reword'])
  })

  it('gives only the reword project the scrambling plugin', () => {
    expect(pluginNames(named('reword'))).toContain('reword-snippets')
    expect(pluginNames(named('suite'))).not.toContain('reword-snippets')
  })

  it('points the configured plugin at the real snippets index and at the scrambler', () => {
    const installed = (named('reword')?.plugins ?? [])
      .flat(Infinity)
      .find((plugin) => (plugin as { name?: string } | null)?.name === 'reword-snippets')
    const load = (installed as { load: (id: string) => string | null }).load

    const source = load.call(installed, '\0reword-snippets') ?? ''

    expect(source).toContain(real)
    expect(source).toContain(scrambler)
  })

  it('orders the projects so they never write fixtures at the same time', () => {
    const orders = projects().map(
      (project) => (project.test?.sequence as { groupOrder?: number } | undefined)?.groupOrder,
    )

    expect(orders).toEqual([0, 1])
  })

  it('gives both projects the same files to run', () => {
    const [suite, reword] = projects()

    expect(reword.test?.exclude).toEqual(suite.test?.exclude)
    expect(reword.test?.exclude).not.toHaveLength(0)
    expect(reword.test?.environment).toEqual(suite.test?.environment)
    expect(reword.test?.include).toEqual(suite.test?.include)
  })

  it('fails rather than passes if a project matches no files at all', () => {
    expect(config.test?.passWithNoTests).toBe(false)
  })

  it('flags the reword project so a test can tell which side it is on', () => {
    expect((named('reword')?.test?.env as Record<string, string>).SNIPPETS_REWORDED).toBe('1')
    expect(named('suite')?.test?.env).toBeUndefined()
  })
})

describe('the gate has an effect, not just a shape', () => {
  const reworded = process.env.SNIPPETS_REWORDED === '1'

  it(`serves ${reworded ? 'placeholders' : 'the real words'} through @/lib/snippets`, () => {
    if (reworded) {
      expect(reachedByAlias.name).toBe('«reworded:app.name»')
      expect(reachedByAlias.name).not.toBe(realApp.name)
      return
    }

    expect(reachedByAlias.name).toBe(realApp.name)
  })

  it('leaves a relative import of the module untouched in both projects', () => {
    expect(realApp.name).not.toMatch(/^«reworded:/)
  })
})
