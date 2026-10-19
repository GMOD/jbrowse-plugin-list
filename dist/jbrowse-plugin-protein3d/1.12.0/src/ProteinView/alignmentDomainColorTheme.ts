import { colord } from '@jbrowse/core/util/colord'
import { ColorThemeCategory } from 'molstar/lib/mol-theme/color/categories'
import { Color } from 'molstar/lib/mol-util/color'
import { TableLegend } from 'molstar/lib/mol-util/legend'
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition'

import { EMPTY_DOMAIN_COLOR } from './alignmentDomains'
import { NO_VALUE_COLOR, placedValueReader } from './placedValueRegistry'

import type { DomainColor, DomainMark } from './alignmentDomains'
import type { Location } from 'molstar/lib/mol-model/location'
import type { ColorTheme } from 'molstar/lib/mol-theme/color'
import type { ThemeDataContext } from 'molstar/lib/mol-theme/theme'

// The color object is a few names and colors, so it rides in the params; each
// residue's index into its domain comes from the registry, the domains' for a
// backbone mark, the sites' and then the domains' for an atom mark. `revision`
// changes on every recolor, since regions can move while the color object
// stays the same.
const AlignmentDomainColorThemeParams = {
  revision: PD.Numeric(0, {}, { isHidden: true }),
  color: PD.Value<DomainColor>(EMPTY_DOMAIN_COLOR, { isHidden: true }),
  mark: PD.Select<DomainMark>(
    'backbone',
    [
      ['backbone', 'Backbone'],
      ['atoms', 'Atoms'],
    ],
    { isHidden: true },
  ),
}

type Params = typeof AlignmentDomainColorThemeParams

function molstarColor(css: string) {
  const { r, g, b } = colord(css).toRgb()
  return Color.fromRgb(r, g, b)
}

export function alignmentDomainLegend(color: DomainColor) {
  return TableLegend([
    ...color.domain.map((accession, i): [string, Color] => [
      color.labels[i] ?? accession,
      molstarColor(color.range[i] ?? ''),
    ]),
    ['No domain', NO_VALUE_COLOR],
  ])
}

function AlignmentDomainColorTheme(
  ctx: ThemeDataContext,
  props: PD.Values<Params>,
): ColorTheme<Params> {
  const domainAt = placedValueReader('alignment-domains', ctx.structure)
  const siteAt = placedValueReader('alignment-sites', ctx.structure)
  const placedValue =
    props.mark === 'atoms'
      ? (location: Location) => siteAt(location) ?? domainAt(location)
      : domainAt
  const range = props.color.range.map(molstarColor)
  return {
    factory: AlignmentDomainColorTheme,
    granularity: 'group',
    preferSmoothing: true,
    color: location => {
      const index = placedValue(location)
      return (index === undefined ? undefined : range[index]) ?? NO_VALUE_COLOR
    },
    props,
    description:
      "Colors residues by the domains drawn on the connected alignment's query row, in the alignment's colors, placed through the genome. Residues outside every domain are grey.",
    legend: alignmentDomainLegend(props.color),
  }
}

export const AlignmentDomainColorThemeProvider: ColorTheme.Provider<
  Params,
  'alignment-domains'
> = {
  name: 'alignment-domains',
  label: 'Domains from the alignment',
  category: ColorThemeCategory.Residue,
  factory: AlignmentDomainColorTheme,
  getParams: () => AlignmentDomainColorThemeParams,
  defaultValues: PD.getDefaultValues(AlignmentDomainColorThemeParams),
  isApplicable: ctx => !!ctx.structure,
}
