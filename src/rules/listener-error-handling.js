/**
 * @fileoverview Enforce error handling in listener files.
 * Listeners run in response to state changes and should handle errors gracefully
 * to prevent crashes. They should use try-catch or call safe* prefixed functions.
 * @author TiedSiren
 */

import { getSettings } from '../lib/settings.js'
import { isTestFile, isFixtureFile } from '../lib/file-utils.js'

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce that listener files have proper error handling via try-catch or safe* functions',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingErrorHandling:
        'Listener functions should have error handling. Use try-catch blocks or call safe* prefixed helper functions to handle potential errors gracefully.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          directory: { type: 'string' },
          safePrefix: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()

    const settings = getSettings(context)
    const options = context.options[0] || {}
    const directory = options.directory || '/listeners/'
    const safePrefix = options.safePrefix || 'safe'

    // Only apply to files in the configured directory, excluding tests and fixtures
    if (!filename.includes(directory)) return {}
    if (isTestFile(filename, settings)) return {}
    if (isFixtureFile(filename, settings)) return {}

    let hasTryCatch = false
    let hasSafeCall = false

    return {
      TryStatement() {
        hasTryCatch = true
      },

      CallExpression(node) {
        // Check for calls to safe* prefixed functions
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name.startsWith(safePrefix)
        ) {
          hasSafeCall = true
        }

        // Also check method calls like this.safeMethod()
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name.startsWith(safePrefix)
        ) {
          hasSafeCall = true
        }
      },

      'Program:exit'(node) {
        // If neither try-catch nor safe* calls found, report on the program
        if (!hasTryCatch && !hasSafeCall) {
          context.report({
            node,
            messageId: 'missingErrorHandling',
          })
        }
      },
    }
  },
}
