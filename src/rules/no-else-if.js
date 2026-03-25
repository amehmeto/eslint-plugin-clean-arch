/**
 * @fileoverview Disallow else-if statements
 *
 * Else-if is syntactic sugar that can always be replaced with separate if statements
 * (when conditions are mutually exclusive) or explicit nested if-else blocks.
 *
 * @author TiedSiren
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow else-if statements',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      noElseIf:
        'Unexpected else-if. Use separate if statements or nested if-else blocks instead.',
    },
    fixable: 'code',
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode()

    return {
      IfStatement(node) {
        if (node.alternate && node.alternate.type === 'IfStatement') {
          context.report({
            node: node.alternate,
            messageId: 'noElseIf',
            fix(fixer) {
              const alternateText = sourceCode.getText(node.alternate)
              const indent = ' '.repeat(node.loc.start.column)
              return fixer.replaceText(
                node.alternate,
                `{\n${indent}  ${alternateText}\n${indent}}`,
              )
            },
          })
        }
      },
    }
  },
}
