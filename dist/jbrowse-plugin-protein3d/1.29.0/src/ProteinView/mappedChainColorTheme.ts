import { StructureProperties } from 'molstar/lib/mol-model/structure'
import { ColorThemeCategory } from 'molstar/lib/mol-theme/color/categories'
import { Color } from 'molstar/lib/mol-util/color'
import { TableLegend } from 'molstar/lib/mol-util/legend'
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition'

import { CRYSTALLIZATION_ADDITIVES } from './crystallizationAdditives'
import { atomicLocationReader } from './themeLocation'

import type { Location } from 'molstar/lib/mol-model/location'
import type { ColorTheme } from 'molstar/lib/mol-theme/color'
import type { ThemeDataContext } from 'molstar/lib/mol-theme/theme'

export const MAPPED_CHAIN_COLOR = Color(0x377eb8)
export const OTHER_CHAIN_COLOR = Color(0xcccccc)
export const LIGAND_COLOR = Color(0xf28e2b)

const MappedChainColorThemeParams = {
  entityId: PD.Text(''),
}

type Params = typeof MappedChainColorThemeParams

function MappedChainColorTheme(
  ctx: ThemeDataContext,
  props: PD.Values<Params>,
): ColorTheme<Params> {
  const atomicLocation = atomicLocationReader(ctx.structure)
  function colorOf(location: Location) {
    const l = atomicLocation(location)
    if (!l) {
      return OTHER_CHAIN_COLOR
    }
    if (StructureProperties.chain.label_entity_id(l) === props.entityId) {
      return MAPPED_CHAIN_COLOR
    }
    return StructureProperties.entity.type(l) === 'non-polymer' &&
      !CRYSTALLIZATION_ADDITIVES.has(StructureProperties.atom.label_comp_id(l))
      ? LIGAND_COLOR
      : OTHER_CHAIN_COLOR
  }
  return {
    factory: MappedChainColorTheme,
    granularity: 'group',
    color: colorOf,
    props,
    description:
      'Colors the chain the transcript maps to and any bound ligand; the rest is grey.',
    legend: TableLegend([
      ['Mapped chain', MAPPED_CHAIN_COLOR],
      ['Ligand', LIGAND_COLOR],
      ['Other', OTHER_CHAIN_COLOR],
    ]),
  }
}

export const MappedChainColorThemeProvider: ColorTheme.Provider<
  Params,
  'mapped-chain'
> = {
  name: 'mapped-chain',
  label: 'Mapped chain',
  category: ColorThemeCategory.Chain,
  factory: MappedChainColorTheme,
  getParams: () => MappedChainColorThemeParams,
  defaultValues: PD.getDefaultValues(MappedChainColorThemeParams),
  isApplicable: ctx => !!ctx.structure,
}
