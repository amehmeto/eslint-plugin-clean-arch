/**
 * @fileoverview Ensure listener files export a function matching their filename
 * @author TiedSiren
 *
 * Listener files named "on-user-logged-in.listener.ts" must export "onUserLoggedInListener".
 * The filename uses kebab-case, the export uses camelCase + "Listener" suffix.
 */

import { isInDirectory } from '../lib/file-utils.js'
import { kebabToCamel, getBaseName } from '../lib/naming-utils.js'

const RULE_DEFAULTS = {
  directory: '/listeners/',
  fileSuffix: 'listener',
  exportSuffix: 'Listener',
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure listener files export a function matching their filename',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Listener file "{{filename}}" must export a function named "{{expectedName}}". Found exports: {{foundExports}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          directory: { type: 'string' },
          fileSuffix: { type: 'string' },
          exportSuffix: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()
    const options = { ...RULE_DEFAULTS, ...context.options[0] }

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    // Only apply to listener files
    if (!isInDirectory(filename, options.directory)) return {}

    const basename = getBaseName(filename)

    // Only check kebab-case.listener.ts files (not tests)
    const suffixPattern = new RegExp(
      `^([a-z][a-z0-9-]*)\\.${options.fileSuffix}\\.ts$`,
    )
    const listenerMatch = basename.match(suffixPattern)
    if (!listenerMatch) return {}

    const kebabName = listenerMatch[1]
    const expectedListenerName = kebabToCamel(kebabName) + options.exportSuffix
    const foundExports = []

    return {
      // Track named exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export const onXListener = ...
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              if (decl.id && decl.id.name) {
                foundExports.push(decl.id.name)
              }
            })
          }
          // export function onXListener() { ... }
          if (
            node.declaration.type === 'FunctionDeclaration' &&
            node.declaration.id
          ) {
            foundExports.push(node.declaration.id.name)
          }
        }
        // export { onXListener }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.exported && spec.exported.name) {
              foundExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        // Check if the expected listener name was exported
        if (!foundExports.includes(expectedListenerName)) {
          context.report({
            node,
            messageId: 'missingExport',
            data: {
              filename: basename,
              expectedName: expectedListenerName,
              foundExports:
                foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
