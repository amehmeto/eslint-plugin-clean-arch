/**
 * @fileoverview Require colocated test files for usecases, listeners, selectors, schemas, view-models, and helpers
 * @author TiedSiren
 */

import fs from 'fs'

import { getSettings } from '../lib/settings.js'
import { isTestFile, isFixtureFile, isBuilderFile } from '../lib/file-utils.js'
import { getBaseName } from '../lib/naming-utils.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require colocated test files for core modules (usecases, listeners, selectors, schemas, view-models, helpers)',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingUsecaseTest:
        'Usecase "{{filename}}" must have a colocated test file ({{expected}}).',
      missingListenerTest:
        'Listener "{{filename}}" must have a colocated test file ({{expected}}).',
      missingSelectorTest:
        'Selector "{{filename}}" must have a colocated test file ({{expected}}).',
      missingSchemaTest:
        'Schema "{{filename}}" must have a colocated test file ({{expected}}).',
      missingViewModelTest:
        'View model "{{filename}}" must have a colocated test file ({{expected}}).',
      missingHelperTest:
        'Helper "{{filename}}" must have a colocated test file ({{expected}}).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          suffixMap: {
            type: 'object',
            additionalProperties: { type: 'string' },
          },
          selectorPattern: {
            type: 'object',
            properties: {
              directory: { type: 'string' },
              prefix: { type: 'string' },
              testSuffix: { type: 'string' },
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
    const settings = getSettings(context)

    // Skip test files themselves
    if (isTestFile(filename, settings)) return {}

    // Skip fixture, builder, and other non-source files
    if (isFixtureFile(filename, settings)) return {}
    if (isBuilderFile(filename, settings)) return {}
    if (filename.includes('.mock.')) return {}

    const options = context.options[0] || {}

    const suffixMap = options.suffixMap || {
      '.usecase.ts': '.spec.ts',
      '.listener.ts': '.test.ts',
      '.schema.ts': '.test.ts',
      '.view-model.ts': '.test.ts',
      '.helper.ts': '.test.ts',
    }

    const selectorPattern = options.selectorPattern || {
      directory: '/selectors/',
      prefix: 'select',
      testSuffix: '.test.ts',
    }

    // Map from file suffix to messageId
    const suffixToMessageId = {
      '.usecase.ts': 'missingUsecaseTest',
      '.listener.ts': 'missingListenerTest',
      '.schema.ts': 'missingSchemaTest',
      '.view-model.ts': 'missingViewModelTest',
      '.helper.ts': 'missingHelperTest',
    }

    const dirname = filename.replace(/\\/g, '/').split('/').slice(0, -1).join('/')
    const basename = getBaseName(filename)

    function testFileExists(baseName) {
      const nameWithoutExt = baseName.replace('.ts', '')
      const testFile = `${dirname}/${nameWithoutExt}.test.ts`
      const specFile = `${dirname}/${nameWithoutExt}.spec.ts`
      return fs.existsSync(testFile) || fs.existsSync(specFile)
    }

    return {
      Program(node) {
        // Check suffix-based patterns
        for (const [suffix, testSuffix] of Object.entries(suffixMap)) {
          if (basename.endsWith(suffix)) {
            if (!testFileExists(basename)) {
              const expected = basename.replace('.ts', testSuffix)
              const messageId = suffixToMessageId[suffix] || 'missingHelperTest'
              context.report({
                node,
                messageId,
                data: { filename: basename, expected },
              })
            }
          }
        }

        // Selector files in selectors/ directory starting with configured prefix
        if (
          filename.includes(selectorPattern.directory) &&
          basename.startsWith(selectorPattern.prefix) &&
          basename.endsWith('.ts')
        ) {
          if (!testFileExists(basename)) {
            const expected = basename.replace(
              '.ts',
              selectorPattern.testSuffix,
            )
            context.report({
              node,
              messageId: 'missingSelectorTest',
              data: { filename: basename, expected },
            })
          }
        }
      },
    }
  },
}
