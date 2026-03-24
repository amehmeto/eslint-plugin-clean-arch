/**
 * File pattern matching utilities for determining file types and scopes.
 */

import { DEFAULT_SETTINGS } from './settings.js'
import { getLayerFromFilename } from './layer-utils.js'
import { getBaseName } from './naming-utils.js'

/**
 * Normalize path separators to forward slashes (handles Windows paths).
 * @param {string} filepath
 * @returns {string}
 */
function normalizePath(filepath) {
  return filepath.replace(/\\/g, '/')
}

/**
 * Check if a file is a test file based on configured patterns.
 * @param {string} filename
 * @param {typeof DEFAULT_SETTINGS} [settings]
 * @returns {boolean}
 */
export function isTestFile(filename, settings) {
  const s = settings || DEFAULT_SETTINGS
  const basename = getBaseName(filename)
  return s.testFilePatterns.some((p) => basename.includes(p))
}

/**
 * Check if a file is a fixture file.
 * @param {string} filename
 * @param {typeof DEFAULT_SETTINGS} [settings]
 * @returns {boolean}
 */
export function isFixtureFile(filename, settings) {
  const s = settings || DEFAULT_SETTINGS
  const basename = getBaseName(filename)
  return s.fixtureFilePatterns.some((p) => basename.includes(p))
}

/**
 * Check if a file is a builder file.
 * @param {string} filename
 * @param {typeof DEFAULT_SETTINGS} [settings]
 * @returns {boolean}
 */
export function isBuilderFile(filename, settings) {
  const s = settings || DEFAULT_SETTINGS
  const basename = getBaseName(filename)
  return s.builderFilePatterns.some((p) => basename.includes(p))
}

/**
 * Check if a file is a test or fixture (allowed to break layer boundaries).
 * @param {string} filename
 * @param {typeof DEFAULT_SETTINGS} [settings]
 * @returns {boolean}
 */
export function isTestOrFixture(filename, settings) {
  const s = settings || DEFAULT_SETTINGS
  if (isTestFile(filename, s)) return true
  if (isFixtureFile(filename, s)) return true
  const normalized = normalizePath(filename)
  return s.testDirectories.some((d) => normalized.includes(d))
}

/**
 * Check if a file is a fake/stub/in-memory implementation.
 * @param {string} filename
 * @param {typeof DEFAULT_SETTINGS} [settings]
 * @returns {boolean}
 */
export function isFakeFile(filename, settings) {
  const s = settings || DEFAULT_SETTINGS
  const basename = getBaseName(filename)
  return s.fakeFilePatterns.some((p) => basename.includes(p))
}

/**
 * Check if a file is in a ports directory.
 * @param {string} filename
 * @param {typeof DEFAULT_SETTINGS} [settings]
 * @returns {boolean}
 */
export function isPortsFile(filename, settings) {
  const s = settings || DEFAULT_SETTINGS
  return normalizePath(filename).includes(s.portsDirectory)
}

/**
 * Check if a file is core production code (not test/fixture/builder/port).
 * @param {string} filename
 * @param {typeof DEFAULT_SETTINGS} [settings]
 * @returns {boolean}
 */
export function isCoreProductionFile(filename, settings) {
  const s = settings || DEFAULT_SETTINGS
  if (filename.includes('node_modules')) return false
  const layer = getLayerFromFilename(filename, s.layers)
  if (layer !== 'core') return false
  if (isTestFile(filename, s)) return false
  if (isFixtureFile(filename, s)) return false
  if (isBuilderFile(filename, s)) return false
  if (isPortsFile(filename, s)) return false
  return true
}

/**
 * Check if a file is in a specific layer's production code.
 * @param {string} filename
 * @param {string} layerName
 * @param {typeof DEFAULT_SETTINGS} [settings]
 * @returns {boolean}
 */
export function isLayerProductionFile(filename, layerName, settings) {
  const s = settings || DEFAULT_SETTINGS
  if (filename.includes('node_modules')) return false
  const layer = getLayerFromFilename(filename, s.layers)
  if (layer !== layerName) return false
  if (isTestFile(filename, s)) return false
  if (isFixtureFile(filename, s)) return false
  if (isFakeFile(filename, s)) return false
  return true
}

/**
 * Check if a file is in a specific directory pattern.
 * @param {string} filename
 * @param {string} dirPattern - e.g., '/usecases/', '/listeners/'
 * @returns {boolean}
 */
export function isInDirectory(filename, dirPattern) {
  return normalizePath(filename).includes(dirPattern)
}
