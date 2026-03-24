/**
 * @fileoverview Ensure repository implementations follow naming convention
 * @author TiedSiren
 *
 * Repository files like "pouchdb.block-session.repository.ts" must export
 * a class named "PouchdbBlockSessionRepository" - PascalCase of prefix + domain + Repository.
 */

import { getSettings } from '../lib/settings.js'
import { getLayerFromFilename } from '../lib/layer-utils.js'
import { kebabToPascal, getBaseName } from '../lib/naming-utils.js'
import { isTestFile } from '../lib/file-utils.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure repository implementations follow naming convention',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Repository file "{{filename}}" must export a class named "{{expectedName}}". Found exports: {{foundExports}}',
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
    const targetLayer = options.targetLayer || 'infra'
    const fileSuffix = options.fileSuffix || '.repository.ts'
    const exportSuffix = options.exportSuffix || 'Repository'

    // Only apply to files in the target layer
    if (getLayerFromFilename(filename, settings.layers) !== targetLayer)
      return {}

    const basename = getBaseName(filename)

    // Build regex from fileSuffix: e.g., '.repository.ts' -> /^([a-z][a-z0-9-]*)\.([a-z][a-z0-9-]*)\.repository\.ts$/
    const escapedSuffix = fileSuffix.replace(/\./g, '\\.')
    const repoMatch = basename.match(
      new RegExp(`^([a-z][a-z0-9-]*)\\.([a-z][a-z0-9-]*)${escapedSuffix}$`),
    )
    if (!repoMatch) return {}

    // Skip test files
    if (isTestFile(filename, settings)) return {}

    const prefix = repoMatch[1]
    const domain = repoMatch[2]

    // Expected: PouchdbBlockSessionRepository
    const expectedClassName =
      kebabToPascal(prefix) + kebabToPascal(domain) + exportSuffix
    const foundExports = []

    return {
      // Track class exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export class XRepository { ... }
          if (
            node.declaration.type === 'ClassDeclaration' &&
            node.declaration.id
          ) {
            foundExports.push(node.declaration.id.name)
          }
        }
        // export { XRepository }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.exported && spec.exported.name) {
              foundExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        // Check if the expected class name was exported
        if (!foundExports.includes(expectedClassName)) {
          context.report({
            node,
            messageId: 'missingExport',
            data: {
              filename: basename,
              expectedName: expectedClassName,
              foundExports:
                foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
