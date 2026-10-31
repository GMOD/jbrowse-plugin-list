import { EMPTY_DOMAIN_COLOR, domainMarkOf } from './alignmentDomains'
import loadMolstar from './loadMolstar'
import { molstarThemeOf, resolvedColor } from './proteinColor'
import { serialPerPlugin } from './serialPerPlugin'
import { structureRepresentations, structureRootCell } from './structureCells'
import { VARIANT_EFFECT_SCHEMES } from './variantEffects'

import type { DomainColor } from './alignmentDomains'
import type { ProteinColor } from './proteinColor'
import type { PlacedValues } from './variantEffects'
import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { Legend } from 'molstar/lib/mol-util/legend'

/**
 * The themes that color by values placed on each structure's residues, which
 * they read from a registry (see placedValueRegistry)
 */
export const PLACED_VALUE_SCHEMES = [
  ...VARIANT_EFFECT_SCHEMES,
  'alignment-domains',
  'residue-values',
] as const

export type PlacedValueScheme = (typeof PLACED_VALUE_SCHEMES)[number]

function isPlacedValueScheme(
  theme: string | undefined,
): theme is PlacedValueScheme {
  return PLACED_VALUE_SCHEMES.some(s => s === theme)
}

function themeParams(
  color: ProteinColor,
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
  const scale = resolvedColor(color)
  return color.field === 'mappedChain'
    ? { entityId: entityId ?? '' }
    : color.field === 'domain'
      ? {
          revision,
          color: domainColor ?? EMPTY_DOMAIN_COLOR,
          mark: domainMarkOf(representationType),
        }
      : scale && isPlacedValueScheme(molstarThemeOf(color))
        ? { revision, color: scale }
        : scale && { color: scale }
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
 * A placed-value theme's values reach it through the registry it reads (see
 * placedValueRegistry), registered for each structure before the update; a
 * structure without values is drawn grey.
 */
async function recolor({
  plugin,
  color,
  structures,
}: {
  plugin: PluginContext
  color: ProteinColor
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
  const { createStructureColorThemeParams, registerPlacedValues } = molstar
  const theme = molstarThemeOf(color)
  const placed = isPlacedValueScheme(theme)
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
      registerPlacedValues(theme, molstarStructure, placedValues)
    }
    if (color.field === 'domain') {
      registerPlacedValues('alignment-sites', molstarStructure, placedSites)
    }
    const cell = structureRootCell(plugin, molstar, molstarStructure)
    const representations = cell
      ? structureRepresentations(plugin, molstar, cell)
      : []
    for (const representation of representations) {
      update.to(representation).update(prev => {
        prev.colorTheme = createStructureColorThemeParams(
          plugin,
          molstarStructure,
          prev.type.name,
          theme,
          themeParams(color, {
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
  if (recolored > 0) {
    await update.commit()
  }
}

export function applyColorTheme(args: Parameters<typeof recolor>[0]) {
  return serialPerPlugin(args.plugin, () => recolor(args))
}

/**
 * The key Mol* itself would show for a color, which its viewport never draws
 * and its hidden-by-default controls panel buries. Built on one structure, so a
 * data-dependent table (chain ids) names that structure's entries.
 */
export function colorLegendOf({
  plugin,
  color,
  structure,
  entityId,
  domainColor,
}: {
  plugin: PluginContext
  color: ProteinColor
  structure: Structure
  entityId?: string
  domainColor?: DomainColor
}): Legend | undefined {
  const theme = molstarThemeOf(color)
  return theme === undefined
    ? undefined
    : plugin.representation.structure.themes.colorThemeRegistry.create(
        theme,
        { structure },
        themeParams(color, { entityId, domainColor }) ?? {},
      ).legend
}
