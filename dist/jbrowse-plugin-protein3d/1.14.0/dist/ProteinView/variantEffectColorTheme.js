import { ColorThemeCategory } from 'molstar/lib/mol-theme/color/categories';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { molstarLegendOf, molstarScaleOf } from './molstarColorScale';
import { NO_VALUE_COLOR, placedValueReader } from './placedValueRegistry';
import { RESIDUE_COLORS } from './residueColors';
const STYLES = {
    alphamissense: {
        color: RESIDUE_COLORS.alphaMissense,
        description: 'Colors residues by mean AlphaMissense pathogenicity: likely benign blue, likely pathogenic red. Residues without a score are grey.',
    },
    clinvar: {
        color: RESIDUE_COLORS.clinvarPathogenicCount,
        noValueLabel: 'No value',
        description: 'Colors residues by how many missense substitutions ClinVar calls pathogenic or likely pathogenic, read off the genome under the transcript. Residues the alignment to the transcript does not reach are grey.',
    },
};
// The color object is a few members, so it rides in the params; the values
// come from the registry. `revision` only changes, so a recolor after the
// values arrive is not deduplicated by Mol* as an update to identical params.
function themeParams(color) {
    return {
        revision: PD.Numeric(0, {}, { isHidden: true }),
        color: PD.Value(color, { isHidden: true }),
    };
}
function variantEffectTheme(scheme) {
    const { noValueLabel, description } = STYLES[scheme];
    return function VariantEffectColorTheme(ctx, props) {
        const placedValue = placedValueReader(scheme, ctx.structure);
        const color = molstarScaleOf(props.color, NO_VALUE_COLOR);
        return {
            factory: VariantEffectColorTheme,
            granularity: 'group',
            preferSmoothing: true,
            color: location => color(placedValue(location)),
            props,
            description,
            legend: molstarLegendOf(props.color, noValueLabel ? [noValueLabel, NO_VALUE_COLOR] : undefined),
        };
    };
}
function provider(name, label) {
    const params = themeParams(STYLES[name].color);
    return {
        name,
        label,
        category: ColorThemeCategory.Residue,
        factory: variantEffectTheme(name),
        getParams: () => params,
        defaultValues: PD.getDefaultValues(params),
        isApplicable: ctx => !!ctx.structure,
    };
}
export const AlphaMissenseColorThemeProvider = provider('alphamissense', 'AlphaMissense pathogenicity');
export const ClinVarColorThemeProvider = provider('clinvar', 'ClinVar pathogenic variants');
