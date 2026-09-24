import loadMolstar from './loadMolstar'
import { structureRootCell } from './structureCells'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

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

/**
 * Recolor every representation of every structure in one Mol* state update.
 * The representations are found in the live state tree rather than through
 * `updateRepresentationsTheme`, whose components come from the hierarchy
 * snapshot (see structureRootCell). The non-ghost ones are what that call
 * reached: each component's, the focus representation's included.
 */
export async function applyColorTheme({
  plugin,
  colorScheme,
  structures,
}: {
  plugin: PluginContext
  colorScheme: ProteinColorScheme
  structures: readonly { molstarStructure: Structure; entityId?: string }[]
}) {
  const molstar = await loadMolstar()
  const { StateSelection, StateTransforms, createStructureColorThemeParams } =
    molstar
  const theme = colorScheme === 'default' ? undefined : colorScheme
  const update = plugin.state.data.build()
  let recolored = 0
  for (const { molstarStructure, entityId } of structures) {
    const cell = structureRootCell(plugin, molstar, molstarStructure)
    const representations = cell
      ? plugin.state.data.select(
          StateSelection.Generators.ofTransformer(
            StateTransforms.Representation.StructureRepresentation3D,
            cell.transform.ref,
          ),
        )
      : []
    const params =
      colorScheme === 'mapped-chain' ? { entityId: entityId ?? '' } : undefined
    for (const representation of representations) {
      if (!representation.state.isGhost) {
        update.to(representation).update(prev => {
          prev.colorTheme = createStructureColorThemeParams(
            plugin,
            molstarStructure,
            prev.type.name,
            theme,
            params,
          )
        })
        recolored++
      }
    }
  }
  if (recolored > 0) {
    await update.commit()
  }
}
