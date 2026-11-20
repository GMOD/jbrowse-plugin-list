import { ColorThemeCategory } from 'molstar/lib/mol-theme/color/categories';
import { Color } from 'molstar/lib/mol-util/color';
import { TableLegend } from 'molstar/lib/mol-util/legend';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { rgbOf } from './colorScale';
import { EMPTY_EXON_COLOR, exonKeyEntries } from './exons';
import { molstarScaleOf } from './molstarColorScale';
import { NO_VALUE_COLOR, placedValueReader } from './placedValueRegistry';
// The color object is the transcript's exon numbers and their colors, so it
// rides in the params; each residue's exon number comes from the registry.
// `revision` changes on every recolor, since the residues' exons can arrive
// while the color object stays the same.
const ExonColorThemeParams = {
    revision: PD.Numeric(0, {}, { isHidden: true }),
    color: PD.Value(EMPTY_EXON_COLOR, { isHidden: true }),
};
export function exonLegend(color) {
    return TableLegend([
        ...exonKeyEntries(color).map(({ label, color: c }) => {
            const [r, g, b] = rgbOf(c);
            return [label, Color.fromRgb(r, g, b)];
        }),
        ['Not mapped', NO_VALUE_COLOR],
    ]);
}
function ExonColorTheme(ctx, props) {
    const exonAt = placedValueReader('exon', ctx.structure);
    const color = molstarScaleOf(props.color, NO_VALUE_COLOR);
    return {
        factory: ExonColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color: location => color(exonAt(location)),
        props,
        description: 'Colors residues by the exon of the transcript their codon sits in, the palette repeating along the transcript. A codon an intron splits takes the exon holding two of its bases. Residues the alignment to the transcript does not reach are grey.',
        legend: exonLegend(props.color),
    };
}
export const ExonColorThemeProvider = {
    name: 'exon',
    label: 'Exon',
    category: ColorThemeCategory.Residue,
    factory: ExonColorTheme,
    getParams: () => ExonColorThemeParams,
    defaultValues: PD.getDefaultValues(ExonColorThemeParams),
    isApplicable: ctx => !!ctx.structure,
};
