/**
 * @fileoverview Enforce one listener export per file in listener files
 * @author TiedSiren
 *
 * Similar to one-selector-per-file and one-usecase-per-file, this ensures
 * listener files export only one listener function to maintain single responsibility.
 */

import { isInDirectory, isTestFile } from '../lib/file-utils.js'
import { getSettings } from '../lib/settings.js'
import { getBaseName } from '../lib/naming-utils.js'

const RULE_DEFAULTS = {
  directory: '/listeners/',
  exportSuffix: 'Listener',
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce one listener export per file in listener files',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      multipleListeners:
        'Listener file "{{filename}}" should export only one listener. Found {{count}} listener exports: {{listeners}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          directory: { type: 'string' },
          exportSuffix: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()
    const settings = getSettings(context, RULE_DEFAULTS)
    const options = { ...RULE_DEFAULTS, ...context.options[0] }

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    // Only apply to listener files
    if (!isInDirectory(filename, options.directory)) return {}

    const basename = getBaseName(filename)

    // Skip test files
    if (isTestFile(filename, settings)) return {}

    // Only check .listener.ts files
    if (!basename.endsWith('.listener.ts')) return {}

    const listenerExports = []

    return {
      // Track named exports that look like listeners
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export const onXListener = ...
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              if (
                decl.id &&
                decl.id.name &&
                decl.id.name.endsWith(options.exportSuffix)
              ) {
                listenerExports.push(decl.id.name)
              }
            })
          }
          // export function onXListener() { ... }
          if (
            node.declaration.type === 'FunctionDeclaration' &&
            node.declaration.id &&
            node.declaration.id.name.endsWith(options.exportSuffix)
          ) {
            listenerExports.push(node.declaration.id.name)
          }
        }
        // export { onXListener }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (
              spec.exported &&
              spec.exported.name &&
              spec.exported.name.endsWith(options.exportSuffix)
            ) {
              listenerExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        if (listenerExports.length > 1) {
          context.report({
            node,
            messageId: 'multipleListeners',
            data: {
              filename: basename,
              count: listenerExports.length,
              listeners: listenerExports.join(', '),
            },
          })
        }
      },
    }
  },
}
