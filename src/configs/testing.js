/**
 * Testing rules — apply to test files only.
 * Use with a `files` override in your ESLint config:
 *
 *   { files: ['**\/*.test.ts', '**\/*.spec.ts'], ...testing }
 */
export default {
  rules: {
    'clean-arch/expect-separate-act-assert': 'error',
    'clean-arch/no-generic-result-variable': 'error',
    'clean-arch/no-new-in-test-body': 'error',
    'clean-arch/prefer-parameterized-test': 'error',
    'clean-arch/require-typed-each': 'error',
    'clean-arch/use-data-builders': 'error',
  },
}
