import { RuleTester } from 'eslint'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/**
 * Create a RuleTester with TypeScript parser pre-configured.
 */
export function createTypedRuleTester(
  options: Record<string, unknown> = {},
): RuleTester {
  return new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
    ...options,
  })
}

/**
 * Create a basic RuleTester (no TypeScript parser).
 */
export function createBasicRuleTester(
  options: Record<string, unknown> = {},
): RuleTester {
  return new RuleTester({
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
    ...options,
  })
}
