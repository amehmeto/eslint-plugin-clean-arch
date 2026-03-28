/**
 * @fileoverview Disallow hardcoded color strings in JSX props — use theme tokens instead
 * @author Joba / TiedSiren
 */

const KNOWN_COLORS = new Set([
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'gray',
  'grey',
  'blackBright',
  'redBright',
  'greenBright',
  'yellowBright',
  'blueBright',
  'magentaBright',
  'cyanBright',
  'whiteBright',
])

const COLOR_PROPS = new Set([
  'color',
  'borderColor',
  'backgroundColor',
])

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hardcoded color strings in JSX color props. Use theme values like T.color.* instead.',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noHardcodedColor:
        'Hardcoded color "{{value}}" in "{{prop}}" prop. Use T.color.* from the design system theme instead.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXAttribute(node) {
        const propName = node.name?.name
        if (!propName || !COLOR_PROPS.has(propName)) return

        const value = node.value

        // color="red" — string literal
        if (value?.type === 'Literal' && typeof value.value === 'string') {
          if (KNOWN_COLORS.has(value.value)) {
            context.report({
              node: value,
              messageId: 'noHardcodedColor',
              data: {
                value: value.value,
                prop: propName,
              },
            })
          }
        }

        // color={'red'} — JSX expression with string literal
        if (value?.type === 'JSXExpressionContainer') {
          const expr = value.expression
          if (expr?.type === 'Literal' && typeof expr.value === 'string') {
            if (KNOWN_COLORS.has(expr.value)) {
              context.report({
                node: expr,
                messageId: 'noHardcodedColor',
                data: {
                  value: expr.value,
                  prop: propName,
                },
              })
            }
          }
        }
      },
    }
  },
}
