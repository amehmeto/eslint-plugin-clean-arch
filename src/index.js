import rules from './rules/index.js'
import codeQuality from './configs/code-quality.js'
import react from './configs/react.js'
import testing from './configs/testing.js'
import architecture from './configs/architecture.js'

const plugin = {
  meta: {
    name: 'eslint-plugin-clean-arch',
    version: '0.1.0',
  },
  rules,
  configs: {},
}

// Configs need a reference to the plugin itself (ESLint flat config pattern)
function makeConfig(config) {
  return { ...config, plugins: { 'clean-arch': plugin } }
}

plugin.configs = {
  'code-quality': makeConfig(codeQuality),
  react: makeConfig(react),
  testing: makeConfig(testing),
  architecture: makeConfig(architecture),
  recommended: makeConfig({
    rules: {
      ...codeQuality.rules,
      ...react.rules,
      ...testing.rules,
    },
  }),
  hexagonal: makeConfig({
    settings: architecture.settings,
    rules: {
      ...architecture.rules,
    },
  }),
  all: makeConfig({
    settings: architecture.settings,
    rules: {
      ...codeQuality.rules,
      ...react.rules,
      ...testing.rules,
      ...architecture.rules,
    },
  }),
}

export default plugin
