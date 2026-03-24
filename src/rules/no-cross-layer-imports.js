/**
 * @fileoverview Enforce hexagonal architecture layer boundaries
 * @author TiedSiren
 *
 * Ensures clean architecture layering:
 * - core/ cannot import from infra/ or ui/
 * - infra/ cannot import from ui/
 * - ui/ can import from both core/ and infra/ (it's the composition root)
 *
 * Test files and fixtures are excluded because test composition
 * (like UI layer) needs to wire up all layers.
 *
 * Layer configuration and forbidden imports are read from shared settings,
 * making this rule work with ANY layer configuration, not just core/infra/ui.
 */

import { getSettings } from '../lib/settings.js'
import { getLayerFromFilename, getImportLayer, isImportForbidden } from '../lib/layer-utils.js'
import { isTestOrFixture } from '../lib/file-utils.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce hexagonal architecture layer boundaries',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      forbiddenImport:
        'Layer "{{fromLayer}}" cannot import from "{{toLayer}}". This violates hexagonal architecture boundaries.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          layers: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                aliases: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['path'],
            },
          },
          forbiddenImports: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()
    const settings = getSettings(context)

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    // Skip test files and fixtures (they're allowed to compose layers)
    if (isTestOrFixture(filename, settings)) return {}

    const currentLayer = getLayerFromFilename(filename, settings.layers)

    // Skip files not in a recognized layer
    if (!currentLayer) return {}

    function checkImport(node, importPath) {
      const importLayer = getImportLayer(importPath, settings.layers)

      if (importLayer && isImportForbidden(currentLayer, importLayer, settings.forbiddenImports)) {
        context.report({
          node,
          messageId: 'forbiddenImport',
          data: {
            fromLayer: currentLayer,
            toLayer: importLayer,
          },
        })
      }
    }

    return {
      ImportDeclaration(node) {
        checkImport(node, node.source.value)
      },

      // Check dynamic imports (import() expressions)
      ImportExpression(node) {
        if (node.source && node.source.type === 'Literal') {
          checkImport(node, node.source.value)
        }
      },
    }
  },
}
