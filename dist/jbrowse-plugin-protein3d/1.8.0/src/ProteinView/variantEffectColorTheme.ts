import { StructureProperties } from 'molstar/lib/mol-model/structure'
import { ColorThemeCategory } from 'molstar/lib/mol-theme/color/categories'
import { Color } from 'molstar/lib/mol-util/color'
import { ScaleLegend, TableLegend } from 'molstar/lib/mol-util/legend'
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition'

import { atomicLocationReader } from './themeLocation'
import {
  ALPHAMISSENSE_MID,
  CLINVAR_COLORS,
  alphaMissenseRgb,
  clinVarRgb,
} from './variantEffects'

import type { PlacedValues, VariantEffectScheme } from './variantEffects'
import type { Model, Structure } from 'molstar/lib/mol-model/structure'
import type { ColorTheme } from 'molstar/lib/mol-theme/color'
import type { ThemeDataContext } from 'molstar/lib/mol-theme/theme'

export const NO_VALUE_COLOR = Color(0xcccccc)

// Per-residue arrays do not belong in a theme's serialized params, so the
// theme looks its values up here by the Mol* model a residue belongs to. A
// superposed structure keeps its units' models, and an ensemble has one model
// per structure, so each model of every load is registered on its own.
const registry: Record<VariantEffectScheme, WeakMap<Model, PlacedValues>> = {
  alphamissense: new WeakMap(),
  clinvar: new WeakMap(),
}

export function registerPlacedValues(
  scheme: VariantEffectScheme,
  structure: Structure,
  values: PlacedValues | undefined,
) {
  for (const model of structure.models) {
    if (values) {
      registry[scheme].set(model, values)
    } else {
      registry[scheme].delete(model)
    }
  }
}

// `revision` only changes, so a recolour after the values arrive is not
// deduplicated by Mol* as an update to identical params
const VariantEffectColorThemeParams = {
  revision: PD.Numeric(0, {}, { isHidden: true }),
}

type Params = typeof VariantEffectColorThemeParams

function rgbColor([r, g, b]: readonly [number, number, number]) {
  return Color.fromRgb(r, g, b)
}

const ALPHAMISSENSE_LEGEND = ScaleLegend(
  'Likely benign 0',
  'Likely pathogenic 1',
  [0, ALPHAMISSENSE_MID, 1].map(score => rgbColor(alphaMissenseRgb(score))),
)

const CLINVAR_LEGEND = TableLegend([
  ...CLINVAR_COLORS.map((_, count): [string, Color] => [
    count === CLINVAR_COLORS.length - 1 ? `${count} or more` : `${count}`,
    rgbColor(clinVarRgb(count)),
  ]),
  ['No value', NO_VALUE_COLOR],
])

const STYLES: Record<
  VariantEffectScheme,
  {
    color: (value: number) => Color
    legend: ColorTheme<Params>['legend']
    description: string
  }
> = {
  alphamissense: {
    color: score => rgbColor(alphaMissenseRgb(score)),
    legend: ALPHAMISSENSE_LEGEND,
    description:
      'Colors residues by mean AlphaMissense pathogenicity: likely benign blue, likely pathogenic red. Residues without a score are grey.',
  },
  clinvar: {
    color: count => rgbColor(clinVarRgb(count)),
    legend: CLINVAR_LEGEND,
    description:
      'Colors residues by how many missense substitutions ClinVar calls pathogenic or likely pathogenic, read off the genome under the transcript. Residues the alignment to the transcript does not reach are grey.',
  },
}

function variantEffectTheme(scheme: VariantEffectScheme) {
  const { color, legend, description } = STYLES[scheme]
  return function VariantEffectColorTheme(
    ctx: ThemeDataContext,
    props: PD.Values<Params>,
  ): ColorTheme<Params> {
    const atomicLocation = atomicLocationReader(ctx.structure)
    return {
      factory: VariantEffectColorTheme,
      granularity: 'group',
      preferSmoothing: true,
      color: location => {
        const l = atomicLocation(location)
        const placed = l ? registry[scheme].get(l.unit.model) : undefined
        const value =
          l && placed?.entityId === StructureProperties.chain.label_entity_id(l)
            ? placed.byLabelSeqId.get(
                StructureProperties.residue.label_seq_id(l),
              )
            : undefined
        return value === undefined ? NO_VALUE_COLOR : color(value)
      },
      props,
      description,
      legend,
    }
  }
}

function provider<N extends VariantEffectScheme>(
  name: N,
  label: string,
): ColorTheme.Provider<Params, N> {
  return {
    name,
    label,
    category: ColorThemeCategory.Residue,
    factory: variantEffectTheme(name),
    getParams: () => VariantEffectColorThemeParams,
    defaultValues: PD.getDefaultValues(VariantEffectColorThemeParams),
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
