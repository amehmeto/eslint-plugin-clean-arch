/**
 * @fileoverview Tests for no-nested-call-expressions rule
 */

import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

import rule from '../../src/rules/no-nested-call-expressions.js'

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

describe('no-nested-call-expressions', () => {
  it('should pass all rule tests', () => {
    ruleTester.run('no-nested-call-expressions', rule, {
      valid: [
        // Non-nested call - should NOT report
        {
          code: `foo(x)`,
        },
        // Variable as argument - should NOT report
        {
          code: `
        const result = bar(x)
        foo(result)
      `,
        },
        // Allowed inner pattern - should NOT report
        {
          code: `foo(map(items))`,
          options: [{ allowedPatterns: ['^map$'] }],
        },
        // Allowed outer pattern - should NOT report
        {
          code: `filter(inner(x))`,
          options: [{ allowedPatterns: ['^filter$'] }],
        },
        // Method call with allowed pattern - should NOT report
        {
          code: `transform(items.map(fn))`,
          options: [{ allowedPatterns: ['^map$'] }],
        },
        // Outer method call with allowed pattern - should NOT report
        {
          code: `items.filter(getValue(x))`,
          options: [{ allowedPatterns: ['^filter$'] }],
        },
        // Multiple allowed patterns - should NOT report
        {
          code: `transform(items.flatMap(fn))`,
          options: [{ allowedPatterns: ['^map$', '^flatMap$', '^filter$'] }],
        },
        // allowNoArguments: nested call with no args - should NOT report
        {
          code: `selectUser(store.getState())`,
          options: [{ allowNoArguments: true }],
        },
        // allowNoArguments: chained no-arg calls - should NOT report
        {
          code: `process(obj.getValue())`,
          options: [{ allowNoArguments: true }],
        },
        // dispatch is always allowed (idiomatic Redux)
        {
          code: `store.dispatch(createAction(payload))`,
        },
        // Literal arguments - should NOT report
        {
          code: `foo(42, "string", true)`,
        },
        // Object/array arguments - should NOT report
        {
          code: `foo({ a: 1 }, [1, 2, 3])`,
        },
        // NewExpression with allowed pattern - should NOT report
        {
          code: `foo(new Error(msg))`,
          options: [{ allowedPatterns: ['^Error$'] }],
        },
        // NewExpression with no arguments when allowNoArguments - should NOT report
        {
          code: `foo(new Error())`,
          options: [{ allowNoArguments: true }],
        },
      ],

      invalid: [
        // Basic nested call - SHOULD report
        {
          code: `foo(bar(x))`,
          output: `const barResult = bar(x)\nfoo(barResult)`,
          errors: [
            { messageId: 'noNestedCalls', data: { innerCall: 'bar(...)' } },
          ],
        },
        // Nested method call - SHOULD report
        {
          code: `process(obj.getValue())`,
          output: `const getValueResult = obj.getValue()\nprocess(getValueResult)`,
          errors: [
            {
              messageId: 'noNestedCalls',
              data: { innerCall: 'getValue(...)' },
            },
          ],
        },
        // Outer method call with nested function - SHOULD report
        {
          code: `obj.process(inner(x))`,
          output: `const innerResult = inner(x)\nobj.process(innerResult)`,
          errors: [
            { messageId: 'noNestedCalls', data: { innerCall: 'inner(...)' } },
          ],
        },
        // Multiple nested calls in same expression - SHOULD report both
        {
          code: `foo(bar(x), baz(y))`,
          output: `const barResult = bar(x)\nfoo(barResult, baz(y))`,
          errors: [
            { messageId: 'noNestedCalls', data: { innerCall: 'bar(...)' } },
            { messageId: 'noNestedCalls', data: { innerCall: 'baz(...)' } },
          ],
        },
        // With options but neither matches - SHOULD report
        {
          code: `outer(inner(x))`,
          output: `const innerResult = inner(x)\nouter(innerResult)`,
          options: [{ allowedPatterns: ['^allowed$'] }],
          errors: [
            { messageId: 'noNestedCalls', data: { innerCall: 'inner(...)' } },
          ],
        },
        // Computed property access on inner call - SHOULD report with '...'
        {
          code: `outer(obj['method'](x))`,
          output: `const callResult = obj['method'](x)\nouter(callResult)`,
          errors: [
            { messageId: 'noNestedCalls', data: { innerCall: '...(...)' } },
          ],
        },
        // Computed property access on outer call - SHOULD report inner
        {
          code: `obj['method'](inner(x))`,
          output: `const innerResult = inner(x)\nobj['method'](innerResult)`,
          errors: [
            { messageId: 'noNestedCalls', data: { innerCall: 'inner(...)' } },
          ],
        },
        // IIFE as inner call (callee is FunctionExpression) - SHOULD report with '...'
        {
          code: `outer((function() { return 1 })(x))`,
          output: `const callResult = (function() { return 1 })(x)\nouter(callResult)`,
          errors: [
            { messageId: 'noNestedCalls', data: { innerCall: '...(...)' } },
          ],
        },
        // allowNoArguments: still reports when inner call HAS arguments (non-dispatch)
        {
          code: `process(createAction(payload))`,
          output: `const createActionResult = createAction(payload)\nprocess(createActionResult)`,
          options: [{ allowNoArguments: true }],
          errors: [
            {
              messageId: 'noNestedCalls',
              data: { innerCall: 'createAction(...)' },
            },
          ],
        },
        // NewExpression as argument - SHOULD report
        {
          code: `Promise.reject(new Error(msg))`,
          output: `const ErrorResult = new Error(msg)\nPromise.reject(ErrorResult)`,
          errors: [
            {
              messageId: 'noNestedCalls',
              data: { innerCall: 'new Error(...)' },
            },
          ],
        },
        // NewExpression with allowNoArguments but HAS arguments - SHOULD report
        {
          code: `foo(new Error(msg))`,
          output: `const ErrorResult = new Error(msg)\nfoo(ErrorResult)`,
          options: [{ allowNoArguments: true }],
          errors: [
            {
              messageId: 'noNestedCalls',
              data: { innerCall: 'new Error(...)' },
            },
          ],
        },
      ],
    })
  })
})
