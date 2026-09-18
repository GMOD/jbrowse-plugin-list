import { Bond, StructureElement, StructureProperties, Unit, } from 'molstar/lib/mol-model/structure';
import { ColorThemeCategory } from 'molstar/lib/mol-theme/color/categories';
import { Color } from 'molstar/lib/mol-util/color';
import { TableLegend } from 'molstar/lib/mol-util/legend';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
export const MAPPED_CHAIN_COLOR = Color(0x377eb8);
export const OTHER_CHAIN_COLOR = Color(0xcccccc);
const MappedChainColorThemeParams = {
    entityId: PD.Text(''),
};
function MappedChainColorTheme(ctx, props) {
    const bondEnd = ctx.structure
        ? StructureElement.Location.create(ctx.structure.root)
        : undefined;
    function entityOf(location) {
        let l;
        if (StructureElement.Location.is(location)) {
            l = location;
        }
        else if (bondEnd && Bond.isLocation(location)) {
            const element = location.aUnit.elements[location.aIndex];
            if (element !== undefined) {
                bondEnd.unit = location.aUnit;
                bondEnd.element = element;
                l = bondEnd;
            }
        }
        return l && Unit.isAtomic(l.unit)
            ? StructureProperties.chain.label_entity_id(l)
            : undefined;
    }
    return {
        factory: MappedChainColorTheme,
        granularity: 'group',
        color: location => entityOf(location) === props.entityId
            ? MAPPED_CHAIN_COLOR
            : OTHER_CHAIN_COLOR,
        props,
        description: 'Colors the chain the transcript maps to; the rest is grey.',
        legend: TableLegend([
            ['Mapped chain', MAPPED_CHAIN_COLOR],
            ['Other', OTHER_CHAIN_COLOR],
        ]),
    };
}
export const MappedChainColorThemeProvider = {
    name: 'mapped-chain',
    label: 'Mapped chain',
    category: ColorThemeCategory.Chain,
    factory: MappedChainColorTheme,
    getParams: () => MappedChainColorThemeParams,
    defaultValues: PD.getDefaultValues(MappedChainColorThemeParams),
    isApplicable: ctx => !!ctx.structure,
};
