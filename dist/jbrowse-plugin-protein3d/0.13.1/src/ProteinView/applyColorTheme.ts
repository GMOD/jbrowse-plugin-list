import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { StructureComponentManager } from 'molstar/lib/mol-plugin-state/manager/structure/component'
import type { ColorTheme } from 'molstar/lib/mol-theme/color'
import type { SizeTheme } from 'molstar/lib/mol-theme/size'

/**
 * Color schemes offered in the protein view menu. The `value`s are molstar
 * color-theme names: all are built-in except `plddt-confidence`, which the
 * MAQualityAssessment behavior registers from AlphaFold's per-residue pLDDT,
 * and `mapped-chain`, which useProteinView registers.
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
  { value: 'mapped-chain', label: 'Mapped chain' },
] as const

export type ProteinColorScheme = (typeof COLOR_SCHEMES)[number]['value']

export const COLOR_SCHEME_VALUES = COLOR_SCHEMES.map(s => s.value)

/** An untrusted scheme name (a URL session-spec param) into the union. */
export function coerceColorScheme(value: string): ProteinColorScheme {
  return COLOR_SCHEME_VALUES.find(v => v === value) ?? 'default'
}

export async function applyColorTheme({
  plugin,
  colorScheme,
  structures,
}: {
  plugin: PluginContext
  colorScheme: ProteinColorScheme
  structures: readonly { molstarStructure: Structure; entityId?: string }[]
}) {
  for (const { molstarStructure, entityId } of structures) {
    const ref =
      plugin.managers.structure.hierarchy.findStructure(molstarStructure)
    if (ref) {
      // molstar types the theme against its statically-generated built-in
      // union, which excludes extension themes like 'plddt-confidence' and
      // 'mapped-chain'. Its own API doc says to widen the name here;
      // ProteinColorScheme keeps it constrained to schemes we actually expose.
      const theme =
        colorScheme === 'mapped-chain'
          ? { color: colorScheme, colorParams: { entityId: entityId ?? '' } }
          : { color: colorScheme }
      await plugin.managers.structure.component.updateRepresentationsTheme(
        ref.components,
        theme as StructureComponentManager.UpdateThemeParams<
          ColorTheme.BuiltIn,
          SizeTheme.BuiltIn
        >,
      )
    }
  }
}
