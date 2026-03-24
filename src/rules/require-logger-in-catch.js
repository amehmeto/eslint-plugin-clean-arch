/**
 * @fileoverview Require a logger call inside every catch block in infra layer.
 *
 * Catch blocks should always log the error before rethrowing or returning.
 * This ensures that the original error context (stack trace, Firebase error code, etc.)
 * is preserved in logs, even when the rethrown error has a translated user-friendly message.
 *
 * @author TiedSiren
 */

import { getSettings } from '../lib/settings.js'
import { getLayerFromFilename } from '../lib/layer-utils.js'
import { isTestFile, isFakeFile } from '../lib/file-utils.js'

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require a logger call (this.logger.error/warn/info) inside catch blocks in infra layer',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      requireLogger:
        'Catch blocks in infra must log the error via this.logger before rethrowing. Use: this.logger.error(`[ClassName] Failed to methodName: ${error}`)',
    },
    schema: [
      {
        type: 'object',
        properties: {
          targetLayer: {
            type: 'string',
            default: 'infra',
          },
          loggerExpression: {
            type: 'string',
            default: 'this.logger',
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
    const targetLayer = options.targetLayer || 'infra'
    const loggerExpression = options.loggerExpression || 'this.logger'

    // Only apply to target layer files, excluding tests and fakes
    const layer = getLayerFromFilename(filename, settings.layers)
    if (layer !== targetLayer) return {}
    if (isTestFile(filename, settings)) return {}
    if (isFakeFile(filename, settings)) return {}

    // Parse the logger expression into parts for AST matching
    // e.g., 'this.logger' -> ['this', 'logger']
    const loggerParts = loggerExpression.split('.')

    return {
      CatchClause(node) {
        const body = node.body.body
        if (!body || body.length === 0) {
          context.report({ node, messageId: 'requireLogger' })
          return
        }

        const hasLoggerCall = body.some((stmt) => containsLoggerCall(stmt))

        if (!hasLoggerCall) {
          context.report({ node, messageId: 'requireLogger' })
        }
      },
    }

    function containsLoggerCall(node) {
      if (!node) return false

      // ExpressionStatement wrapping a call expression
      if (node.type === 'ExpressionStatement')
        return containsLoggerCall(node.expression)

      // Direct call: <loggerExpression>.<method>(...)
      if (node.type === 'CallExpression') {
        const callee = node.callee
        if (callee.type === 'MemberExpression') {
          return matchesLoggerExpression(callee.object)
        }
      }

      return false
    }

    function matchesLoggerExpression(node) {
      // Walk backwards through the logger parts to match the AST
      // For 'this.logger': object=ThisExpression, property='logger'
      if (loggerParts.length === 1) {
        // Simple identifier, e.g., 'logger'
        return (
          node.type === 'Identifier' && node.name === loggerParts[0]
        )
      }

      if (loggerParts.length === 2) {
        // Member expression, e.g., 'this.logger'
        if (node.type !== 'MemberExpression') return false

        const objectPart = loggerParts[0]
        const propertyPart = loggerParts[1]

        const objectMatches =
          objectPart === 'this'
            ? node.object.type === 'ThisExpression'
            : node.object.type === 'Identifier' &&
              node.object.name === objectPart

        const propertyMatches =
          node.property.type === 'Identifier' &&
          node.property.name === propertyPart

        return objectMatches && propertyMatches
      }

      // For deeper nesting (e.g., 'this.services.logger'), do a recursive match
      if (node.type !== 'MemberExpression') return false

      const propertyPart = loggerParts[loggerParts.length - 1]
      if (
        node.property.type !== 'Identifier' ||
        node.property.name !== propertyPart
      )
        return false

      // Recursively match the remaining parts
      const remainingParts = loggerParts.slice(0, -1)
      return matchesNestedExpression(node.object, remainingParts)
    }

    function matchesNestedExpression(node, parts) {
      if (parts.length === 1) {
        if (parts[0] === 'this') return node.type === 'ThisExpression'
        return node.type === 'Identifier' && node.name === parts[0]
      }

      if (node.type !== 'MemberExpression') return false

      const propertyPart = parts[parts.length - 1]
      if (
        node.property.type !== 'Identifier' ||
        node.property.name !== propertyPart
      )
        return false

      return matchesNestedExpression(node.object, parts.slice(0, -1))
    }
  },
}
