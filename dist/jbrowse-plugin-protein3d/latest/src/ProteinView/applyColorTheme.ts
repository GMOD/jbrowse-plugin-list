import { EMPTY_DOMAIN_COLOR, domainMarkOf } from './alignmentDomains'
import { SITES_TAG } from './alignmentSites'
import loadMolstar from './loadMolstar'
import { structureRootCell } from './structureCells'
import { VARIANT_EFFECT_SCHEMES } from './variantEffects'

import type { DomainColor } from './alignmentDomains'
import type { PlacedValues } from './variantEffects'
import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { Legend } from 'molstar/lib/mol-util/legend'

/**
 * Color schemes offered in the protein view menu. A `value` is persisted in
 * sessions, so it names the scheme rather than the Mol* theme; `theme`, where
 * given, is the Mol* color-theme that draws it. `plddt-confidence` comes from
 * the MAQualityAssessment behavior, `mapped-chain`, `kyte-doolittle`,
 * `alphamissense`, `clinvar` and `alignment-domains` from registerColorThemes,
 * the rest are built in.
 */
export const COLOR_SCHEMES = [
  { value: 'default', label: 'Default (element/chain)' },
  { value: 'plddt-confidence', label: 'pLDDT confidence (AlphaFold)' },
  { value: 'chain-id', label: 'Chain' },
  { value: 'secondary-structure', label: 'Secondary structure' },
  {
    value: 'hydrophobicity',
    label: 'Hydrophobicity (Kyte-Doolittle)',
    theme: 'kyte-doolittle',
  },
  { value: 'residue-name', label: 'Residue type' },
  { value: 'uncertainty', label: 'B-factor / uncertainty' },
  { value: 'molecule-type', label: 'Molecule type' },
  { value: 'mapped-chain', label: 'Mapped chain' },
  { value: 'alphamissense', label: 'AlphaMissense pathogenicity' },
  { value: 'clinvar', label: 'ClinVar pathogenic variants' },
  { value: 'alignment-domains', label: 'Domains from the alignment' },
] as const

export type ProteinColorScheme = (typeof COLOR_SCHEMES)[number]['value']

export const COLOR_SCHEME_VALUES = COLOR_SCHEMES.map(s => s.value)

/** An untrusted scheme name (a URL session-spec param) into the union. */
export function coerceColorScheme(value: string): ProteinColorScheme {
  return COLOR_SCHEME_VALUES.find(v => v === value) ?? 'default'
}

export function molstarThemeName(colorScheme: ProteinColorScheme) {
  const scheme = COLOR_SCHEMES.find(s => s.value === colorScheme)
  return scheme && 'theme' in scheme ? scheme.theme : colorScheme
}

/**
 * The schemes that color by values placed on each structure's residues, which
 * their themes read from a registry (see placedValueRegistry)
 */
export const PLACED_VALUE_SCHEMES = [
  ...VARIANT_EFFECT_SCHEMES,
  'alignment-domains',
] as const

export type PlacedValueScheme = (typeof PLACED_VALUE_SCHEMES)[number]

function isPlacedValueScheme(
  scheme: ProteinColorScheme,
): scheme is PlacedValueScheme {
  return PLACED_VALUE_SCHEMES.some(s => s === scheme)
}

function themeParams(
  colorScheme: ProteinColorScheme,
  {
    entityId,
    domainColor,
    revision,
    representationType = '',
  }: {
    entityId?: string
    domainColor?: DomainColor
    revision?: number
    representationType?: string
  },
) {
  return colorScheme === 'mapped-chain'
    ? { entityId: entityId ?? '' }
    : colorScheme === 'alignment-domains'
      ? {
          revision,
          color: domainColor ?? EMPTY_DOMAIN_COLOR,
          mark: domainMarkOf(representationType),
        }
      : isPlacedValueScheme(colorScheme)
        ? { revision }
        : undefined
}

let revision = 0

/**
 * Recolor every representation of every structure in one Mol* state update.
 * The representations are found in the live state tree rather than through
 * `updateRepresentationsTheme`, whose components come from the hierarchy
 * snapshot (see structureRootCell). The non-ghost ones are what that call
 * reached: each component's, the focus representation's included. The
 * alignment sites' sticks keep their own theme (see alignmentSites).
 *
 * A placed-value scheme's values reach its theme through the registry its
 * theme reads (see placedValueRegistry), registered for each structure before
 * the update; a structure without values is drawn grey.
 */
export async function applyColorTheme({
  plugin,
  colorScheme,
  structures,
}: {
  plugin: PluginContext
  colorScheme: ProteinColorScheme
  structures: readonly {
    molstarStructure: Structure
    entityId?: string
    placedValues?: PlacedValues
    /** the alignment sites, which an atom mark draws over the domains */
    placedSites?: PlacedValues
    domainColor?: DomainColor
  }[]
}) {
  const molstar = await loadMolstar()
  const {
    StateSelection,
    StateTransforms,
    createStructureColorThemeParams,
    registerPlacedValues,
  } = molstar
  const theme =
    colorScheme === 'default' ? undefined : molstarThemeName(colorScheme)
  const placed = isPlacedValueScheme(colorScheme)
  if (placed) {
    revision++
  }
  const update = plugin.state.data.build()
  let recolored = 0
  for (const {
    molstarStructure,
    entityId,
    placedValues,
    placedSites,
    domainColor,
  } of structures) {
    if (placed) {
      registerPlacedValues(colorScheme, molstarStructure, placedValues)
    }
    if (colorScheme === 'alignment-domains') {
      registerPlacedValues('alignment-sites', molstarStructure, placedSites)
    }
    const cell = structureRootCell(plugin, molstar, molstarStructure)
    const representations = cell
      ? plugin.state.data.select(
          StateSelection.Generators.ofTransformer(
            StateTransforms.Representation.StructureRepresentation3D,
            cell.transform.ref,
          ),
        )
      : []
    for (const representation of representations) {
      if (
        !representation.state.isGhost &&
        !representation.transform.tags?.includes(SITES_TAG)
      ) {
        update.to(representation).update(prev => {
          prev.colorTheme = createStructureColorThemeParams(
            plugin,
            molstarStructure,
            prev.type.name,
            theme,
            themeParams(colorScheme, {
              entityId,
              domainColor,
              revision,
              representationType: prev.type.name,
            }),
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

/**
 * The key Mol* itself would show for a scheme, which its viewport never draws
 * and its hidden-by-default controls panel buries. Built on one structure, so a
 * data-dependent table (chain ids) names that structure's entries.
 */
export function colorSchemeLegend({
  plugin,
  colorScheme,
  structure,
  entityId,
  domainColor,
}: {
  plugin: PluginContext
  colorScheme: ProteinColorScheme
  structure: Structure
  entityId?: string
  domainColor?: DomainColor
}): Legend | undefined {
  return colorScheme === 'default'
    ? undefined
    : plugin.representation.structure.themes.colorThemeRegistry.create(
        molstarThemeName(colorScheme),
        { structure },
        themeParams(colorScheme, { entityId, domainColor }) ?? {},
      ).legend
}
