/**
 * @fileoverview Tests for no-complex-inline-arguments rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

import rule from '../../src/rules/no-complex-inline-arguments.js'

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-complex-inline-arguments', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-complex-inline-arguments', rule, {
      valid: [
        // Simple identifier argument - OK
        {
          code: `showToast(message)`,
        },
        // Short string in logical expression - OK (under default 20 chars)
        {
          code: `showToast(foo ?? 'Short')`,
        },
        // Simple string literal argument - OK (no operator)
        {
          code: `showToast('This is a very long string that would normally be flagged')`,
        },
        // Logical expression without string - OK
        {
          code: `getValue(foo ?? bar)`,
        },
        // Binary expression without long string - OK
        {
          code: `concat(a + b)`,
        },
        // Conditional expression with short strings - OK
        {
          code: `show(x ? 'yes' : 'no')`,
        },
        // Long string but in allowed function - OK
        {
          code: `translate(foo ?? 'This is a very long default message')`,
          options: [{ allowedFunctions: ['translate'] }],
        },
        // Not a call expression - OK
        {
          code: `const x = foo ?? 'This is a very long default message'`,
        },
        // Custom threshold - under limit - OK
        {
          code: `showToast(foo ?? 'This is exactly thirty chars!')`,
          options: [{ maxStringLength: 30 }],
        },
        // Member expression call with short string - OK
        {
          code: `obj.method(foo ?? 'Short')`,
        },
        // Nested but inner is simple - OK
        {
          code: `outer(inner(foo ?? bar))`,
        },
        // Array argument - OK
        {
          code: `fn([foo ?? 'long string here that is very long'])`,
        },
        // Object argument - OK
        {
          code: `fn({ key: foo ?? 'long string here that is very long' })`,
        },
        // Arrow function argument - OK
        {
          code: `fn(() => foo ?? 'long string here that is very long')`,
        },
        // No arguments - OK
        {
          code: `showToast()`,
        },
        // Template literal under threshold - OK
        {
          code: 'fn(foo ?? `short`)',
        },
      ],

      invalid: [
        // Logical expression with long string - NOT OK
        {
          code: `showToast(foo ?? 'This action is currently disabled')`,
          output: `const showToastArg = foo ?? 'This action is currently disabled'\nshowToast(showToastArg)`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // Binary expression with long string - NOT OK
        {
          code: `log(prefix + 'This is a very long suffix string')`,
          output: `const logArg = prefix + 'This is a very long suffix string'\nlog(logArg)`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // Conditional expression with long string - NOT OK
        {
          code: `show(condition ? 'This is a very long true message' : fallback)`,
          output: `const showArg = condition ? 'This is a very long true message' : fallback\nshow(showArg)`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // || operator with long string - NOT OK
        {
          code: `display(value || 'Default value that is quite long')`,
          output: `const displayArg = value || 'Default value that is quite long'\ndisplay(displayArg)`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // && operator with long string - NOT OK
        {
          code: `render(isValid && 'This validation message is long')`,
          output: `const renderArg = isValid && 'This validation message is long'\nrender(renderArg)`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // Nested logical with long string - NOT OK
        {
          code: `fn(a ?? b ?? 'This is a very long fallback string')`,
          output: `const fnArg = a ?? b ?? 'This is a very long fallback string'\nfn(fnArg)`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // Member expression call - NOT OK
        {
          code: `obj.method(foo ?? 'This is a very long default value')`,
          output: `const methodArg = foo ?? 'This is a very long default value'\nobj.method(methodArg)`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // Multiple complex args - both flagged
        {
          code: `fn(a ?? 'First long string message', b || 'Second long string message')`,
          output: `const fnArg = a ?? 'First long string message'\nfn(fnArg, b || 'Second long string message')`,
          errors: [
            { messageId: 'extractArgument' },
            { messageId: 'extractArgument' },
          ],
        },
        // Custom lower threshold - NOT OK
        {
          code: `showToast(foo ?? 'Medium length')`,
          options: [{ maxStringLength: 10 }],
          output: `const showToastArg = foo ?? 'Medium length'\nshowToast(showToastArg)`,
          errors: [{ messageId: 'extractArgument' }],
        },
        // Template literal over threshold - NOT OK
        {
          code: 'fn(foo ?? `This is a very long template string`)',
          output: 'const fnArg = foo ?? `This is a very long template string`\nfn(fnArg)',
          errors: [{ messageId: 'extractArgument' }],
        },
        // Conditional with long string in alternate - NOT OK
        {
          code: `show(condition ? short : 'This is a very long alternate string')`,
          output: `const showArg = condition ? short : 'This is a very long alternate string'\nshow(showArg)`,
          errors: [{ messageId: 'extractArgument' }],
        },
      ],
    })
  })
})
