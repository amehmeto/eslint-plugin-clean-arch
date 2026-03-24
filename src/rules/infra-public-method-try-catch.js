/**
 * @fileoverview Enforce that public async methods in infra adapters have try-catch wrappers.
 * Public methods are the boundary - they should handle errors.
 * Private methods should throw naturally, letting the public method handle it.
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
        'Enforce that public async methods in infra adapters have try-catch wrappers',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      publicMethodNeedsTryCatch:
        'Public async method "{{methodName}}" must have a try-catch wrapper. Public methods are the error boundary - catch errors here, log them, then either rethrow (critical operations) or swallow (fire-and-forget).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          targetLayer: {
            type: 'string',
            default: 'infra',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()
    const settings = getSettings(context)
    const targetLayer = (context.options[0] && context.options[0].targetLayer) || 'infra'

    // Only apply to target layer files, excluding tests and fakes
    const layer = getLayerFromFilename(filename, settings.layers)
    if (layer !== targetLayer) return {}
    if (isTestFile(filename, settings)) return {}
    if (isFakeFile(filename, settings)) return {}

    // Track if we're inside a class
    let currentClass = null

    return {
      ClassDeclaration(node) {
        currentClass = node
      },

      'ClassDeclaration:exit'() {
        currentClass = null
      },

      ClassExpression(node) {
        currentClass = node
      },

      'ClassExpression:exit'() {
        currentClass = null
      },

      MethodDefinition(node) {
        // Only check if we're in a class
        if (!currentClass) return

        // Skip constructors
        if (node.kind === 'constructor') return

        // Skip private methods (they should NOT have try-catch)
        if (isPrivateMethod(node)) return

        // Skip non-async methods (sync methods rarely need try-catch)
        if (!isAsyncMethod(node)) return

        // Skip getters and setters (they're typically simple)
        if (node.kind === 'get' || node.kind === 'set') return

        // Check if the method body contains a try-catch
        const methodBody = node.value?.body
        if (!methodBody || methodBody.type !== 'BlockStatement') return

        const hasTryCatch = containsTryStatement(methodBody.body)

        if (!hasTryCatch) {
          const methodName = getMethodName(node)
          const className = currentClass?.id?.name || 'UnknownClass'
          context.report({
            node,
            messageId: 'publicMethodNeedsTryCatch',
            data: { methodName },
            fix(fixer) {
              return createTryCatchFix(
                fixer,
                node,
                methodBody,
                methodName,
                className,
              )
            },
          })
        }
      },
    }

    function isPrivateMethod(node) {
      // TypeScript private keyword
      if (node.accessibility === 'private') return true

      // ESNext private fields (starting with #)
      if (node.key?.type === 'PrivateIdentifier') return true

      // Convention: methods starting with underscore
      const name = getMethodName(node)
      if (name.startsWith('_')) return true

      return false
    }

    function isAsyncMethod(node) {
      return node.value?.async === true
    }

    function getMethodName(node) {
      if (node.key?.type === 'Identifier') {
        return node.key.name
      }
      // PrivateIdentifier (# syntax) is handled by isPrivateMethod before we get here,
      // so we only need to handle Identifier and computed property names
      return '<anonymous>'
    }

    function containsTryStatement(statements) {
      if (!statements || !Array.isArray(statements)) return false

      for (const stmt of statements) {
        if (stmt.type === 'TryStatement') return true

        // Check inside if/else blocks
        if (stmt.type === 'IfStatement') {
          if (stmt.consequent?.type === 'BlockStatement') {
            if (containsTryStatement(stmt.consequent.body)) return true
          } else if (stmt.consequent?.type === 'TryStatement') {
            return true
          }

          if (stmt.alternate?.type === 'BlockStatement') {
            if (containsTryStatement(stmt.alternate.body)) return true
          } else if (stmt.alternate?.type === 'TryStatement') {
            return true
          } else if (stmt.alternate?.type === 'IfStatement') {
            // Recurse for else-if
            if (containsTryStatement([stmt.alternate])) return true
          }
        }
      }

      return false
    }

    function createTryCatchFix(fixer, node, methodBody, methodName, className) {
      const sourceCode = context.getSourceCode()

      // Get the content inside the method body (between { and })
      const bodyContent = sourceCode.getText(methodBody)

      // Extract the statements inside the braces
      const openBraceIndex = bodyContent.indexOf('{')
      const closeBraceIndex = bodyContent.lastIndexOf('}')
      const innerContent = bodyContent.slice(
        openBraceIndex + 1,
        closeBraceIndex,
      )

      // Detect indentation from the method
      const methodStartLine = sourceCode.getLocFromIndex(node.range[0]).line
      const lines = sourceCode.getText().split('\n')
      const methodLine = lines[methodStartLine - 1] || ''
      const baseIndent = methodLine.match(/^(\s*)/)?.[1] || '  '
      const innerIndent = baseIndent + '  '
      const tryIndent = innerIndent + '  '

      // Re-indent the inner content for inside the try block
      const reindentedContent = innerContent
        .split('\n')
        .map((line) => {
          // Skip empty lines
          if (line.trim() === '') return line
          // Add extra indentation for try block
          return '  ' + line
        })
        .join('\n')

      // Build the new method body
      const newBody = `{
${innerIndent}try {${reindentedContent}
${innerIndent}} catch (error) {
${tryIndent}this.logger.error(\`[${className}] Failed to ${methodName}: \${error}\`)
${tryIndent}throw error
${innerIndent}}
${baseIndent}}`

      return fixer.replaceText(methodBody, newBody)
    }
  },
}
