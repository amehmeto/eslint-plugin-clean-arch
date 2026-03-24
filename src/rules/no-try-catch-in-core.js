/**
 * @fileoverview Forbid try-catch blocks in core business logic.
 * Core should be pure and deterministic - error handling belongs at boundaries (infra/listeners/UI).
 * @author TiedSiren
 */

import { getSettings } from '../lib/settings.js'
import { isTestFile, isFixtureFile, isInDirectory } from '../lib/file-utils.js'
import { getLayerFromFilename } from '../lib/layer-utils.js'

const DEFAULT_EXCLUDED_DIRECTORIES = ['/listeners/']

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Forbid try-catch blocks in core business logic. Error handling should be at boundaries.',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noTryCatchInCore:
        'Try-catch blocks are not allowed in core business logic. Handle errors at the boundaries (infra, listeners, UI) instead. Core should remain pure and testable.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          excludedDirectories: {
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

    const layer = getLayerFromFilename(filename, settings.layers)
    if (layer !== 'core') return {}

    // Exclude test and fixture files
    if (isTestFile(filename, settings)) return {}
    if (isFixtureFile(filename, settings)) return {}

    // Exclude configurable directories (e.g., listeners at the boundary)
    const excludedDirs =
      (context.options[0] && context.options[0].excludedDirectories) ||
      DEFAULT_EXCLUDED_DIRECTORIES
    for (const dir of excludedDirs) {
      if (isInDirectory(filename, dir)) return {}
    }

    return {
      TryStatement(node) {
        context.report({
          node,
          messageId: 'noTryCatchInCore',
        })
      },
    }
  },
}
