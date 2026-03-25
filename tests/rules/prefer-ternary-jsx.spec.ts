/**
 * @fileoverview Tests for prefer-ternary-jsx rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'
import { createRequire } from 'node:module'

import rule from '../../src/rules/prefer-ternary-jsx.js'

const require = createRequire(import.meta.url)

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
})

describe('prefer-ternary-jsx', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('prefer-ternary-jsx', rule, {
      valid: [
        // Single condition - no complement
        {
          code: `<div>{isLocked && <LockIcon />}</div>`,
        },
        // Already a ternary
        {
          code: `<div>{isLocked ? <LockIcon /> : <CheckBox />}</div>`,
        },
        // Different conditions
        {
          code: `<div>{isLocked && <LockIcon />}{isSelected && <CheckBox />}</div>`,
        },
        // Both positive (same condition, no negation)
        {
          code: `<div>{isLocked && <LockIcon />}{isLocked && <Other />}</div>`,
        },
        // Non-&& logical expressions
        {
          code: `<div>{isLocked || <LockIcon />}{!isLocked || <CheckBox />}</div>`,
        },
      ],

      invalid: [
        // Simple complementary conditions
        {
          code: `<div>{isLocked && <LockIcon />}{!isLocked && <CheckBox />}</div>`,
          output: `<div>{isLocked ? <LockIcon /> : <CheckBox />}</div>`,
          errors: [
            {
              messageId: 'preferTernary',
              data: { positive: 'isLocked' },
            },
          ],
        },
        // Negation first, positive second
        {
          code: `<div>{!isLocked && <CheckBox />}{isLocked && <LockIcon />}</div>`,
          output: `<div>{isLocked ? <LockIcon /> : <CheckBox />}</div>`,
          errors: [
            {
              messageId: 'preferTernary',
              data: { positive: 'isLocked' },
            },
          ],
        },
        // With other children in between
        {
          code: `<div>{isLocked && <LockIcon />}<Text>hello</Text>{!isLocked && <CheckBox />}</div>`,
          output: `<div>{isLocked ? <LockIcon /> : <CheckBox />}</div>`,
          errors: [
            {
              messageId: 'preferTernary',
              data: { positive: 'isLocked' },
            },
          ],
        },
        // Member expression condition
        {
          code: `<div>{user.isAdmin && <AdminPanel />}{!user.isAdmin && <UserPanel />}</div>`,
          output: `<div>{user.isAdmin ? <AdminPanel /> : <UserPanel />}</div>`,
          errors: [
            {
              messageId: 'preferTernary',
              data: { positive: 'user.isAdmin' },
            },
          ],
        },
        // Inside a fragment
        {
          code: `<>{isLocked && <LockIcon />}{!isLocked && <CheckBox />}</>`,
          output: `<>{isLocked ? <LockIcon /> : <CheckBox />}</>`,
          errors: [
            {
              messageId: 'preferTernary',
              data: { positive: 'isLocked' },
            },
          ],
        },
      ],
    })
  })
})
