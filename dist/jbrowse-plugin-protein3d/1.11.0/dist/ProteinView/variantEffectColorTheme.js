import { ColorThemeCategory } from 'molstar/lib/mol-theme/color/categories';
import { Color } from 'molstar/lib/mol-util/color';
import { ScaleLegend, TableLegend } from 'molstar/lib/mol-util/legend';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { NO_VALUE_COLOR, placedValueReader } from './placedValueRegistry';
import { ALPHAMISSENSE_MID, CLINVAR_COLORS, alphaMissenseRgb, clinVarRgb, } from './variantEffects';
// `revision` only changes, so a recolour after the values arrive is not
// deduplicated by Mol* as an update to identical params
const VariantEffectColorThemeParams = {
    revision: PD.Numeric(0, {}, { isHidden: true }),
};
function rgbColor([r, g, b]) {
    return Color.fromRgb(r, g, b);
}
const ALPHAMISSENSE_LEGEND = ScaleLegend('Likely benign 0', 'Likely pathogenic 1', [0, ALPHAMISSENSE_MID, 1].map(score => rgbColor(alphaMissenseRgb(score))));
const CLINVAR_LEGEND = TableLegend([
    ...CLINVAR_COLORS.map((_, count) => [
        count === CLINVAR_COLORS.length - 1 ? `${count} or more` : `${count}`,
        rgbColor(clinVarRgb(count)),
    ]),
    ['No value', NO_VALUE_COLOR],
]);
const STYLES = {
    alphamissense: {
        color: score => rgbColor(alphaMissenseRgb(score)),
        legend: ALPHAMISSENSE_LEGEND,
        description: 'Colors residues by mean AlphaMissense pathogenicity: likely benign blue, likely pathogenic red. Residues without a score are grey.',
    },
    clinvar: {
        color: count => rgbColor(clinVarRgb(count)),
        legend: CLINVAR_LEGEND,
        description: 'Colors residues by how many missense substitutions ClinVar calls pathogenic or likely pathogenic, read off the genome under the transcript. Residues the alignment to the transcript does not reach are grey.',
    },
};
function variantEffectTheme(scheme) {
    const { color, legend, description } = STYLES[scheme];
    return function VariantEffectColorTheme(ctx, props) {
        const placedValue = placedValueReader(scheme, ctx.structure);
        return {
            factory: VariantEffectColorTheme,
            granularity: 'group',
            preferSmoothing: true,
            color: location => {
                const value = placedValue(location);
                return value === undefined ? NO_VALUE_COLOR : color(value);
            },
            props,
            description,
            legend,
        };
    };
}
function provider(name, label) {
    return {
        name,
        label,
        category: ColorThemeCategory.Residue,
        factory: variantEffectTheme(name),
        getParams: () => VariantEffectColorThemeParams,
        defaultValues: PD.getDefaultValues(VariantEffectColorThemeParams),
        isApplicable: ctx => !!ctx.structure,
    };
}
export const AlphaMissenseColorThemeProvider = provider('alphamissense', 'AlphaMissense pathogenicity');
export const ClinVarColorThemeProvider = provider('clinvar', 'ClinVar pathogenic variants');
