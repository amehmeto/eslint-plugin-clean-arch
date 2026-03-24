/**
 * @fileoverview Ensure usecase files export a thunk matching their filename
 * @author TiedSiren
 *
 * Usecase files named "do-something.usecase.ts" must export a thunk named "doSomething".
 * The filename uses kebab-case, the export uses camelCase.
 */

import { isInDirectory } from '../lib/file-utils.js'
import { getSettings } from '../lib/settings.js'
import { getLayerFromFilename } from '../lib/layer-utils.js'
import { kebabToCamel, getBaseName } from '../lib/naming-utils.js'

const RULE_DEFAULTS = {
  directory: '/usecases/',
  fileSuffix: 'usecase',
  layer: 'core',
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure usecase files export a thunk matching their filename',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingExport:
        'Usecase file "{{filename}}" must export a thunk named "{{expectedName}}". Found exports: {{foundExports}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          directory: { type: 'string' },
          fileSuffix: { type: 'string' },
          layer: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()
    const settings = getSettings(context, RULE_DEFAULTS)
    const options = { ...RULE_DEFAULTS, ...context.options[0] }

    // Skip non-project files
    if (filename.includes('node_modules')) return {}

    // Only apply to usecase files in the configured layer
    if (!isInDirectory(filename, options.directory)) return {}

    const layer = getLayerFromFilename(filename, settings.layers)
    if (layer !== options.layer) return {}

    const basename = getBaseName(filename)

    // Only check kebab-case.usecase.ts files (not fixtures or tests)
    const suffixPattern = new RegExp(
      `^([a-z][a-z0-9-]*)\\.${options.fileSuffix}\\.ts$`,
    )
    const usecaseMatch = basename.match(suffixPattern)
    if (!usecaseMatch) return {}

    const kebabName = usecaseMatch[1]
    const expectedUsecaseName = kebabToCamel(kebabName)
    const foundExports = []

    return {
      // Track named exports
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export const doSomething = ...
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              if (decl.id && decl.id.name) {
                foundExports.push(decl.id.name)
              }
            })
          }
          // export function doSomething() { ... }
          if (
            node.declaration.type === 'FunctionDeclaration' &&
            node.declaration.id
          ) {
            foundExports.push(node.declaration.id.name)
          }
        }
        // export { doSomething }
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.exported && spec.exported.name) {
              foundExports.push(spec.exported.name)
            }
          })
        }
      },

      'Program:exit'(node) {
        // Check if the expected usecase name was exported
        if (!foundExports.includes(expectedUsecaseName)) {
          context.report({
            node,
            messageId: 'missingExport',
            data: {
              filename: basename,
              expectedName: expectedUsecaseName,
              foundExports:
                foundExports.length > 0 ? foundExports.join(', ') : 'none',
            },
          })
        }
      },
    }
  },
}
