/**
 * @fileoverview Ban non-deterministic imports in core production code.
 * Scoped to core/**\/*.ts, excluding tests, fixtures, ports, and builders.
 * Replaces ESLint's no-restricted-imports with file-path scoping for OxLint.
 * @author TiedSiren
 */

import { getSettings } from '../lib/settings.js'
import { isCoreProductionFile } from '../lib/file-utils.js'

const DEFAULT_RESTRICTED_IMPORTS = [
  {
    name: 'uuid',
    message:
      'Non-deterministic: Use UuidProvider dependency instead of uuid in core.',
  },
  {
    name: 'react-native-uuid',
    message:
      'Non-deterministic: Use UuidProvider dependency instead of react-native-uuid in core.',
  },
  {
    name: 'crypto',
    message:
      'Non-deterministic: Use UuidProvider dependency instead of crypto in core.',
  },
  {
    name: '@faker-js/faker',
    message:
      'Non-deterministic: Use data builders with injected dependencies instead of faker in core.',
  },
]

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ban non-deterministic imports in core production code',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      restricted: '{{ message }}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          restrictedImports: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                message: { type: 'string' },
              },
              required: ['name', 'message'],
              additionalProperties: false,
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

    if (!isCoreProductionFile(filename, settings)) return {}

    const imports =
      (context.options[0] && context.options[0].restrictedImports) ||
      DEFAULT_RESTRICTED_IMPORTS
    const restrictedNames = new Set(imports.map((i) => i.name))
    const messageMap = Object.fromEntries(
      imports.map((i) => [i.name, i.message]),
    )

    return {
      ImportDeclaration(node) {
        const source = node.source.value
        if (restrictedNames.has(source))
          context.report({
            node,
            messageId: 'restricted',
            data: { message: messageMap[source] },
          })
      },
    }
  },
}
