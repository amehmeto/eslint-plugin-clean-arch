# eslint-plugin-clean-arch

ESLint plugin enforcing clean/hexagonal architecture boundaries, code quality, and naming conventions.

90 rules across 4 categories, shipped as ready-to-use flat configs.

## Installation

```bash
npm install eslint-plugin-clean-arch --save-dev
```

## Quick Start

```js
// eslint.config.js
import cleanArch from 'eslint-plugin-clean-arch'

export default [
  cleanArch.configs.all,       // everything
]
```

Or pick only what you need:

```js
export default [
  cleanArch.configs.recommended,  // code-quality + react + testing
  cleanArch.configs.hexagonal,    // architecture rules only
]
```

## Configs

| Config | Description |
|---|---|
| `all` | Every rule enabled |
| `recommended` | `code-quality` + `react` + `testing` |
| `hexagonal` | Architecture boundary enforcement |
| `code-quality` | Pure style and correctness rules |
| `react` | React, JSX, and Redux rules |
| `testing` | Test file rules (AAA pattern, data builders, etc.) |
| `architecture` | Same as `hexagonal` — layer boundaries, naming, file structure |

## Settings

Architecture rules share a single settings block. Defaults work out of the box for a typical `core/infra/ui` layout:

```js
// eslint.config.js
export default [
  {
    settings: {
      'clean-arch': {
        layers: {
          core: { path: '/core/', aliases: ['@core/', '@core'] },
          infra: { path: '/infra/', aliases: ['@infra/', '@infra'] },
          ui:   { path: '/ui/',   aliases: ['@ui/', '@ui'] },
        },
        forbiddenImports: {
          core: ['infra', 'ui'],  // core cannot import infra or ui
          infra: ['ui'],          // infra cannot import ui
          ui: [],
        },
        testFilePatterns: ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'],
        builderFilePatterns: ['.builder.ts', '.builder.tsx'],
        fixtureFilePatterns: ['.fixture.ts', '.fixture.tsx'],
        fakeFilePatterns: ['in-memory.', 'fake.', 'fake-', 'fake-data.', 'stub.'],
        testDirectories: ['/_tests_/'],
        portsDirectory: '/_ports_/',
      },
    },
  },
]
```

## Rules

### Architecture (27 rules)

| Rule | Description |
|---|---|
| `builder-matches-filename` | Ensure builder files export a function matching their filename |
| `core-no-restricted-globals` | Ban non-deterministic globals in core production code |
| `core-no-restricted-imports` | Ban non-deterministic imports in core production code |
| `core-no-restricted-properties` | Ban non-deterministic property access in core production code |
| `core-test-file-naming` | Enforce test files in selectors/usecases/listeners directories to follow naming conventions |
| `core-test-no-restricted-properties` | Ban vi/jest mocking in core tests — use dependency injection |
| `file-naming-convention` | Enforce comprehensive file naming conventions across the codebase |
| `fixture-matches-filename` | Ensure fixture files export a function matching their filename |
| `gateway-implementation-naming` | Ensure gateway implementations follow naming convention |
| `infra-logger-prefix` | Enforce that all logger calls use `[ClassName]` prefix |
| `infra-must-rethrow` | Enforce that catch blocks in infra layer rethrow errors after logging |
| `infra-public-method-try-catch` | Enforce that public async methods in infra adapters have try-catch wrappers |
| `listener-error-handling` | Enforce that listener files have proper error handling via try-catch or safe functions |
| `listener-matches-filename` | Ensure listener files export a function matching their filename |
| `no-adapter-in-ui` | Prevent direct usage of Redux entity adapters in UI layer files |
| `no-cross-layer-imports` | Enforce hexagonal architecture layer boundaries |
| `no-data-builders-in-production` | Prevent data builders from being used in production code |
| `no-index-in-core` | Disallow index.ts barrel files in core/ directory |
| `no-try-catch-in-core` | Forbid try-catch blocks in core business logic |
| `one-listener-per-file` | Enforce one listener export per file |
| `one-selector-per-file` | Enforce one selector per file |
| `one-usecase-per-file` | Enforce one use case per file |
| `one-view-model-per-file` | Enforce one view-model export per file |
| `reducer-in-domain-folder` | Ensure reducer.ts files are in domain folders within core/ |
| `repository-implementation-naming` | Ensure repository implementations follow naming convention |
| `require-colocated-test` | Require colocated test files for core modules |
| `require-logger-in-catch` | Require a logger call inside catch blocks in infra layer |
| `schema-matches-filename` | Ensure schema files export a schema matching their filename |
| `selector-matches-filename` | Ensure selector files export a function matching their filename |
| `selector-state-first-param` | Enforce state as the first parameter in selector functions |
| `slice-matches-folder` | Ensure slice files export a slice matching their folder name |
| `usecase-matches-filename` | Ensure usecase files export a thunk matching their filename |
| `view-model-matches-filename` | Ensure view-model files export a selector matching their filename |

### Code Quality (30 rules)

| Rule | Description |
|---|---|
| `curly-multi-or-nest` | Enforce curly braces with multi-or-nest style |
| `inline-single-statement-handlers` | Enforce inlining single-statement event handlers |
| `lines-between-class-members` | Require blank lines between class members |
| `max-statements-per-line` | Enforce a maximum number of statements per line |
| `naming-convention-boolean-prefix` | Enforce boolean naming convention and no I-prefix on interfaces |
| `no-and-or-in-names` | Disallow "And" or "Or" as word boundaries in declaration names |
| `no-complex-inline-arguments` | Require extracting complex expressions with long strings to variables |
| `no-consecutive-duplicate-returns` | Merge consecutive if-return statements with identical return values |
| `no-date-now` | Disallow direct usage of `Date.now()` |
| `no-else-if` | Disallow else-if statements |
| `no-enum-value-as-string-literal` | Disallow string literals in comparisons when an enum with that value exists |
| `no-i-prefix-in-imports` | Forbid I-prefix in import aliases |
| `no-inline-import-type` | Disallow inline import types |
| `no-inline-object-type` | Require extracting inline object type literals into named type aliases |
| `no-lame-naming` | Disallow overly generic variable and function names |
| `no-module-level-constants` | Forbid module-level constants between imports and exports |
| `no-nested-call-expressions` | Disallow nested function calls as arguments |
| `no-nested-this-calls` | Disallow nested `this.method()` calls as arguments |
| `no-redundant-nullish-ternary` | Disallow redundant nullish ternaries that guard function calls |
| `no-switch` | Disallow switch statements — use object maps or if/else chains |
| `no-ternary-false-fallback` | Disallow ternary expressions with `false` as the fallback value |
| `object-shorthand` | Require shorthand syntax for object properties and methods |
| `padding-line-between-block-like` | Require blank line between block-like statements |
| `prefer-array-destructuring` | Prefer array destructuring over index access |
| `prefer-enum-over-string-union` | Prefer enum over union of string literals |
| `prefer-inline-variable` | Prefer inlining variables that are only used once immediately after declaration |
| `prefer-jump-table` | Prefer object map (jump table) over sequential if statements |
| `prefer-object-destructuring` | Enforce destructuring when accessing multiple properties of the same object |
| `prefer-ternary-return` | Prefer ternary expressions over if-return followed by return |
| `require-named-regex` | Require regex patterns to be extracted into named constants |
| `time-constant-multiplication` | Enforce time constants to have explicit numeric multiplier |
| `try-catch-isolation` | Enforce try-catch isolation: try first, nothing after catch, no multiple try-catch |

### React / JSX / Redux (18 rules)

| Rule | Description |
|---|---|
| `no-call-expression-in-jsx-props` | Require extracting call expressions with arguments from JSX props |
| `no-complex-jsx-in-conditionals` | Enforce extracting complex JSX from conditional returns into components |
| `no-entire-state-selector` | Disallow selecting entire Redux state in `useSelector` |
| `no-icon-size-magic-numbers` | Disallow magic numbers for size prop in icon components |
| `no-redundant-prop-spreading` | Disallow passing 3+ props from the same object — pass the object directly |
| `no-selector-prop-drilling` | Disallow passing `useSelector` results as props — child should call `useSelector` itself |
| `no-stylesheet-magic-numbers` | Disallow magic numbers in StyleSheet properties |
| `no-thunk-result-in-component` | Disallow `.fulfilled.match()` / `.rejected.match()` in React components |
| `no-unused-test-id` | Disallow hardcoded testID string literals — pass testID from props or remove it |
| `no-unwrap` | Disallow `.unwrap()` — rely on Redux state for thunk success/error handling |
| `no-usecallback-selector-wrapper` | Disallow wrapping selectors with `useCallback` when used with `useSelector` |
| `one-component-per-file` | Enforce one React component per file |
| `prefer-extracted-component` | Suggest extracting large JSX elements into reusable components |
| `prefer-extracted-long-params` | Require extracting long function arguments into named variables |
| `prefer-named-selector` | Prefer named selectors over inline state slice access in `useSelector` |
| `prefer-short-circuit-jsx` | Prefer short-circuit (`&&`) over ternary with null for conditional JSX |
| `prefer-ternary-jsx` | Prefer ternary expression over complementary `&&` conditions in JSX |
| `react-props-destructuring` | Enforce destructured props with extracted type in React components |
| `require-feature-flag-destructuring` | Enforce destructuring when using `selectFeatureFlags` selector |

### Testing (6 rules)

| Rule | Description |
|---|---|
| `expect-separate-act-assert` | Enforce separation between Act and Assert phases (AAA pattern) |
| `no-generic-result-variable` | Disallow generic variable names — use descriptive names derived from the domain |
| `no-new-in-test-body` | Forbid class instantiation inside `it`/`test` blocks — use `beforeEach` |
| `prefer-parameterized-test` | Suggest using `test.each` when multiple tests share identical structure |
| `require-typed-each` | Require type parameter on `it.each` / `test.each` / `describe.each` |
| `use-data-builders` | Enforce using data builders instead of object literals for domain entities |

## License

MIT
