import { Sequence } from 'molstar/lib/mol-model/sequence';
import { getProteinOneLetterCode } from 'molstar/lib/mol-model/sequence/constants';
import { StructureProperties } from 'molstar/lib/mol-model/structure';
import { MmcifFormat } from 'molstar/lib/mol-model-formats/structure/mmcif';
import { ColorThemeCategory } from 'molstar/lib/mol-theme/color/categories';
import { Color } from 'molstar/lib/mol-util/color';
import { ScaleLegend } from 'molstar/lib/mol-util/legend';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { HYDROPHOBICITY_KEY_SCORES, hydrophobicityRgb, kyteDoolittle, } from './residueTracks';
import { atomicLocationReader } from './themeLocation';
export const NON_AMINO_ACID_COLOR = Color(0xcccccc);
const KyteDoolittleColorThemeParams = {};
const canonicalByModel = new WeakMap();
function canonicalSequences(model) {
    let byEntity = canonicalByModel.get(model);
    if (!byEntity) {
        byEntity = new Map();
        const entityPoly = MmcifFormat.is(model.sourceData)
            ? model.sourceData.data.db.entity_poly
            : undefined;
        for (let i = 0; entityPoly && i < entityPoly.entity_id.rowCount; i++) {
            byEntity.set(entityPoly.entity_id.value(i), entityPoly.pdbx_seq_one_letter_code_can.value(i).replaceAll(/\s/g, ''));
        }
        canonicalByModel.set(model, byEntity);
    }
    return byEntity;
}
// Mol* codes a modified residue (MSE, TPO) as X; the mmCIF canonical sequence
// names its parent, which is where the alignment strip's letters come from.
// A nucleotide codes as X too, and its canonical letters are amino-acid
// letters, so only a protein entity is looked up.
function oneLetterCode(l) {
    const code = getProteinOneLetterCode(StructureProperties.atom.label_comp_id(l));
    if (code !== 'X') {
        return code;
    }
    const { model } = l.unit;
    const entityId = StructureProperties.chain.label_entity_id(l);
    const sequence = model.sequence.byEntityKey[model.entities.getEntityIndex(entityId)]
        ?.sequence;
    const canonical = canonicalSequences(model).get(entityId);
    return sequence?.kind === Sequence.Kind.Protein &&
        canonical?.length === sequence.length
        ? (canonical[sequence.index(StructureProperties.residue.label_seq_id(l))] ??
            code)
        : code;
}
function scoreColor(score) {
    const [r, g, b] = hydrophobicityRgb(score);
    return Color.fromRgb(r, g, b);
}
// Mol*'s own `hydrophobicity` theme is Wimley-White with the opposite colour
// direction, so the 3D view and the alignment strip disagreed under one label.
function KyteDoolittleColorTheme(ctx, props) {
    const atomicLocation = atomicLocationReader(ctx.structure);
    return {
        factory: KyteDoolittleColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color: location => {
            const l = atomicLocation(location);
            const score = l ? kyteDoolittle(oneLetterCode(l)) : undefined;
            return score === undefined ? NON_AMINO_ACID_COLOR : scoreColor(score);
        },
        props,
        description: 'Colors amino acids by Kyte-Doolittle hydropathy: hydrophobic orange, hydrophilic blue. Everything else is grey.',
        legend: ScaleLegend('Hydrophilic', 'Hydrophobic', HYDROPHOBICITY_KEY_SCORES.map(score => scoreColor(score))),
    };
}
export const KyteDoolittleColorThemeProvider = {
    name: 'kyte-doolittle',
    label: 'Hydrophobicity (Kyte-Doolittle)',
    category: ColorThemeCategory.Residue,
    factory: KyteDoolittleColorTheme,
    getParams: () => KyteDoolittleColorThemeParams,
    defaultValues: PD.getDefaultValues(KyteDoolittleColorThemeParams),
    isApplicable: ctx => !!ctx.structure,
};
