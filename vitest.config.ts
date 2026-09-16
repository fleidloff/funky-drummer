import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import { rewordSnippets } from './vitest.reword'

const root = import.meta.dirname

const shared = {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./vitest.setup.ts'],
  exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
}

const reword = rewordSnippets({
  real: join(root, 'src/lib/snippets/index.ts'),
  scrambler: join(root, 'vitest.reword.ts'),
})

export default defineConfig({
  test: {
    passWithNoTests: false,
    projects: [
      {
        plugins: [tsconfigPaths(), react()],
        test: { ...shared, name: 'suite', sequence: { groupOrder: 0 } },
      },
      {
        plugins: [reword, tsconfigPaths(), react()],
        test: {
          ...shared,
          name: 'reword',
          sequence: { groupOrder: 1 },
          env: { SNIPPETS_REWORDED: '1' },
        },
      },
    ],
  },
})
