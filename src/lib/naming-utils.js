/**
 * Shared naming utilities for converting between naming conventions.
 */

/**
 * Convert kebab-case to camelCase.
 * @param {string} str - kebab-case string
 * @returns {string}
 */
export function kebabToCamel(str) {
  return str.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
}

/**
 * Convert kebab-case to PascalCase.
 * @param {string} str - kebab-case string
 * @returns {string}
 */
export function kebabToPascal(str) {
  const camel = kebabToCamel(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

/**
 * Convert UPPER_SNAKE_CASE to camelCase with "is" prefix.
 * e.g., "ENABLE_FEATURE" → "isEnableFeature"
 * @param {string} upperSnakeCase
 * @returns {string}
 */
export function upperSnakeToCamelWithIsPrefix(upperSnakeCase) {
  const words = upperSnakeCase.split('_')
  const camel = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
  return 'is' + camel
}

/**
 * Check if a string is kebab-case.
 * @param {string} str
 * @returns {boolean}
 */
export function isKebabCase(str) {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(str)
}

/**
 * Check if a string is PascalCase.
 * @param {string} str
 * @returns {boolean}
 */
export function isPascalCase(str) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str)
}

/**
 * Check if a string is camelCase.
 * @param {string} str
 * @returns {boolean}
 */
export function isCamelCase(str) {
  return /^[a-z][a-zA-Z0-9]*$/.test(str)
}

/**
 * Get the basename of a file path (without directories).
 * @param {string} filePath
 * @returns {string}
 */
export function getBaseName(filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1]
}
