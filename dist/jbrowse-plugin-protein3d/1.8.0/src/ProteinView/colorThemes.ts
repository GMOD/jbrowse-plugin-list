import { KyteDoolittleColorThemeProvider } from './kyteDoolittleColorTheme'
import { MappedChainColorThemeProvider } from './mappedChainColorTheme'
import {
  AlphaMissenseColorThemeProvider,
  ClinVarColorThemeProvider,
} from './variantEffectColorTheme'

import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export function registerColorThemes(plugin: PluginContext) {
  const registry = plugin.representation.structure.themes.colorThemeRegistry
  registry.add(MappedChainColorThemeProvider)
  registry.add(KyteDoolittleColorThemeProvider)
  registry.add(AlphaMissenseColorThemeProvider)
  registry.add(ClinVarColorThemeProvider)
}
