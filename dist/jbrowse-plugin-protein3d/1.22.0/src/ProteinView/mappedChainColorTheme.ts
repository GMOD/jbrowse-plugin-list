import { StructureProperties } from 'molstar/lib/mol-model/structure'
import { ColorThemeCategory } from 'molstar/lib/mol-theme/color/categories'
import { Color } from 'molstar/lib/mol-util/color'
import { TableLegend } from 'molstar/lib/mol-util/legend'
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition'

import { atomicLocationReader } from './themeLocation'

import type { Location } from 'molstar/lib/mol-model/location'
import type { ColorTheme } from 'molstar/lib/mol-theme/color'
import type { ThemeDataContext } from 'molstar/lib/mol-theme/theme'

export const MAPPED_CHAIN_COLOR = Color(0x377eb8)
export const OTHER_CHAIN_COLOR = Color(0xcccccc)

const MappedChainColorThemeParams = {
  entityId: PD.Text(''),
}

type Params = typeof MappedChainColorThemeParams

function MappedChainColorTheme(
  ctx: ThemeDataContext,
  props: PD.Values<Params>,
): ColorTheme<Params> {
  const atomicLocation = atomicLocationReader(ctx.structure)
  function entityOf(location: Location) {
    const l = atomicLocation(location)
    return l ? StructureProperties.chain.label_entity_id(l) : undefined
  }
  return {
    factory: MappedChainColorTheme,
    granularity: 'group',
    color: location =>
      entityOf(location) === props.entityId
        ? MAPPED_CHAIN_COLOR
        : OTHER_CHAIN_COLOR,
    props,
    description: 'Colors the chain the transcript maps to; the rest is grey.',
    legend: TableLegend([
      ['Mapped chain', MAPPED_CHAIN_COLOR],
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
