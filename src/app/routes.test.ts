import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const here = import.meta.dirname

const tsxFilesUnder = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return tsxFilesUnder(path)
    return entry.isFile() && entry.name.endsWith('.tsx') ? [path] : []
  })

const routeFiles = tsxFilesUnder(here).map((path) => relative(here, path))

const parse = (name: string) =>
  ts.createSourceFile(
    name,
    readFileSync(join(here, name), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

const collect = <T>(name: string, pick: (node: ts.Node) => T | undefined): T[] => {
  const found: T[] = []
  const walk = (node: ts.Node) => {
    const hit = pick(node)
    if (hit !== undefined) found.push(hit)
    node.forEachChild(walk)
  }
  walk(parse(name))
  return found
}

const hasLetter = (text: string) => /\p{Letter}/u.test(text)

const accessibleNames = new Set(['aria-label', 'title', 'alt'])
const metadataWords = new Set(['title', 'description'])

describe('a route renders no word it wrote itself', () => {
  it('reads every route file, including nested ones', () => {
    expect(routeFiles.length).toBeGreaterThanOrEqual(3)
  })

  it.each(routeFiles)('%s writes no JSX text', (name) => {
    const text = collect(name, (node) =>
      ts.isJsxText(node) && hasLetter(node.text) ? node.text.trim() : undefined,
    )
    expect(text).toEqual([])
  })

  it.each(routeFiles)('%s writes no accessible name inline', (name) => {
    const inline = collect(name, (node) => {
      if (!ts.isJsxAttribute(node) || !node.initializer) return undefined
      if (!accessibleNames.has(node.name.getText())) return undefined
      return ts.isStringLiteral(node.initializer) ? node.initializer.text : undefined
    })
    expect(inline).toEqual([])
  })

  it.each(routeFiles)('%s writes no metadata word inline', (name) => {
    const inline = collect(name, (node) => {
      if (!ts.isPropertyAssignment(node)) return undefined
      if (!metadataWords.has(node.name.getText())) return undefined
      return ts.isStringLiteral(node.initializer) ? node.initializer.text : undefined
    })
    expect(inline).toEqual([])
  })
})
