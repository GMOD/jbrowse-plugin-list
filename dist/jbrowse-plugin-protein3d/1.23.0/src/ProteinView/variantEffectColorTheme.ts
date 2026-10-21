import { ColorThemeCategory } from 'molstar/lib/mol-theme/color/categories'
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition'

import { molstarLegendOf, molstarScaleOf } from './molstarColorScale'
import { NO_VALUE_COLOR, placedValueReader } from './placedValueRegistry'
import { RESIDUE_COLORS } from './residueColors'

import type { ScaledColor } from './colorScale'
import type { VariantEffectScheme } from './variantEffects'
import type { ColorTheme } from 'molstar/lib/mol-theme/color'
import type { ThemeDataContext } from 'molstar/lib/mol-theme/theme'

type ScoreScheme = VariantEffectScheme | 'residue-values'

const STYLES: Record<
  ScoreScheme,
  { color: ScaledColor; noValueLabel?: string; description: string }
> = {
  alphamissense: {
    color: RESIDUE_COLORS.alphaMissense,
    description:
      'Colors residues by mean AlphaMissense pathogenicity: likely benign blue, likely pathogenic red. Residues without a score are grey.',
  },
  clinvar: {
    color: RESIDUE_COLORS.clinvarPathogenicCount,
    noValueLabel: 'No value',
    description:
      'Colors residues by how many missense substitutions ClinVar calls pathogenic or likely pathogenic, read off the genome under the transcript. Residues the alignment to the transcript does not reach are grey.',
  },
  'genome-track': {
    color: RESIDUE_COLORS.track,
    description:
      "Colors residues by the scores of a genome track under each residue's codon. Residues with no score are grey.",
  },
  'residue-values': {
    color: RESIDUE_COLORS.values,
    description:
      'Colors residues by numbers given per residue of the transcript. Residues with no number are grey.',
  },
}

// The color object is a few members, so it rides in the params; the values
// come from the registry. `revision` only changes, so a recolor after the
// values arrive is not deduplicated by Mol* as an update to identical params.
function themeParams(color: ScaledColor) {
  return {
    revision: PD.Numeric(0, {}, { isHidden: true }),
    color: PD.Value<ScaledColor>(color, { isHidden: true }),
  }
}

type Params = ReturnType<typeof themeParams>

function variantEffectTheme(scheme: ScoreScheme) {
  const { noValueLabel, description } = STYLES[scheme]
  return function VariantEffectColorTheme(
    ctx: ThemeDataContext,
    props: PD.Values<Params>,
  ): ColorTheme<Params> {
    const placedValue = placedValueReader(scheme, ctx.structure)
    const color = molstarScaleOf(props.color, NO_VALUE_COLOR)
    return {
      factory: VariantEffectColorTheme,
      granularity: 'group',
      preferSmoothing: true,
      color: location => color(placedValue(location)),
      props,
      description,
      legend: molstarLegendOf(
        props.color,
        noValueLabel ? [noValueLabel, NO_VALUE_COLOR] : undefined,
      ),
    }
  }
}

function provider<N extends ScoreScheme>(
  name: N,
  label: string,
): ColorTheme.Provider<Params, N> {
  const params = themeParams(STYLES[name].color)
  return {
    name,
    label,
    category: ColorThemeCategory.Residue,
    factory: variantEffectTheme(name),
    getParams: () => params,
    defaultValues: PD.getDefaultValues(params),
    isApplicable: ctx => !!ctx.structure,
  }
}

export const AlphaMissenseColorThemeProvider = provider(
  'alphamissense',
  'AlphaMissense pathogenicity',
)

export const ClinVarColorThemeProvider = provider(
  'clinvar',
  'ClinVar pathogenic variants',
)

export const GenomeTrackColorThemeProvider = provider(
  'genome-track',
  'Genome track scores',
)

export const ResidueValuesColorThemeProvider = provider(
  'residue-values',
  'Residue values',
)
