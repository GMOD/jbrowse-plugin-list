import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { ColorTheme } from 'molstar/lib/mol-theme/color'

/**
 * Color schemes offered in the protein view menu. The `value`s are molstar
 * color-theme names: all are built-in except `plddt-confidence`, which is
 * registered by the MAQualityAssessment behavior (see useProteinView) and reads
 * the per-residue pLDDT scores parsed from AlphaFold mmCIF files.
 */
export const COLOR_SCHEMES = [
  { value: 'default', label: 'Default (element/chain)' },
  { value: 'plddt-confidence', label: 'pLDDT confidence (AlphaFold)' },
  { value: 'chain-id', label: 'Chain' },
  { value: 'secondary-structure', label: 'Secondary structure' },
  { value: 'hydrophobicity', label: 'Hydrophobicity (Kyte-Doolittle)' },
  { value: 'residue-name', label: 'Residue type' },
  { value: 'uncertainty', label: 'B-factor / uncertainty' },
  { value: 'molecule-type', label: 'Molecule type' },
] as const

export type ProteinColorScheme = (typeof COLOR_SCHEMES)[number]['value']

export const COLOR_SCHEME_VALUES = COLOR_SCHEMES.map(s => s.value)

export async function applyColorTheme({
  plugin,
  colorScheme,
}: {
  plugin: PluginContext
  colorScheme: ProteinColorScheme
}) {
  const { structures } = plugin.managers.structure.hierarchy.current
  for (const structure of structures) {
    // molstar types `color` against its statically-generated built-in theme
    // union, which excludes extension themes like 'plddt-confidence'. Its own
    // API doc says to widen the name here; ProteinColorScheme keeps it
    // constrained to schemes we actually expose.
    await plugin.managers.structure.component.updateRepresentationsTheme(
      structure.components,
      { color: colorScheme as ColorTheme.BuiltIn | 'default' },
    )
  }
}
