/**
 * @fileoverview Disallow index.ts barrel files in core/ directory
 * @author TiedSiren
 *
 * Barrel files (index.ts) can hide dependencies and make it harder to understand
 * the actual imports. In the core layer, we want explicit imports for better
 * traceability and to avoid circular dependencies.
 */

import path from 'path'
import { getSettings } from '../lib/settings.js'
import { getLayerFromFilename } from '../lib/layer-utils.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow index.ts barrel files in core/ directory',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noIndexInCore:
        'Barrel files (index.ts) are not allowed in core/. Use explicit imports instead. Found: "{{filename}}"',
    },
    schema: [
      {
        type: 'object',
        properties: {
          targetLayer: {
            type: 'string',
          },
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
    const targetLayer =
      (context.options[0] && context.options[0].targetLayer) || 'core'
    const basename = path.basename(filename)

    return {
      Program(node) {
        // Check if we're in the target layer
        const layer = getLayerFromFilename(filename, settings.layers)
        if (layer !== targetLayer) return

        // Check if this is an index file
        if (basename === 'index.ts' || basename === 'index.tsx') {
          context.report({
            node,
            messageId: 'noIndexInCore',
            data: { filename: basename },
          })
        }
      },
    }
  },
}
