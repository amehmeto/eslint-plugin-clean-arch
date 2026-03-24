/**
 * @fileoverview Ensure gateway implementations follow naming convention
 * @author TiedSiren
 *
 * Gateway files like "firebase.auth.gateway.ts" must export a class named
 * "FirebaseAuthGateway" - PascalCase of prefix + domain + Gateway.
 */

import { getSettings } from '../lib/settings.js'
import { getLayerFromFilename } from '../lib/layer-utils.js'
import { kebabToPascal, getBaseName } from '../lib/naming-utils.js'
import { isTestFile } from '../lib/file-utils.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure gateway implementations follow naming convention',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Gateway file "{{filename}}" must export a class named "{{expectedName}}". Found exports: {{foundExports}}',
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
    const fileSuffix = options.fileSuffix || '.gateway.ts'
    const exportSuffix = options.exportSuffix || 'Gateway'

    // Only apply to files in the target layer
    if (getLayerFromFilename(filename, settings.layers) !== targetLayer)
      return {}

    const basename = getBaseName(filename)

    // Build regex from fileSuffix: e.g., '.gateway.ts' -> /^([a-z][a-z0-9-]*)\.([a-z][a-z0-9-]*)\.gateway\.ts$/
    const escapedSuffix = fileSuffix.replace(/\./g, '\\.')
    const gatewayMatch = basename.match(
      new RegExp(`^([a-z][a-z0-9-]*)\\.([a-z][a-z0-9-]*)${escapedSuffix}$`),
    )
    if (!gatewayMatch) return {}

    // Skip test files
    if (isTestFile(filename, settings)) return {}

    const prefix = gatewayMatch[1]
    const domain = gatewayMatch[2]

    // Expected: FirebaseAuthGateway
    const expectedClassName =
      kebabToPascal(prefix) + kebabToPascal(domain) + exportSuffix
    const foundExports = []

    return {
      // Track class exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export class XGateway { ... }
          if (
            node.declaration.type === 'ClassDeclaration' &&
            node.declaration.id
          ) {
            foundExports.push(node.declaration.id.name)
          }
        }
        // export { XGateway }
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
