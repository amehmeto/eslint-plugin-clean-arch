/**
 * Architecture rules — enforce hexagonal/clean architecture boundaries.
 *
 * Includes settings with default layer configuration (core/infra/ui).
 * Override via your ESLint config's `settings['clean-arch']`.
 */
import { DEFAULT_SETTINGS } from '../lib/settings.js'

export default {
  settings: {
    'clean-arch': DEFAULT_SETTINGS,
  },
  rules: {
    'clean-arch/builder-matches-filename': 'error',
    'clean-arch/core-no-restricted-globals': 'error',
    'clean-arch/core-no-restricted-imports': 'error',
    'clean-arch/core-no-restricted-properties': 'error',
    'clean-arch/core-test-file-naming': 'error',
    'clean-arch/core-test-no-restricted-properties': 'error',
    'clean-arch/file-naming-convention': 'error',
    'clean-arch/fixture-matches-filename': 'error',
    'clean-arch/gateway-implementation-naming': 'error',
    'clean-arch/infra-logger-prefix': 'error',
    'clean-arch/infra-must-rethrow': 'error',
    'clean-arch/infra-public-method-try-catch': 'error',
    'clean-arch/listener-error-handling': 'error',
    'clean-arch/listener-matches-filename': 'error',
    'clean-arch/no-adapter-in-ui': 'error',
    'clean-arch/no-cross-layer-imports': 'error',
    'clean-arch/no-data-builders-in-production': 'error',
    'clean-arch/no-index-in-core': 'error',
    'clean-arch/no-try-catch-in-core': 'error',
    'clean-arch/one-listener-per-file': 'error',
    'clean-arch/one-selector-per-file': 'error',
    'clean-arch/one-usecase-per-file': 'error',
    'clean-arch/one-view-model-per-file': 'error',
    'clean-arch/reducer-in-domain-folder': 'error',
    'clean-arch/repository-implementation-naming': 'error',
    'clean-arch/require-colocated-test': 'error',
    'clean-arch/require-logger-in-catch': 'error',
    'clean-arch/schema-matches-filename': 'error',
    'clean-arch/selector-matches-filename': 'error',
    'clean-arch/selector-state-first-param': 'error',
    'clean-arch/slice-matches-folder': 'error',
    'clean-arch/usecase-matches-filename': 'error',
    'clean-arch/view-model-matches-filename': 'error',
  },
}
