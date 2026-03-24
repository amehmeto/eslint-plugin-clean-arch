/**
 * @fileoverview Prevent direct usage of Redux entity adapters in UI layer
 * @author TiedSiren
 *
 * UI layer (app/, ui/) cannot use adapters - use selectors instead.
 * Core layer can use adapters freely, including cross-domain.
 */

import { getSettings } from '../lib/settings.js'
import { isTestFile } from '../lib/file-utils.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent direct usage of Redux entity adapters in UI layer files',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noAdapterInUi:
        'Do not use "{{adapterName}}" directly in UI layer. Use a selector from core/ instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          targetPaths: {
            type: 'array',
            items: { type: 'string' },
          },
          adapterSuffix: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()

    const settings = getSettings(context)
    const options = context.options[0] || {}
    const targetPaths = options.targetPaths || ['/app/', '/ui/']
    const adapterSuffix = options.adapterSuffix || 'Adapter'

    // Only apply to UI layer files (configurable target paths)
    const isUiLayer = targetPaths.some((p) => filename.includes(p))
    if (!isUiLayer) return {}

    // Skip test files
    if (isTestFile(filename, settings)) return {}

    return {
      // Check for imports of adapters
      ImportDeclaration(node) {
        node.specifiers.forEach((specifier) => {
          if (specifier.type !== 'ImportSpecifier') return

          const importedName = specifier.imported.name
          if (importedName.endsWith(adapterSuffix)) {
            context.report({
              node: specifier,
              messageId: 'noAdapterInUi',
              data: { adapterName: importedName },
            })
          }
        })
      },

      // Check for member expressions like someAdapter.getSelectors()
      MemberExpression(node) {
        if (node.object.type !== 'Identifier') return

        const objectName = node.object.name
        if (objectName.endsWith(adapterSuffix)) {
          context.report({
            node,
            messageId: 'noAdapterInUi',
            data: { adapterName: objectName },
          })
        }
      },
    }
  },
}
