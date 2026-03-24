import builderMatchesFilename from './builder-matches-filename.js'
import coreNoRestrictedGlobals from './core-no-restricted-globals.js'
import coreNoRestrictedImports from './core-no-restricted-imports.js'
import coreNoRestrictedProperties from './core-no-restricted-properties.js'
import coreTestFileNaming from './core-test-file-naming.js'
import coreTestNoRestrictedProperties from './core-test-no-restricted-properties.js'
import curlyMultiOrNest from './curly-multi-or-nest.js'
import expectSeparateActAssert from './expect-separate-act-assert.js'
import fileNamingConvention from './file-naming-convention.js'
import fixtureMatchesFilename from './fixture-matches-filename.js'
import gatewayImplementationNaming from './gateway-implementation-naming.js'
import infraLoggerPrefix from './infra-logger-prefix.js'
import infraMustRethrow from './infra-must-rethrow.js'
import infraPublicMethodTryCatch from './infra-public-method-try-catch.js'
import inlineSingleStatementHandlers from './inline-single-statement-handlers.js'
import linesBetweenClassMembers from './lines-between-class-members.js'
import listenerErrorHandling from './listener-error-handling.js'
import listenerMatchesFilename from './listener-matches-filename.js'
import maxStatementsPerLine from './max-statements-per-line.js'
import namingConventionBooleanPrefix from './naming-convention-boolean-prefix.js'
import noAdapterInUi from './no-adapter-in-ui.js'
import noAndOrInNames from './no-and-or-in-names.js'
import noCallExpressionInJsxProps from './no-call-expression-in-jsx-props.js'
import noComplexInlineArguments from './no-complex-inline-arguments.js'
import noComplexJsxInConditionals from './no-complex-jsx-in-conditionals.js'
import noConsecutiveDuplicateReturns from './no-consecutive-duplicate-returns.js'
import noCrossLayerImports from './no-cross-layer-imports.js'
import noDataBuildersInProduction from './no-data-builders-in-production.js'
import noDateNow from './no-date-now.js'
import noElseIf from './no-else-if.js'
import noEntireStateSelector from './no-entire-state-selector.js'
import noEnumValueAsStringLiteral from './no-enum-value-as-string-literal.js'
import noGenericResultVariable from './no-generic-result-variable.js'
import noIPrefixInImports from './no-i-prefix-in-imports.js'
import noIconSizeMagicNumbers from './no-icon-size-magic-numbers.js'
import noIndexInCore from './no-index-in-core.js'
import noInlineImportType from './no-inline-import-type.js'
import noInlineObjectType from './no-inline-object-type.js'
import noLameNaming from './no-lame-naming.js'
import noModuleLevelConstants from './no-module-level-constants.js'
import noNestedCallExpressions from './no-nested-call-expressions.js'
import noNestedThisCalls from './no-nested-this-calls.js'
import noNewInTestBody from './no-new-in-test-body.js'
import noRedundantNullishTernary from './no-redundant-nullish-ternary.js'
import noRedundantPropSpreading from './no-redundant-prop-spreading.js'
import noSelectorPropDrilling from './no-selector-prop-drilling.js'
import noStylesheetMagicNumbers from './no-stylesheet-magic-numbers.js'
import noSwitch from './no-switch.js'
import noTernaryFalseFallback from './no-ternary-false-fallback.js'
import noThunkResultInComponent from './no-thunk-result-in-component.js'
import noTryCatchInCore from './no-try-catch-in-core.js'
import noUnusedTestId from './no-unused-test-id.js'
import noUnwrap from './no-unwrap.js'
import noUsecallbackSelectorWrapper from './no-usecallback-selector-wrapper.js'
import objectShorthand from './object-shorthand.js'
import oneComponentPerFile from './one-component-per-file.js'
import oneListenerPerFile from './one-listener-per-file.js'
import oneSelectorPerFile from './one-selector-per-file.js'
import oneUsecasePerFile from './one-usecase-per-file.js'
import oneViewModelPerFile from './one-view-model-per-file.js'
import paddingLineBetweenBlockLike from './padding-line-between-block-like.js'
import preferArrayDestructuring from './prefer-array-destructuring.js'
import preferEnumOverStringUnion from './prefer-enum-over-string-union.js'
import preferExtractedComponent from './prefer-extracted-component.js'
import preferExtractedLongParams from './prefer-extracted-long-params.js'
import preferInlineVariable from './prefer-inline-variable.js'
import preferJumpTable from './prefer-jump-table.js'
import preferNamedSelector from './prefer-named-selector.js'
import preferObjectDestructuring from './prefer-object-destructuring.js'
import preferParameterizedTest from './prefer-parameterized-test.js'
import preferShortCircuitJsx from './prefer-short-circuit-jsx.js'
import preferTernaryJsx from './prefer-ternary-jsx.js'
import preferTernaryReturn from './prefer-ternary-return.js'
import reactPropsDestructuring from './react-props-destructuring.js'
import reducerInDomainFolder from './reducer-in-domain-folder.js'
import repositoryImplementationNaming from './repository-implementation-naming.js'
import requireColocatedTest from './require-colocated-test.js'
import requireFeatureFlagDestructuring from './require-feature-flag-destructuring.js'
import requireLoggerInCatch from './require-logger-in-catch.js'
import requireNamedRegex from './require-named-regex.js'
import requireTypedEach from './require-typed-each.js'
import schemaMatchesFilename from './schema-matches-filename.js'
import selectorMatchesFilename from './selector-matches-filename.js'
import selectorStateFirstParam from './selector-state-first-param.js'
import sliceMatchesFolder from './slice-matches-folder.js'
import timeConstantMultiplication from './time-constant-multiplication.js'
import tryCatchIsolation from './try-catch-isolation.js'
import useDataBuilders from './use-data-builders.js'
import usecaseMatchesFilename from './usecase-matches-filename.js'
import viewModelMatchesFilename from './view-model-matches-filename.js'

export default {
  'builder-matches-filename': builderMatchesFilename,
  'core-no-restricted-globals': coreNoRestrictedGlobals,
  'core-no-restricted-imports': coreNoRestrictedImports,
  'core-no-restricted-properties': coreNoRestrictedProperties,
  'core-test-file-naming': coreTestFileNaming,
  'core-test-no-restricted-properties': coreTestNoRestrictedProperties,
  'curly-multi-or-nest': curlyMultiOrNest,
  'expect-separate-act-assert': expectSeparateActAssert,
  'file-naming-convention': fileNamingConvention,
  'fixture-matches-filename': fixtureMatchesFilename,
  'gateway-implementation-naming': gatewayImplementationNaming,
  'infra-logger-prefix': infraLoggerPrefix,
  'infra-must-rethrow': infraMustRethrow,
  'infra-public-method-try-catch': infraPublicMethodTryCatch,
  'inline-single-statement-handlers': inlineSingleStatementHandlers,
  'lines-between-class-members': linesBetweenClassMembers,
  'listener-error-handling': listenerErrorHandling,
  'listener-matches-filename': listenerMatchesFilename,
  'max-statements-per-line': maxStatementsPerLine,
  'naming-convention-boolean-prefix': namingConventionBooleanPrefix,
  'no-adapter-in-ui': noAdapterInUi,
  'no-and-or-in-names': noAndOrInNames,
  'no-call-expression-in-jsx-props': noCallExpressionInJsxProps,
  'no-complex-inline-arguments': noComplexInlineArguments,
  'no-complex-jsx-in-conditionals': noComplexJsxInConditionals,
  'no-consecutive-duplicate-returns': noConsecutiveDuplicateReturns,
  'no-cross-layer-imports': noCrossLayerImports,
  'no-data-builders-in-production': noDataBuildersInProduction,
  'no-date-now': noDateNow,
  'no-else-if': noElseIf,
  'no-entire-state-selector': noEntireStateSelector,
  'no-enum-value-as-string-literal': noEnumValueAsStringLiteral,
  'no-generic-result-variable': noGenericResultVariable,
  'no-i-prefix-in-imports': noIPrefixInImports,
  'no-icon-size-magic-numbers': noIconSizeMagicNumbers,
  'no-index-in-core': noIndexInCore,
  'no-inline-import-type': noInlineImportType,
  'no-inline-object-type': noInlineObjectType,
  'no-lame-naming': noLameNaming,
  'no-module-level-constants': noModuleLevelConstants,
  'no-nested-call-expressions': noNestedCallExpressions,
  'no-nested-this-calls': noNestedThisCalls,
  'no-new-in-test-body': noNewInTestBody,
  'no-redundant-nullish-ternary': noRedundantNullishTernary,
  'no-redundant-prop-spreading': noRedundantPropSpreading,
  'no-selector-prop-drilling': noSelectorPropDrilling,
  'no-stylesheet-magic-numbers': noStylesheetMagicNumbers,
  'no-switch': noSwitch,
  'no-ternary-false-fallback': noTernaryFalseFallback,
  'no-thunk-result-in-component': noThunkResultInComponent,
  'no-try-catch-in-core': noTryCatchInCore,
  'no-unused-test-id': noUnusedTestId,
  'no-unwrap': noUnwrap,
  'no-usecallback-selector-wrapper': noUsecallbackSelectorWrapper,
  'object-shorthand': objectShorthand,
  'one-component-per-file': oneComponentPerFile,
  'one-listener-per-file': oneListenerPerFile,
  'one-selector-per-file': oneSelectorPerFile,
  'one-usecase-per-file': oneUsecasePerFile,
  'one-view-model-per-file': oneViewModelPerFile,
  'padding-line-between-block-like': paddingLineBetweenBlockLike,
  'prefer-array-destructuring': preferArrayDestructuring,
  'prefer-enum-over-string-union': preferEnumOverStringUnion,
  'prefer-extracted-component': preferExtractedComponent,
  'prefer-extracted-long-params': preferExtractedLongParams,
  'prefer-inline-variable': preferInlineVariable,
  'prefer-jump-table': preferJumpTable,
  'prefer-named-selector': preferNamedSelector,
  'prefer-object-destructuring': preferObjectDestructuring,
  'prefer-parameterized-test': preferParameterizedTest,
  'prefer-short-circuit-jsx': preferShortCircuitJsx,
  'prefer-ternary-jsx': preferTernaryJsx,
  'prefer-ternary-return': preferTernaryReturn,
  'react-props-destructuring': reactPropsDestructuring,
  'reducer-in-domain-folder': reducerInDomainFolder,
  'repository-implementation-naming': repositoryImplementationNaming,
  'require-colocated-test': requireColocatedTest,
  'require-feature-flag-destructuring': requireFeatureFlagDestructuring,
  'require-logger-in-catch': requireLoggerInCatch,
  'require-named-regex': requireNamedRegex,
  'require-typed-each': requireTypedEach,
  'schema-matches-filename': schemaMatchesFilename,
  'selector-matches-filename': selectorMatchesFilename,
  'selector-state-first-param': selectorStateFirstParam,
  'slice-matches-folder': sliceMatchesFolder,
  'time-constant-multiplication': timeConstantMultiplication,
  'try-catch-isolation': tryCatchIsolation,
  'use-data-builders': useDataBuilders,
  'usecase-matches-filename': usecaseMatchesFilename,
  'view-model-matches-filename': viewModelMatchesFilename,
}
