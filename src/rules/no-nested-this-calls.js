/**
 * @fileoverview Prevent nested this.method(this.method(...)) calls.
 * When a method needs to compose two this.* calls, extract an intermediate
 * variable or create a dedicated method that encapsulates the composition.
 * @author TiedSiren
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow nested this.method() calls as arguments',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      nestedThisCall:
        'Nested this.{{ outer }}(this.{{ inner }}(...)) detected. Extract the inner call to a variable or create a composed method.',
    },
    schema: [],
  },

  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.object.type !== 'ThisExpression'
        )
          return

        const outerName =
          node.callee.property.type === 'Identifier'
            ? node.callee.property.name
            : '?'

        for (const arg of node.arguments) {
          if (
            arg.type === 'CallExpression' &&
            arg.callee.type === 'MemberExpression' &&
            arg.callee.object.type === 'ThisExpression'
          ) {
            const innerName =
              arg.callee.property.type === 'Identifier'
                ? arg.callee.property.name
                : '?'

            context.report({
              node,
              messageId: 'nestedThisCall',
              data: { outer: outerName, inner: innerName },
              fix(fixer) {
                const sourceCode = context.getSourceCode()
                const varName = innerName !== '?' ? `${innerName}Result` : 'callResult'
                const exprText = sourceCode.getText(arg)
                let stmt = node
                while (stmt.parent && stmt.parent.type !== 'Program' && stmt.parent.type !== 'BlockStatement') {
                  stmt = stmt.parent
                }
                const indent = sourceCode.getText().slice(
                  sourceCode.getIndexFromLoc({ line: stmt.loc.start.line, column: 0 }),
                  stmt.range[0]
                )
                return [
                  fixer.insertTextBefore(stmt, `const ${varName} = ${exprText}\n${indent}`),
                  fixer.replaceText(arg, varName)
                ]
              },
            })
          }
        }
      },
    }
  },
}
