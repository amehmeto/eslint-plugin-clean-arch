/**
 * @fileoverview Ensure reducer.ts files are in domain folders within core/
 * @author TiedSiren
 *
 * Reducer files should be located directly in a domain folder like:
 * - core/auth/reducer.ts ✓
 * - core/blocklist/reducer.ts ✓
 * - core/reducer.ts ✗ (not in a domain folder)
 * - infra/auth/reducer.ts ✗ (not in core/)
 */

import { getSettings } from '../lib/settings.js'
import { getLayerFromFilename } from '../lib/layer-utils.js'
import { getBaseName } from '../lib/naming-utils.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure reducer.ts files are in domain folders within core/',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      wrongLocation:
        'Reducer file "{{filename}}" should be in a domain folder within core/ (e.g., core/auth/reducer.ts). Current location: {{location}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          targetLayer: { type: 'string' },
          filename: { type: 'string' },
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
    const targetFilename = options.filename || 'reducer.ts'

    const basename = getBaseName(filename)

    // Only check the target filename
    if (basename !== targetFilename) return {}

    return {
      Program(node) {
        const layer = getLayerFromFilename(filename, settings.layers)
        const layerConfig = settings.layers[targetLayer]

        // Must be in the target layer
        if (layer !== targetLayer) {
          context.report({
            node,
            messageId: 'wrongLocation',
            data: {
              filename: basename,
              location: filename,
            },
          })
          return
        }

        // Get path after the layer directory
        const layerPath = layerConfig.path
        const layerIndex = filename.indexOf(layerPath)
        const pathAfterLayer = filename.slice(layerIndex + layerPath.length)
        const parts = pathAfterLayer.split('/')

        // Should be exactly domain/reducer.ts (2 parts)
        // e.g., ['auth', 'reducer.ts']
        if (parts.length !== 2) {
          context.report({
            node,
            messageId: 'wrongLocation',
            data: {
              filename: basename,
              location: filename,
            },
          })
        }
      },
    }
  },
}
