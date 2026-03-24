/**
 * @fileoverview Enforce test files in core directories to be named after what they test
 * @author TiedSiren
 */

import { getSettings } from '../lib/settings.js'
import { isInDirectory } from '../lib/file-utils.js'
import { getBaseName } from '../lib/naming-utils.js'

const RULE_DEFAULTS = {
  directories: {
    selectors: '/selectors/',
    usecases: '/usecases/',
    listeners: '/listeners/',
  },
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce test files in selectors/usecases/listeners directories to follow naming conventions',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      badSelectorTestName:
        'Selector test files must be named "select*.test.ts" or "*.view-model.test.ts". Rename or split this file.',
      badUsecaseTestName:
        'Usecase test files must be named "*.usecase.test.ts" (one test file per usecase). Rename or split this file.',
      badListenerTestName:
        'Listener test files must be named "*.listener.test.ts" (one test file per listener). Rename or split this file.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          directories: {
            type: 'object',
            properties: {
              selectors: { type: 'string' },
              usecases: { type: 'string' },
              listeners: { type: 'string' },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()
    const isTestFile =
      filename.endsWith('.test.ts') || filename.endsWith('.spec.ts')

    if (!isTestFile) return {}

    const settings = getSettings(context, RULE_DEFAULTS)
    const directories = settings.directories || RULE_DEFAULTS.directories
    const basename = getBaseName(filename)

    return {
      Program(node) {
        // Selector test files must start with "select" or end with ".view-model.test.ts"
        if (
          isInDirectory(filename, directories.selectors) &&
          !basename.startsWith('select') &&
          !basename.includes('.view-model.')
        ) {
          context.report({ node, messageId: 'badSelectorTestName' })
        }

        // Usecase test files must end with ".usecase.test.ts"
        if (
          isInDirectory(filename, directories.usecases) &&
          !basename.includes('.usecase.')
        ) {
          context.report({ node, messageId: 'badUsecaseTestName' })
        }

        // Listener test files must end with ".listener.test.ts"
        if (
          isInDirectory(filename, directories.listeners) &&
          !basename.includes('.listener.')
        ) {
          context.report({ node, messageId: 'badListenerTestName' })
        }
      },
    }
  },
}
