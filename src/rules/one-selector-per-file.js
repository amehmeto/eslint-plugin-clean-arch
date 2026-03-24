/**
 * @fileoverview Enforce one selector per file in selector directories
 * @author TiedSiren
 */

import { isInDirectory } from '../lib/file-utils.js'

const RULE_DEFAULTS = {
  directory: '/selectors/',
  exportPrefix: 'select',
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce one selector per file in selector directories',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      multipleSelectors:
        'Only one selector is allowed per file. Found {{count}} selectors: {{selectors}}. Please split them into separate files.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          directory: { type: 'string' },
          exportPrefix: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()
    const options = { ...RULE_DEFAULTS, ...context.options[0] }

    // Only apply this rule to files in the configured directory
    if (!isInDirectory(filename, options.directory)) return {}

    const selectors = []

    return {
      Program(node) {
        // Collect all exported declarations
        node.body.forEach((statement) => {
          // Handle: export const selectFoo = ...
          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.declaration?.type === 'VariableDeclaration'
          ) {
            statement.declaration.declarations.forEach((declarator) => {
              declarator.id.type === 'Identifier' &&
                declarator.id.name.startsWith(options.exportPrefix) &&
                selectors.push(declarator.id.name)
            })
          }

          // Handle: export function selectFoo() { ... }
          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.declaration?.type === 'FunctionDeclaration'
          ) {
            const funcName = statement.declaration.id?.name
            funcName?.startsWith(options.exportPrefix) &&
              selectors.push(funcName)
          }

          // Handle: const selectFoo = ...; export { selectFoo };
          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.specifiers?.length > 0
          ) {
            statement.specifiers.forEach((specifier) => {
              specifier.type === 'ExportSpecifier' &&
                specifier.exported.name.startsWith(options.exportPrefix) &&
                selectors.push(specifier.exported.name)
            })
          }
        })
      },

      'Program:exit'(node) {
        if (selectors.length > 1) {
          context.report({
            node,
            messageId: 'multipleSelectors',
            data: {
              count: selectors.length,
              selectors: selectors.join(', '),
            },
          })
        }
      },
    }
  },
}
