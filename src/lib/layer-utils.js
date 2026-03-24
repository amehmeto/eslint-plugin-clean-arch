/**
 * Layer detection utilities for architecture boundary enforcement.
 */

import { DEFAULT_SETTINGS } from './settings.js'

/**
 * Determine which layer a file belongs to based on its path.
 * @param {string} filename
 * @param {Record<string, { path: string; aliases?: string[] }>} [layers]
 * @returns {string | null}
 */
export function getLayerFromFilename(filename, layers) {
  const layerConfig = layers || DEFAULT_SETTINGS.layers
  const normalized = filename.replace(/\\/g, '/')
  for (const [layerName, config] of Object.entries(layerConfig))
    if (normalized.includes(config.path)) return layerName

  return null
}

/**
 * Determine which layer an import targets based on import path.
 * @param {string} importPath
 * @param {Record<string, { path: string; aliases?: string[] }>} [layers]
 * @returns {string | null}
 */
export function getImportLayer(importPath, layers) {
  const layerConfig = layers || DEFAULT_SETTINGS.layers
  for (const [layerName, config] of Object.entries(layerConfig)) {
    if (config.aliases) {
      for (const alias of config.aliases)
        if (importPath.startsWith(alias)) return layerName
    }
    if (importPath.includes(config.path)) return layerName
  }
  return null
}

/**
 * Check if an import from one layer to another is forbidden.
 * @param {string} fromLayer
 * @param {string} toLayer
 * @param {Record<string, string[]>} [forbiddenImports]
 * @returns {boolean}
 */
export function isImportForbidden(fromLayer, toLayer, forbiddenImports) {
  const matrix = forbiddenImports || DEFAULT_SETTINGS.forbiddenImports
  const forbidden = matrix[fromLayer]
  if (!forbidden) return false
  return forbidden.includes(toLayer)
}
