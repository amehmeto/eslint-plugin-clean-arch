/**
 * @fileoverview Ensure slice files export a slice matching their folder name
 * @author TiedSiren
 *
 * Slice files in "core/blocklist/blocklist.slice.ts" must export "blocklistSlice".
 * The folder name determines the expected slice name.
 */

import { getSettings } from '../lib/settings.js'
import { getLayerFromFilename } from '../lib/layer-utils.js'
import { kebabToCamel, getBaseName } from '../lib/naming-utils.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure slice files export a slice matching their folder name',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Slice file "{{filename}}" must export "{{expectedName}}". Found exports: {{foundExports}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          targetLayer: { type: 'string' },
          fileSuffix: { type: 'string' },
          exportSuffix: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    const settings = getSettings(context)
    const options = context.options[0] || {}
    const targetLayer = options.targetLayer || 'core'
    const fileSuffix = options.fileSuffix || '.slice.ts'
    const exportSuffix = options.exportSuffix || 'Slice'

    // Only apply to files in the target layer
    if (getLayerFromFilename(filename, settings.layers) !== targetLayer)
      return {}

    const basename = getBaseName(filename)

    // Only check files matching the suffix
    if (!basename.endsWith(fileSuffix)) return {}

    // Get the parent folder name (the domain)
    const parts = filename.replace(/\\/g, '/').split('/')
    const folderName = parts[parts.length - 2]

    // Expected: blocklistSlice from blocklist folder
    const expectedSliceName = kebabToCamel(folderName) + exportSuffix
    const foundExports = []

    return {
      // Track named exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export const xSlice = ...
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              if (decl.id && decl.id.name) {
                foundExports.push(decl.id.name)
              }
            })
          }
        }
        // export { xSlice }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.exported && spec.exported.name) {
              foundExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        // Check if the expected slice name was exported
        if (!foundExports.includes(expectedSliceName)) {
          context.report({
            node,
            messageId: 'missingExport',
            data: {
              filename: basename,
              expectedName: expectedSliceName,
              foundExports:
                foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
