/**
 * Shared settings management for eslint-plugin-clean-arch.
 *
 * Rules read from context.settings['clean-arch'] with fallback to defaults.
 * Users configure once in ESLint settings, all rules pick it up.
 */

export const DEFAULT_SETTINGS = {
  layers: {
    core: { path: '/core/', aliases: ['@core/', '@core'] },
    infra: { path: '/infra/', aliases: ['@infra/', '@infra'] },
    ui: { path: '/ui/', aliases: ['@ui/', '@ui'] },
  },
  forbiddenImports: {
    core: ['infra', 'ui'],
    infra: ['ui'],
    ui: [],
  },
  testFilePatterns: ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'],
  fixtureFilePatterns: ['.fixture.ts', '.fixture.tsx'],
  builderFilePatterns: ['.builder.ts', '.builder.tsx'],
  fakeFilePatterns: ['in-memory.', 'fake.', 'fake-', 'fake-data.', 'stub.'],
  testDirectories: ['/_tests_/'],
  portsDirectory: '/_ports_/',
}

/**
 * Merge user settings from context.settings['clean-arch'] with defaults.
 * Rule-level options (context.options[0]) take highest precedence.
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @param {Record<string, any>} [ruleDefaults] - Rule-specific default overrides
 * @returns {typeof DEFAULT_SETTINGS & Record<string, any>}
 */
export function getSettings(context, ruleDefaults = {}) {
  const userSettings =
    (context.settings && context.settings['clean-arch']) || {}
  const ruleOptions = context.options[0] || {}

  return {
    ...DEFAULT_SETTINGS,
    ...ruleDefaults,
    ...userSettings,
    ...ruleOptions,
    layers: {
      ...DEFAULT_SETTINGS.layers,
      ...(ruleDefaults.layers || {}),
      ...(userSettings.layers || {}),
      ...(ruleOptions.layers || {}),
    },
    forbiddenImports: {
      ...DEFAULT_SETTINGS.forbiddenImports,
      ...(ruleDefaults.forbiddenImports || {}),
      ...(userSettings.forbiddenImports || {}),
      ...(ruleOptions.forbiddenImports || {}),
    },
  }
}
