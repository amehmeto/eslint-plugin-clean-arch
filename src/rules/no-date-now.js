/**
 * @fileoverview Disallow direct usage of Date.now()
 * @author TiedSiren
 *
 * Flags calls to `Date.now()`. Production code should use
 * `dateProvider.getNowMs()` instead to keep time testable.
 *
 * BAD:
 *   const now = Date.now()
 *
 * GOOD:
 *   const now = dateProvider.getNowMs()
 */

import { getSettings } from '../lib/settings.js'
import {
  isTestFile,
  isFixtureFile,
  isBuilderFile,
  isTestOrFixture,
} from '../lib/file-utils.js'
import { getLayerFromFilename } from '../lib/layer-utils.js'

const DEFAULT_TARGET_LAYERS = ['core', 'ui']

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct usage of `Date.now()`',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noDateNow:
        'Use `dateProvider.getNowMs()` instead of `Date.now()` to keep time testable.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          targetLayers: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()
    const settings = getSettings(context)

    const targetLayers =
      (context.options[0] && context.options[0].targetLayers) ||
      DEFAULT_TARGET_LAYERS

    // Only enforce in target layer production code
    const layer = getLayerFromFilename(filename, settings.layers)
    if (!layer || !targetLayers.includes(layer)) return {}

    // Exclude test, fixture, builder files and _tests_ directories
    if (isTestFile(filename, settings)) return {}
    if (isFixtureFile(filename, settings)) return {}
    if (isBuilderFile(filename, settings)) return {}
    if (isTestOrFixture(filename, settings)) return {}

    return {
      CallExpression(node) {
        const { callee } = node
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'Date' &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'now'
        ) {
          context.report({
            node,
            messageId: 'noDateNow',
          })
        }
      },
    }
  },
}
