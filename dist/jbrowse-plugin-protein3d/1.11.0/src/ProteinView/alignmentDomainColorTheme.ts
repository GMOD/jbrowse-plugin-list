import { ColorThemeCategory } from 'molstar/lib/mol-theme/color/categories'
import { Color } from 'molstar/lib/mol-util/color'
import { TableLegend } from 'molstar/lib/mol-util/legend'
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition'

import { NO_VALUE_COLOR, placedValueReader } from './placedValueRegistry'

import type { DomainStyle } from './alignmentDomains'
import type { ColorTheme } from 'molstar/lib/mol-theme/color'
import type { ThemeDataContext } from 'molstar/lib/mol-theme/theme'

// The palette is a few names and colors, so it rides in the params; each
// residue's domain index comes from the registry. `revision` changes on every
// recolour, since regions can move while the palette stays the same.
const AlignmentDomainColorThemeParams = {
  revision: PD.Numeric(0, {}, { isHidden: true }),
  domains: PD.Value<readonly DomainStyle[]>([], { isHidden: true }),
}

type Params = typeof AlignmentDomainColorThemeParams

export function alignmentDomainLegend(domains: readonly DomainStyle[]) {
  const seen = new Set<string>()
  const rows: [string, Color][] = []
  for (const { name, color } of domains) {
    const key = `${name}\t${color}`
    if (!seen.has(key)) {
      seen.add(key)
      rows.push([name, Color(color)])
    }
  }
  return TableLegend([...rows, ['No domain', NO_VALUE_COLOR]])
}

function AlignmentDomainColorTheme(
  ctx: ThemeDataContext,
  props: PD.Values<Params>,
): ColorTheme<Params> {
  const placedValue = placedValueReader('alignment-domains', ctx.structure)
  return {
    factory: AlignmentDomainColorTheme,
    granularity: 'group',
    preferSmoothing: true,
    color: location => {
      const index = placedValue(location)
      const domain = index === undefined ? undefined : props.domains[index]
      return domain ? Color(domain.color) : NO_VALUE_COLOR
    },
    props,
    description:
      "Colors residues by the domains drawn on the connected alignment's query row, in the alignment's colors, placed through the genome. Residues outside every domain are grey.",
    legend: alignmentDomainLegend(props.domains),
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
