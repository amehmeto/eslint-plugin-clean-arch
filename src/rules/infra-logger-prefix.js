/**
 * @fileoverview Enforce that all logger calls use class name prefix.
 * Format: [ClassName] Log message
 * This makes logs easier to filter and trace in production.
 * @author TiedSiren
 */

import { getSettings } from '../lib/settings.js'
import { isTestFile, isFixtureFile } from '../lib/file-utils.js'

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce that all logger calls (info/warn/error/debug) use [ClassName] prefix',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      missingPrefix:
        'Logger {{method}}() must start with [{{className}}] prefix. Use: this.logger.{{method}}(`[{{className}}] Your message here`)',
    },
    schema: [
      {
        type: 'object',
        properties: {
          loggerMethods: {
            type: 'array',
            items: { type: 'string' },
            default: ['info', 'warn', 'error', 'debug'],
          },
          loggerPropertyName: {
            type: 'string',
            default: 'logger',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()
    const settings = getSettings(context)
    const options = context.options[0] || {}
    const loggerMethods = options.loggerMethods || ['info', 'warn', 'error', 'debug']
    const loggerPropertyName = options.loggerPropertyName || 'logger'

    // Exclude test and fixture files
    if (isTestFile(filename, settings)) return {}
    if (isFixtureFile(filename, settings)) return {}

    let currentClassName = null

    return {
      ClassDeclaration(node) {
        if (node.id?.name) {
          currentClassName = node.id.name
        }
      },

      'ClassDeclaration:exit'() {
        currentClassName = null
      },

      ClassExpression(node) {
        if (node.id?.name) {
          currentClassName = node.id.name
        }
      },

      'ClassExpression:exit'() {
        currentClassName = null
      },

      CallExpression(node) {
        if (!currentClassName) return

        // Check for this.<loggerPropertyName>.<method>() calls
        if (!isLoggerCall(node)) return

        const methodName = node.callee.property.name
        if (!loggerMethods.includes(methodName)) return

        // Get the first argument (the message)
        const firstArg = node.arguments[0]
        if (!firstArg) return

        const expectedPrefix = `[${currentClassName}]`

        // Check if message starts with the expected prefix
        if (!messageStartsWithPrefix(firstArg, expectedPrefix)) {
          context.report({
            node: firstArg,
            messageId: 'missingPrefix',
            data: {
              method: methodName,
              className: currentClassName,
            },
            fix(fixer) {
              return createPrefixFix(fixer, firstArg, expectedPrefix)
            },
          })
        }
      },
    }

    function isLoggerCall(node) {
      // Match: this.<loggerPropertyName>.<method>() calls
      if (node.callee.type !== 'MemberExpression') return false

      const object = node.callee.object
      if (object.type !== 'MemberExpression') return false

      // Check for this.<loggerPropertyName>
      if (object.object.type !== 'ThisExpression') return false
      if (object.property.name !== loggerPropertyName) return false

      return true
    }

    function messageStartsWithPrefix(arg, expectedPrefix) {
      // Handle template literal: `[ClassName] message`
      if (arg.type === 'TemplateLiteral') {
        const firstQuasi = arg.quasis[0]
        if (firstQuasi?.value?.raw?.startsWith(expectedPrefix)) {
          return true
        }
        return false
      }

      // Handle string literal: '[ClassName] message'
      if (arg.type === 'Literal' && typeof arg.value === 'string') {
        return arg.value.startsWith(expectedPrefix)
      }

      // Can't determine - allow it (avoid false positives)
      return true
    }

    function createPrefixFix(fixer, arg, expectedPrefix) {
      const sourceCode = context.getSourceCode()

      // Handle template literal: `message` -> `[ClassName] message`
      if (arg.type === 'TemplateLiteral') {
        const firstQuasi = arg.quasis[0]
        if (firstQuasi) {
          // Insert prefix at the start of the template literal content
          const insertPosition = firstQuasi.range[0] + 1 // After the backtick or after ${
          return fixer.insertTextBeforeRange(
            [insertPosition, insertPosition],
            expectedPrefix + ' ',
          )
        }
      }

      // Handle string literal: 'message' -> '[ClassName] message'
      // Note: This is the only other case that triggers an error (since messageStartsWithPrefix
      // returns true for non-string/template arguments to avoid false positives)
      const quote = sourceCode.getText(arg)[0] // Get the quote character (' or ")
      const newValue = expectedPrefix + ' ' + arg.value
      return fixer.replaceText(arg, quote + newValue + quote)
    }
  },
}
