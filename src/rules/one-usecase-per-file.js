/**
 * @fileoverview Enforce one use case per file in usecase directories
 * @author TiedSiren
 */

import { isInDirectory } from '../lib/file-utils.js'

const RULE_DEFAULTS = {
  directory: '/usecases/',
  excludedExportSuffixes: ['Type', 'Payload', 'Result', 'Response', 'Request'],
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce one use case per file in usecase directories',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      multipleUseCases:
        'Only one use case is allowed per file. Found {{count}} use cases: {{useCases}}. Please split them into separate files.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          directory: { type: 'string' },
          excludedExportSuffixes: {
            type: 'array',
            items: { type: 'string' },
          },
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

    const useCases = []

    function isExcluded(name) {
      return options.excludedExportSuffixes.some((suffix) =>
        name.endsWith(suffix),
      )
    }

    return {
      Program(node) {
        // Collect all exported declarations
        node.body.forEach((statement) => {
          let useCaseName = null

          // Handle: export const startTimer = createAppAsyncThunk(...)
          // Handle: export const loadData = async () => { ... }
          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.declaration?.type === 'VariableDeclaration'
          ) {
            statement.declaration.declarations.forEach((declarator) => {
              if (declarator.id.type === 'Identifier') {
                const name = declarator.id.name
                // Exclude types and test fixtures
                if (!isExcluded(name)) useCaseName = name
              }
            })
          }

          // Handle: export function loadData() { ... }
          // Handle: export async function loadData() { ... }
          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.declaration?.type === 'FunctionDeclaration'
          ) {
            const name = statement.declaration.id?.name
            name?.startsWith('export') && (useCaseName = name)
          }

          // Handle: const loadData = ...; export { loadData };
          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.specifiers?.length > 0
          ) {
            statement.specifiers.forEach((specifier) => {
              if (specifier.type === 'ExportSpecifier') {
                const name = specifier.exported.name
                // Exclude types
                if (!isExcluded(name)) useCaseName = name
              }
            })
          }

          if (useCaseName) useCases.push(useCaseName)
        })
      },

      'Program:exit'(node) {
        if (useCases.length > 1) {
          context.report({
            node,
            messageId: 'multipleUseCases',
            data: {
              count: useCases.length,
              useCases: useCases.join(', '),
            },
          })
        }
      },
    }
  },
}
