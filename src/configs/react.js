/**
 * React, JSX, and Redux rules.
 */
export default {
  rules: {
    'clean-arch/no-call-expression-in-jsx-props': 'error',
    'clean-arch/no-complex-jsx-in-conditionals': [
      'error',
      { maxProps: 2, allowSimpleElements: true },
    ],
    'clean-arch/no-entire-state-selector': 'error',
    'clean-arch/no-icon-size-magic-numbers': 'error',
    'clean-arch/no-redundant-prop-spreading': 'error',
    'clean-arch/no-selector-prop-drilling': 'error',
    'clean-arch/no-stylesheet-magic-numbers': 'error',
    'clean-arch/no-thunk-result-in-component': 'error',
    'clean-arch/no-unused-test-id': 'error',
    'clean-arch/no-unwrap': 'error',
    'clean-arch/no-usecallback-selector-wrapper': 'error',
    'clean-arch/one-component-per-file': 'error',
    'clean-arch/prefer-extracted-component': 'warn',
    'clean-arch/prefer-extracted-long-params': 'error',
    'clean-arch/prefer-named-selector': 'error',
    'clean-arch/prefer-short-circuit-jsx': 'error',
    'clean-arch/prefer-ternary-jsx': 'error',
    'clean-arch/react-props-destructuring': 'error',
    'clean-arch/require-feature-flag-destructuring': 'error',
  },
}
