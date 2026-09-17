import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const here = import.meta.dirname

const appDir = join('src', 'app')
const featureDir = join('src', 'features')

// eslint.config.test.ts writes and deletes fixture modules under src/features/
// while this walk runs, so a directory or a file can vanish between the two.
const gone = (error: unknown) => (error as NodeJS.ErrnoException).code === 'ENOENT'

const tsxFilesUnder = (dir: string): string[] => {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch (error) {
    if (gone(error)) return []
    throw error
  }
  return entries.flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return tsxFilesUnder(path)
    if (!entry.isFile() || !entry.name.endsWith('.tsx')) return []
    return entry.name.includes('.test.') ? [] : [path]
  })
}

const screenFiles = (root: string) =>
  tsxFilesUnder(join(here, root)).map((path) => relative(here, path))

const parse = (name: string) => {
  try {
    return ts.createSourceFile(
      name,
      readFileSync(join(here, name), 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
  } catch (error) {
    if (gone(error)) return undefined
    throw error
  }
}

const collect = (name: string, pick: (node: ts.Node) => string | undefined): string[] => {
  const source = parse(name)
  if (!source) return []
  const found: string[] = []
  const walk = (node: ts.Node) => {
    const hit = pick(node)
    if (hit !== undefined) found.push(`${name}: ${hit}`)
    node.forEachChild(walk)
  }
  walk(source)
  return found
}

const across = (pick: (node: ts.Node) => string | undefined) =>
  [...screenFiles(appDir), ...screenFiles(featureDir)].flatMap((name) => collect(name, pick))

const hasLetter = (text: string) => /\p{Letter}/u.test(text)

const structuralProps = new Set([
  'align',
  'as',
  'className',
  'gap',
  'href',
  'htmlFor',
  'id',
  'justify',
  'lang',
  'name',
  'pad',
  'radius',
  'rel',
  'role',
  'size',
  'target',
  'tone',
  'type',
  'variant',
])

const configWords = new Set(['display', 'src', 'style', 'subsets', 'variable', 'weight'])

const isModuleSpecifier = (node: ts.Node) =>
  ts.isImportDeclaration(node.parent) ||
  ts.isExportDeclaration(node.parent) ||
  ts.isImportTypeNode(node.parent) ||
  ts.isExternalModuleReference(node.parent)

const isDirective = (node: ts.Node) =>
  ts.isExpressionStatement(node.parent) && ts.isSourceFile(node.parent.parent)

const attributeHolding = (node: ts.Node): ts.JsxAttribute | undefined => {
  if (ts.isJsxAttribute(node.parent)) return node.parent
  if (ts.isJsxExpression(node.parent) && ts.isJsxAttribute(node.parent.parent)) {
    return node.parent.parent
  }
  return undefined
}

const propertyHolding = (node: ts.Node): ts.PropertyAssignment | undefined => {
  if (ts.isPropertyAssignment(node.parent)) return node.parent
  if (ts.isArrayLiteralExpression(node.parent) && ts.isPropertyAssignment(node.parent.parent)) {
    return node.parent.parent
  }
  return undefined
}

const sitsInANamedPosition = (node: ts.Node) => {
  if (isModuleSpecifier(node) || isDirective(node)) return true
  const attribute = attributeHolding(node)
  if (attribute) return structuralProps.has(attribute.name.getText())
  const property = propertyHolding(node)
  if (property) return configWords.has(property.name.getText())
  return false
}

describe('no screen writes a word it made up', () => {
  it('reads the routes and the feature screens', () => {
    expect(screenFiles(appDir).length).toBeGreaterThanOrEqual(3)
    expect(screenFiles(featureDir).length).toBeGreaterThanOrEqual(6)
  })

  it('writes no JSX text', () => {
    const text = across((node) =>
      ts.isJsxText(node) && hasLetter(node.text) ? node.text.trim() : undefined,
    )

    expect(text).toEqual([])
  })

  it('writes no string literal outside a named position', () => {
    const stranded = across((node) => {
      if (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node)) return undefined
      if (!hasLetter(node.text)) return undefined
      return sitsInANamedPosition(node) ? undefined : node.text
    })

    expect(stranded).toEqual([])
  })
})
