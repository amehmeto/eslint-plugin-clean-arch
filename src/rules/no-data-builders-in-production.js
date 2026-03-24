/**
 * @fileoverview Prevent data builders from being used in production code.
 * Data builders (build*) should only be called from test files, fixture files,
 * or other data builder files.
 * @author TiedSiren
 */

import { getSettings } from '../lib/settings.js'
import {
  isTestFile,
  isFixtureFile,
  isBuilderFile,
  isFakeFile,
  isTestOrFixture,
} from '../lib/file-utils.js'

const DEFAULT_ALLOWED_FILE_PATTERNS = ['preloadedStateForManualTesting']
const DEFAULT_BUILDER_PREFIX = 'build'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent data builders from being used in production code (SUT files)',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noDataBuilderInProduction:
        '{{ builderName }}() is a data builder and should only be used in test files (*.test.ts, *.spec.ts), fixture files (*.fixture.ts), or other data builders. Remove it from production code.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedFilePatterns: {
            type: 'array',
            items: { type: 'string' },
          },
          builderPrefix: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()
    const settings = getSettings(context)

    const allowedPatterns =
      (context.options[0] && context.options[0].allowedFilePatterns) ||
      DEFAULT_ALLOWED_FILE_PATTERNS
    const builderPrefix =
      (context.options[0] && context.options[0].builderPrefix) ||
      DEFAULT_BUILDER_PREFIX

    // Allow in test files
    if (isTestFile(filename, settings)) return {}

    // Allow in fixture files
    if (isFixtureFile(filename, settings)) return {}

    // Allow in data builder files
    if (isBuilderFile(filename, settings)) return {}

    // Allow in _tests_ directory (test utilities, createTestStore, etc.)
    if (isTestOrFixture(filename, settings)) return {}

    // Allow in fake-data files (test seed data)
    if (isFakeFile(filename, settings)) return {}

    // Allow in configurable additional file patterns
    for (const pattern of allowedPatterns) {
      if (filename.includes(pattern)) return {}
    }

    return {
      CallExpression(node) {
        // Check if it's a function call with name starting with the builder prefix
        if (node.callee.type === 'Identifier') {
          const funcName = node.callee.name
          if (funcName.startsWith(builderPrefix)) {
            context.report({
              node,
              messageId: 'noDataBuilderInProduction',
              data: {
                builderName: funcName,
              },
            })
          }
        }
      },

      // Also check imports to catch early
      ImportDeclaration(node) {
        const source = node.source.value

        // Check if importing from data-builders directory or .builder files
        // Use stricter matching to avoid false positives:
        // - data-builders must be a path segment (preceded by / or start of string)
        // - .builder must be at end of import path (the file extension prefix)
        const isDataBuildersImport =
          source.includes('/data-builders/') ||
          source.startsWith('data-builders/') ||
          source === 'data-builders'
        const isBuilderFileImport = source.endsWith('.builder')

        if (isDataBuildersImport || isBuilderFileImport) {
          // Check each imported specifier
          node.specifiers.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier') {
              const importedName =
                specifier.imported.name || specifier.imported.value
              if (importedName.startsWith(builderPrefix)) {
                context.report({
                  node: specifier,
                  messageId: 'noDataBuilderInProduction',
                  data: {
                    builderName: importedName,
                  },
                })
              }
            }
          })
        }
      },
    }
  },
}
