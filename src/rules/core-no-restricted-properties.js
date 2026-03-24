/**
 * @fileoverview Ban non-deterministic property access in core production code.
 * Scoped to core/**\/*.ts, excluding tests, fixtures, ports, and builders.
 * Replaces ESLint's no-restricted-properties with file-path scoping for OxLint.
 * @author TiedSiren
 */

import { getSettings } from '../lib/settings.js'
import { isCoreProductionFile } from '../lib/file-utils.js'

const DEFAULT_RESTRICTED_PROPERTIES = [
  {
    object: 'Math',
    property: 'random',
    message:
      'Non-deterministic: Use RandomProvider dependency instead of Math.random() in core.',
  },
  {
    object: 'process',
    property: 'env',
    message:
      'Non-deterministic: Use ConfigProvider dependency instead of process.env in core.',
  },
  {
    object: 'window',
    property: 'location',
    message:
      'Non-deterministic: Use RouterProvider dependency instead of window.location in core.',
  },
  {
    object: 'window',
    property: 'localStorage',
    message:
      'Non-deterministic: Use a Repository dependency instead of window.localStorage in core.',
  },
  {
    object: 'window',
    property: 'sessionStorage',
    message:
      'Non-deterministic: Use a Repository dependency instead of window.sessionStorage in core.',
  },
]

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ban non-deterministic property access in core production code',
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
          restrictedProperties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                object: { type: 'string' },
                property: { type: 'string' },
                message: { type: 'string' },
              },
              required: ['object', 'property', 'message'],
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

    const properties =
      (context.options[0] && context.options[0].restrictedProperties) ||
      DEFAULT_RESTRICTED_PROPERTIES

    return {
      MemberExpression(node) {
        if (node.object.type !== 'Identifier') return
        if (node.property.type !== 'Identifier') return

        const objName = node.object.name
        const propName = node.property.name

        for (const restriction of properties)
          if (
            restriction.object === objName &&
            restriction.property === propName
          )
            context.report({
              node,
              messageId: 'restricted',
              data: { message: restriction.message },
            })
      },
    }
  },
}
