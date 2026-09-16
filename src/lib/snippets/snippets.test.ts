import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as snippets from './index'

const snippetsDir = import.meta.dirname + sep
const repoRoot = resolve(import.meta.dirname, '../../..')

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.mjs', '.js', '.jsx']
const IGNORED_DIRECTORIES = new Set(['node_modules', '.next', '.git', 'dist', 'coverage', '.verify'])
const ARGUMENT_SENTINEL = '<<<snippet-argument>>>'
const SHORTEST_GUARDED_FRAGMENT = 4

const SPECIFIER =
  /(?:from|import|require|vi\.(?:mock|doMock|importActual|importMock))\s*\(?\s*(['"])((?:\\.|(?!\1).)*)\1/g
const TEST_TITLE =
  /(?:describe|it|test|bench|suite)(?:\.\w+)*\s*\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      return IGNORED_DIRECTORIES.has(entry.name) ? [] : sourceFiles(path)
    }
    return SOURCE_EXTENSIONS.some((extension) => entry.name.endsWith(extension)) ? [path] : []
  })
}

function renderableFragments(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (typeof value === 'function') {
    const args = Array.from({ length: value.length }, () => ARGUMENT_SENTINEL)
    const rendered = (value as (...args: unknown[]) => unknown)(...args)
    return typeof rendered === 'string' ? rendered.split(ARGUMENT_SENTINEL) : []
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap(renderableFragments)
  }
  return []
}

function specifiersOf(source: string): string[] {
  return [...source.matchAll(SPECIFIER)].map((match) => match[2])
}

function withoutSpecifiersAndTitles(source: string): string {
  return source.replace(SPECIFIER, '').replace(TEST_TITLE, '')
}

const outsideTheModule = sourceFiles(join(repoRoot, 'src')).filter(
  (file) => !file.startsWith(snippetsDir),
)
const testFilesOutsideTheModule = outsideTheModule.filter((file) => /\.test\.tsx?$/.test(file))

const guardedFragments = [
  ...new Set(renderableFragments(snippets).map((fragment) => fragment.trim())),
].filter(
  (fragment) => fragment.length >= SHORTEST_GUARDED_FRAGMENT && /\p{L}/u.test(fragment),
)

describe('snippets', () => {
  it('exposes words for the guard to protect', () => {
    expect(guardedFragments.length).toBeGreaterThan(0)
  })

  it('is the only place a rendered word is written down', () => {
    const copies = testFilesOutsideTheModule.flatMap((file) => {
      const prose = withoutSpecifiersAndTitles(readFileSync(file, 'utf8'))
      return guardedFragments
        .filter((fragment) => prose.includes(fragment))
        .map((fragment) => `${relative(repoRoot, file)} writes "${fragment}"`)
    })

    expect(copies).toEqual([])
  })

  it('is reached only through its own surface', () => {
    const reachesPastIt = outsideTheModule.flatMap((file) =>
      specifiersOf(readFileSync(file, 'utf8'))
        .filter((specifier) => specifier.includes('snippets/en'))
        .map((specifier) => `${relative(repoRoot, file)} imports "${specifier}"`),
    )

    expect(reachesPastIt).toEqual([])
  })
})
