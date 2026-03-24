/**
 * @fileoverview Enforce comprehensive file naming conventions across the codebase
 * @author TiedSiren
 *
 * This rule enforces consistent file naming patterns for each layer of the application:
 * - core/: Domain logic with specific patterns for usecases, listeners, selectors, etc.
 * - infra/: Infrastructure implementations with implementation-type prefix
 * - ui/: React components (PascalCase) and utilities (kebab-case)
 * - app/: Expo Router routes with kebab-case
 *
 * Layer detection uses shared settings (context.settings['clean-arch'].layers).
 * The naming conventions themselves ARE the rule's opinion and are not configurable.
 */

import path from 'path'

import { getSettings } from '../lib/settings.js'
import { getLayerFromFilename } from '../lib/layer-utils.js'
import {
  isTestFile as isTestFileUtil,
  isFixtureFile as isFixtureFileUtil,
  isInDirectory,
} from '../lib/file-utils.js'
import {
  isKebabCase,
  isPascalCase,
  isCamelCase,
} from '../lib/naming-utils.js'

/**
 * Strip file extension to get the base name for pattern matching.
 * Unlike naming-utils' getBaseName (which extracts filename from path),
 * this strips .ts/.tsx/.js/.jsx/.cjs/.mjs extensions from a filename.
 * @param {string} filename - The filename (not full path)
 * @returns {string}
 */
function stripExtension(filename) {
  return filename.replace(/\.(ts|tsx|js|jsx|cjs|mjs)$/, '')
}

/** Default app layer paths (Expo Router convention). */
const DEFAULT_APP_PATHS = ['/app/']

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce comprehensive file naming conventions across the codebase',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      // Core layer messages
      coreUsecaseNaming:
        'Usecase files must be named "kebab-case.usecase.ts". Got: "{{filename}}"',
      coreUsecaseTestNaming:
        'Usecase test files must be named "kebab-case.usecase.spec.ts". Got: "{{filename}}"',
      coreListenerNaming:
        'Listener files must be named "on-kebab-case.listener.ts". Got: "{{filename}}"',
      coreListenerTestNaming:
        'Listener test files must be named "on-kebab-case.listener.test.ts". Got: "{{filename}}"',
      coreSelectorNaming:
        'Selector files must be named "selectCamelCase.ts" or "kebab-case.view-model.ts". Got: "{{filename}}"',
      coreSelectorTestNaming:
        'Selector test files must be named "selectCamelCase.test.ts" or "kebab-case.view-model.test.ts". Got: "{{filename}}"',
      coreSliceNaming:
        'Redux slice files must be named "kebab-case.slice.ts". Got: "{{filename}}"',
      coreFixtureNaming:
        'Fixture files must be named "kebab-case.fixture.ts". Got: "{{filename}}"',
      coreBuilderNaming:
        'Data builder files must be named "kebab-case.builder.ts". Got: "{{filename}}"',
      corePortNaming:
        'Port files must be named "kebab-case.ts" (e.g., "auth.gateway.ts", "date-provider.ts"). Got: "{{filename}}"',
      coreUtilsNaming:
        'Utils files must be named "kebab-case.utils.ts". Got: "{{filename}}"',
      coreEntityNaming:
        'Domain entity files must be named "kebab-case.ts" (e.g., "block-session.ts", "auth-user.ts"). Got: "{{filename}}"',
      coreTypeFileNaming:
        'Type files must use ".type.ts" suffix (not ".types.ts"). Got: "{{filename}}"',

      // Infra layer messages
      infraImplementationNaming:
        'Infrastructure files must be named "{implementation}.{port-name}.ts" (e.g., "prisma.block-session.repository.ts", "in-memory.logger.ts"). Got: "{{filename}}"',
      infraTestNaming:
        'Infrastructure test files must use ".test.ts" suffix (not ".spec.ts"). Got: "{{filename}}"',
      infraTestPattern:
        'Infrastructure test files must be named "{implementation}.{port-name}.test.ts". Got: "{{filename}}"',

      // Folder structure messages
      uiScreenFolderNaming:
        'UI screen folders must be PascalCase. File "{{filename}}" is in a non-PascalCase screen folder: "{{folder}}"',
      coreSpecialFolderNaming:
        'Core special folders must use underscore prefix (_ports_, _redux_, _tests_) or double underscore (__utils__, __constants__). Got: "{{folder}}"',
      infraFolderNaming:
        'Infra folders must be kebab-case matching the port name. Got: "{{folder}}"',

      // UI layer messages
      uiComponentNaming:
        'React component files (.tsx) must be named in PascalCase (e.g., "SessionCard.tsx"). Got: "{{filename}}"',
      uiHookNaming:
        'React hook files must be named "useCamelCase.ts" (e.g., "useAppForeground.ts"). Got: "{{filename}}"',
      uiViewModelNaming:
        'View model files must be named "kebab-case.view-model.ts". Got: "{{filename}}"',
      uiSchemaNaming:
        'Schema files must be named "kebab-case.schema.ts". Got: "{{filename}}"',
      uiHelperNaming:
        'Helper files must be named "kebab-case.helper.ts". Got: "{{filename}}"',
      uiUtilityNaming:
        'UI utility files must be named in kebab-case. Got: "{{filename}}"',

      // App layer messages
      appRouteNaming:
        'Route files must be named in kebab-case (e.g., "forgot-password.tsx") or be special files (_layout.tsx, index.tsx, +html.tsx). Got: "{{filename}}"',

      // Generic messages
      genericKebabCase:
        'File must be named in kebab-case (all lowercase with hyphens). Got: "{{filename}}"',
    },
    schema: [
      {
        type: 'object',
        properties: {
          appPaths: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Path patterns that identify the app/routing layer (default: ["/app/"])',
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
    const ruleOptions = context.options[0] || {}
    const appPaths = ruleOptions.appPaths || DEFAULT_APP_PATHS

    const relativePath = filename
    const basename = path.basename(filename)
    const baseName = stripExtension(basename)
    const extension = path.extname(filename)
    const testFile = isTestFileUtil(basename, settings)
    const fixtureFile = isFixtureFileUtil(basename, settings)
    const isTsx = extension === '.tsx'
    const isTs = extension === '.ts'

    // Detect layer from shared settings
    const layer = getLayerFromFilename(relativePath, settings.layers)

    // Detect app layer separately (not in standard layer config)
    const isAppLayer = appPaths.some((p) => relativePath.includes(p))

    return {
      Program(node) {
        // ==========================================
        // CORE LAYER RULES
        // ==========================================

        if (layer === 'core') {
          // core/*/usecases/ - Usecase files
          if (isInDirectory(relativePath, '/usecases/')) {
            if (testFile) {
              // Usecase tests: kebab-case.usecase.spec.ts
              if (!basename.match(/^[a-z][a-z0-9-]*\.usecase\.spec\.ts$/)) {
                // Allow fixture files in usecases folder
                if (!fixtureFile) {
                  context.report({
                    node,
                    messageId: 'coreUsecaseTestNaming',
                    data: { filename: basename },
                  })
                }
              }
            } else if (isTs && !fixtureFile) {
              // Usecase implementation: kebab-case.usecase.ts
              if (!basename.match(/^[a-z][a-z0-9-]*\.usecase\.ts$/)) {
                context.report({
                  node,
                  messageId: 'coreUsecaseNaming',
                  data: { filename: basename },
                })
              }
            }
          }

          // core/*/listeners/ - Listener files
          if (isInDirectory(relativePath, '/listeners/')) {
            if (testFile) {
              // Listener tests: on-*.listener.test.ts
              if (
                !basename.match(/^on-[a-z][a-z0-9-]*\.listener\.test\.ts$/)
              ) {
                // Allow fixture files in listeners folder
                if (!fixtureFile) {
                  context.report({
                    node,
                    messageId: 'coreListenerTestNaming',
                    data: { filename: basename },
                  })
                }
              }
            } else if (isTs && !fixtureFile) {
              // Listener implementation: on-*.listener.ts
              if (!basename.match(/^on-[a-z][a-z0-9-]*\.listener\.ts$/)) {
                context.report({
                  node,
                  messageId: 'coreListenerNaming',
                  data: { filename: basename },
                })
              }
            }
          }

          // core/*/selectors/ - Selector files
          if (isInDirectory(relativePath, '/selectors/')) {
            if (testFile) {
              // Selector tests: selectCamelCase.test.ts OR kebab-case.view-model.test.ts
              const isValidSelectorTest = basename.match(
                /^select[A-Z][a-zA-Z0-9]*\.test\.ts$/,
              )
              const isValidViewModelTest = basename.match(
                /^[a-z][a-z0-9-]*\.view-model\.test\.ts$/,
              )
              if (!isValidSelectorTest && !isValidViewModelTest) {
                context.report({
                  node,
                  messageId: 'coreSelectorTestNaming',
                  data: { filename: basename },
                })
              }
            } else if (isTs) {
              // Selector implementation: selectCamelCase.ts OR kebab-case.view-model.ts
              const isValidSelector = basename.match(
                /^select[A-Z][a-zA-Z0-9]*\.ts$/,
              )
              const isValidViewModel = basename.match(
                /^[a-z][a-z0-9-]*\.view-model\.ts$/,
              )
              const isValidViewModelType = basename.match(
                /^[a-z][a-z0-9-]*-view-model\.type\.ts$/,
              )
              const isValidIsActive = basename === 'isActive.ts' // Exception for legacy file
              if (
                !isValidSelector &&
                !isValidViewModel &&
                !isValidViewModelType &&
                !isValidIsActive
              ) {
                context.report({
                  node,
                  messageId: 'coreSelectorNaming',
                  data: { filename: basename },
                })
              }
            }
          }

          // core/*/ - Slice files (at domain root)
          if (
            !isInDirectory(relativePath, '/usecases/') &&
            !isInDirectory(relativePath, '/listeners/') &&
            !isInDirectory(relativePath, '/selectors/') &&
            !isInDirectory(relativePath, '/_tests_/') &&
            !isInDirectory(relativePath, '/_ports_/') &&
            !isInDirectory(relativePath, '/_redux_/') &&
            !isInDirectory(relativePath, '/__utils__/') &&
            !isInDirectory(relativePath, '/__constants__/') &&
            basename.includes('.slice.')
          ) {
            if (!basename.match(/^[a-z][a-z0-9-]*\.slice\.ts$/)) {
              context.report({
                node,
                messageId: 'coreSliceNaming',
                data: { filename: basename },
              })
            }
          }

          // Fixture files anywhere in core
          if (fixtureFile) {
            if (!basename.match(/^[a-z][a-z0-9-]*\.fixture\.ts$/)) {
              context.report({
                node,
                messageId: 'coreFixtureNaming',
                data: { filename: basename },
              })
            }
          }

          // core/_ports_/ - Port interface files
          if (isInDirectory(relativePath, settings.portsDirectory)) {
            // Ports should be kebab-case.ts (e.g., auth.gateway.ts, date-provider.ts)
            if (
              !basename.match(
                /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*|-[a-z][a-z0-9]*)*\.ts$/,
              )
            ) {
              context.report({
                node,
                messageId: 'corePortNaming',
                data: { filename: basename },
              })
            }
          }

          // core/__utils__/ - Utility files
          if (isInDirectory(relativePath, '/__utils__/')) {
            if (testFile) {
              if (!basename.match(/^[a-z][a-z0-9-]*\.utils\.test\.ts$/)) {
                context.report({
                  node,
                  messageId: 'coreUtilsNaming',
                  data: { filename: basename },
                })
              }
            } else if (isTs) {
              if (!basename.match(/^[a-z][a-z0-9-]*\.utils\.ts$/)) {
                context.report({
                  node,
                  messageId: 'coreUtilsNaming',
                  data: { filename: basename },
                })
              }
            }
          }

          // Type files: enforce .type.ts (not .types.ts)
          if (basename.includes('.types.')) {
            context.report({
              node,
              messageId: 'coreTypeFileNaming',
              data: { filename: basename },
            })
          }

          // Domain entity files at root of each domain in core
          // These are files like block-session.ts, blocklist.ts, auth-user.ts
          // They must be kebab-case.ts (not camelCase or PascalCase, not dot-separated)
          if (
            !isInDirectory(relativePath, '/usecases/') &&
            !isInDirectory(relativePath, '/listeners/') &&
            !isInDirectory(relativePath, '/selectors/') &&
            !isInDirectory(relativePath, '/_tests_/') &&
            !isInDirectory(relativePath, '/_ports_/') &&
            !isInDirectory(relativePath, '/_redux_/') &&
            !isInDirectory(relativePath, '/__utils__/') &&
            !isInDirectory(relativePath, '/__constants__/') &&
            isTs &&
            !testFile &&
            !basename.includes('.slice.') &&
            !fixtureFile &&
            !basename.includes('.type.')
          ) {
            // Domain entity files should be kebab-case.ts
            if (!isKebabCase(baseName)) {
              context.report({
                node,
                messageId: 'coreEntityNaming',
                data: { filename: basename },
              })
            }
          }
        }

        // core/_tests_/data-builders/ - Builder files
        // (checked outside layer === 'core' because data-builders may appear in tests/)
        if (isInDirectory(relativePath, '/data-builders/')) {
          if (!basename.match(/^[a-z][a-z0-9-]*\.builder\.ts$/)) {
            context.report({
              node,
              messageId: 'coreBuilderNaming',
              data: { filename: basename },
            })
          }
        }

        // ==========================================
        // INFRA LAYER RULES
        // ==========================================

        // Infra files follow the pattern: {implementation-name}.{port-name}.ts
        // - implementation-name: kebab-case describing HOW it's implemented (e.g., prisma, fake-data, in-memory, real, expo)
        // - port-name: kebab-case matching the port interface file (e.g., block-session.repository, auth.gateway, logger)
        // Examples:
        //   prisma.block-session.repository.ts implements block-session.repository.ts
        //   in-memory.logger.ts implements logger.ts
        //   real.date-provider.ts implements date-provider.ts

        if (
          layer === 'infra' &&
          !isInDirectory(relativePath, '/__abstract__/')
        ) {
          // Pattern: kebab-case.kebab-case[.kebab-case...].ts
          // At minimum: {impl}.{port}.ts (two dot-separated parts before .ts)
          const infraImplPattern =
            /^[a-z][a-z0-9]*(-[a-z0-9]+)*(\.[a-z][a-z0-9]*(-[a-z0-9]+)*)+\.ts$/
          // Infra tests MUST use .test.ts (not .spec.ts) - .spec.ts is reserved for usecases
          const infraTestPattern =
            /^[a-z][a-z0-9]*(-[a-z0-9]+)*(\.[a-z][a-z0-9]*(-[a-z0-9]+)*)+\.test\.ts$/

          if (testFile) {
            // Check if using .spec.ts (wrong for infra)
            if (basename.includes('.spec.ts')) {
              context.report({
                node,
                messageId: 'infraTestNaming',
                data: { filename: basename },
              })
            }
            // Check pattern: {impl}.{port}.test.ts
            else if (!infraTestPattern.test(basename)) {
              context.report({
                node,
                messageId: 'infraTestPattern',
                data: { filename: basename },
              })
            }
          } else if (isTs) {
            // Infrastructure implementation: {impl}.{port}.ts
            // Also allow config files like firebaseConfig.ts
            const isConfigFile = basename.match(/^[a-z][a-zA-Z]*Config\.ts$/)
            if (!infraImplPattern.test(basename) && !isConfigFile) {
              context.report({
                node,
                messageId: 'infraImplementationNaming',
                data: { filename: basename },
              })
            }
          }
        }

        // ==========================================
        // UI LAYER RULES
        // ==========================================

        if (layer === 'ui') {
          // Skip fixture files - they follow kebab-case.fixture.ts pattern
          if (fixtureFile) {
            if (!basename.match(/^[a-z][a-z0-9-]*\.fixture\.ts$/)) {
              context.report({
                node,
                messageId: 'coreFixtureNaming',
                data: { filename: basename },
              })
            }
            return
          }

          // Hooks: useCamelCase.ts
          if (isInDirectory(relativePath, '/hooks/')) {
            if (!basename.match(/^use[A-Z][a-zA-Z0-9]*\.(ts|tsx)$/)) {
              context.report({
                node,
                messageId: 'uiHookNaming',
                data: { filename: basename },
              })
            }
          }
          // View models: kebab-case.view-model.ts
          else if (basename.includes('.view-model.')) {
            if (testFile) {
              if (
                !basename.match(/^[a-z][a-z0-9-]*\.view-model\.test\.ts$/)
              ) {
                context.report({
                  node,
                  messageId: 'uiViewModelNaming',
                  data: { filename: basename },
                })
              }
            } else if (
              !basename.match(/^[a-z][a-z0-9-]*\.view-model\.ts$/)
            ) {
              context.report({
                node,
                messageId: 'uiViewModelNaming',
                data: { filename: basename },
              })
            }
          }
          // Schemas: kebab-case.schema.ts
          else if (basename.includes('.schema.')) {
            if (testFile) {
              if (!basename.match(/^[a-z][a-z0-9-]*\.schema\.test\.ts$/)) {
                context.report({
                  node,
                  messageId: 'uiSchemaNaming',
                  data: { filename: basename },
                })
              }
            } else if (!basename.match(/^[a-z][a-z0-9-]*\.schema\.ts$/)) {
              context.report({
                node,
                messageId: 'uiSchemaNaming',
                data: { filename: basename },
              })
            }
          }
          // Helpers: kebab-case.helper.ts
          else if (basename.includes('.helper.')) {
            if (testFile) {
              if (!basename.match(/^[a-z][a-z0-9-]*\.helper\.test\.ts$/)) {
                context.report({
                  node,
                  messageId: 'uiHelperNaming',
                  data: { filename: basename },
                })
              }
            } else if (!basename.match(/^[a-z][a-z0-9-]*\.helper\.ts$/)) {
              context.report({
                node,
                messageId: 'uiHelperNaming',
                data: { filename: basename },
              })
            }
          }
          // React components (.tsx files in ui/ that are not in special folders)
          else if (
            isTsx &&
            !isInDirectory(relativePath, '/hooks/') &&
            !isInDirectory(relativePath, '/schemas/') &&
            !isInDirectory(relativePath, '/utils/')
          ) {
            // Components should be PascalCase
            if (!baseName.match(/^[A-Z][a-zA-Z0-9]*$/)) {
              context.report({
                node,
                messageId: 'uiComponentNaming',
                data: { filename: basename },
              })
            }
          }
          // Utils folder: allow camelCase or kebab-case for both .ts and .tsx (utility functions)
          else if (isInDirectory(relativePath, '/utils/')) {
            // Allow camelCase (e.g., handleUIError.tsx, timeFormat.ts) or kebab-case
            if (!isCamelCase(baseName) && !isKebabCase(baseName)) {
              context.report({
                node,
                messageId: 'uiUtilityNaming',
                data: { filename: basename },
              })
            }
          }
          // Other non-component .ts files can be:
          // - PascalCase for type/enum files (e.g., SessionType.ts, TabScreens.ts)
          // - camelCase for function/utility files (e.g., assertIsBlockSession.ts, preloadedStateForManualTesting.ts)
          // - kebab-case for utilities (e.g., auth-schemas.ts, validation-helper.ts)
          else if (
            isTs &&
            !basename.includes('.type.') &&
            !basename.includes('.types.') &&
            !basename.includes('.view-model.') &&
            !basename.includes('.schema.') &&
            !testFile
          ) {
            // Allow PascalCase, camelCase, or kebab-case
            const isValidPascalCase = isPascalCase(baseName)
            const isValidCamelCase = isCamelCase(baseName)
            const isValidKebabCase = isKebabCase(baseName)
            if (!isValidPascalCase && !isValidCamelCase && !isValidKebabCase) {
              context.report({
                node,
                messageId: 'uiUtilityNaming',
                data: { filename: basename },
              })
            }
          }
        }

        // ==========================================
        // APP LAYER RULES (Expo Router)
        // ==========================================

        if (
          isAppLayer &&
          !relativePath.includes('/node_modules/')
        ) {
          // Special Expo Router files
          const specialFiles = [
            '_layout.tsx',
            'index.tsx',
            '+html.tsx',
            '+not-found.tsx',
          ]
          const isSpecialFile = specialFiles.includes(basename)

          // Dynamic routes: [param].tsx or [...param].tsx
          const isDynamicRoute = basename.match(/^\[.*\]\.tsx$/)

          if (isTsx && !isSpecialFile && !isDynamicRoute) {
            // Regular routes should be kebab-case
            if (!baseName.match(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/)) {
              context.report({
                node,
                messageId: 'appRouteNaming',
                data: { filename: basename },
              })
            }
          }
        }

        // ==========================================
        // FOLDER STRUCTURE RULES
        // ==========================================

        // UI screen folders must be PascalCase
        if (layer === 'ui' && isInDirectory(relativePath, '/screens/')) {
          // Extract the screen folder name (first folder after /screens/)
          const screenMatch = relativePath.match(/\/screens\/([^/]+)/)
          if (screenMatch) {
            const screenFolder = screenMatch[1]
            // Screen folders should be PascalCase (e.g., Home, Blocklists, StrictMode)
            if (!isPascalCase(screenFolder)) {
              context.report({
                node,
                messageId: 'uiScreenFolderNaming',
                data: { filename: basename, folder: screenFolder },
              })
            }
          }
        }

        // Infra folders must be kebab-case
        if (layer === 'infra') {
          // Extract the infra subfolder name
          const infraMatch = relativePath.match(/\/infra\/([^/]+)/)
          if (infraMatch) {
            const infraFolder = infraMatch[1]
            // Skip special folders
            if (!infraFolder.startsWith('__')) {
              // Infra folders should be kebab-case (e.g., block-session-repository, auth-gateway)
              if (!isKebabCase(infraFolder)) {
                context.report({
                  node,
                  messageId: 'infraFolderNaming',
                  data: { folder: infraFolder },
                })
              }
            }
          }
        }

        // Core domain folders must be kebab-case (except special folders)
        if (layer === 'core') {
          // Extract the domain folder name
          const coreMatch = relativePath.match(/\/core\/([^/]+)/)
          if (coreMatch) {
            const coreFolder = coreMatch[1]
            // Special folders use underscore prefix
            const isSpecialFolder =
              coreFolder.startsWith('_') || coreFolder.startsWith('__')
            if (!isSpecialFolder) {
              // Domain folders should be kebab-case (e.g., block-session, auth, strict-mode)
              if (!isKebabCase(coreFolder)) {
                context.report({
                  node,
                  messageId: 'coreSpecialFolderNaming',
                  data: { folder: coreFolder },
                })
              }
            }
          }
        }
      },
    }
  },
}
