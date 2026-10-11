import loadMolstar from './loadMolstar';
import { structureRootCell } from './structureCells';
import { isVariantEffectScheme } from './variantEffects';
/**
 * Color schemes offered in the protein view menu. A `value` is persisted in
 * sessions, so it names the scheme rather than the Mol* theme; `theme`, where
 * given, is the Mol* color-theme that draws it. `plddt-confidence` comes from
 * the MAQualityAssessment behavior, `mapped-chain`, `kyte-doolittle`,
 * `alphamissense` and `clinvar` from registerColorThemes, the rest are built
 * in.
 */
export const COLOR_SCHEMES = [
    { value: 'default', label: 'Default (element/chain)' },
    { value: 'plddt-confidence', label: 'pLDDT confidence (AlphaFold)' },
    { value: 'chain-id', label: 'Chain' },
    { value: 'secondary-structure', label: 'Secondary structure' },
    {
        value: 'hydrophobicity',
        label: 'Hydrophobicity (Kyte-Doolittle)',
        theme: 'kyte-doolittle',
    },
    { value: 'residue-name', label: 'Residue type' },
    { value: 'uncertainty', label: 'B-factor / uncertainty' },
    { value: 'molecule-type', label: 'Molecule type' },
    { value: 'mapped-chain', label: 'Mapped chain' },
    { value: 'alphamissense', label: 'AlphaMissense pathogenicity' },
    { value: 'clinvar', label: 'ClinVar pathogenic variants' },
];
export const COLOR_SCHEME_VALUES = COLOR_SCHEMES.map(s => s.value);
/** An untrusted scheme name (a URL session-spec param) into the union. */
export function coerceColorScheme(value) {
    return COLOR_SCHEME_VALUES.find(v => v === value) ?? 'default';
}
export function molstarThemeName(colorScheme) {
    const scheme = COLOR_SCHEMES.find(s => s.value === colorScheme);
    return scheme && 'theme' in scheme ? scheme.theme : colorScheme;
}
let revision = 0;
/**
 * Recolor every representation of every structure in one Mol* state update.
 * The representations are found in the live state tree rather than through
 * `updateRepresentationsTheme`, whose components come from the hierarchy
 * snapshot (see structureRootCell). The non-ghost ones are what that call
 * reached: each component's, the focus representation's included.
 *
 * A variant-effect scheme's values reach its theme through the registry its
 * theme reads (see variantEffectColorTheme), registered for each structure
 * before the update; a structure without values is drawn grey.
 */
export async function applyColorTheme({ plugin, colorScheme, structures, }) {
    const molstar = await loadMolstar();
    const { StateSelection, StateTransforms, createStructureColorThemeParams, registerPlacedValues, } = molstar;
    const theme = colorScheme === 'default' ? undefined : molstarThemeName(colorScheme);
    const variantEffects = isVariantEffectScheme(colorScheme);
    if (variantEffects) {
        revision++;
    }
    const update = plugin.state.data.build();
    let recolored = 0;
    for (const { molstarStructure, entityId, placedValues } of structures) {
        if (variantEffects) {
            registerPlacedValues(colorScheme, molstarStructure, placedValues);
        }
        const cell = structureRootCell(plugin, molstar, molstarStructure);
        const representations = cell
            ? plugin.state.data.select(StateSelection.Generators.ofTransformer(StateTransforms.Representation.StructureRepresentation3D, cell.transform.ref))
            : [];
        const params = colorScheme === 'mapped-chain'
            ? { entityId: entityId ?? '' }
            : variantEffects
                ? { revision }
                : undefined;
        for (const representation of representations) {
            if (!representation.state.isGhost) {
                update.to(representation).update(prev => {
                    prev.colorTheme = createStructureColorThemeParams(plugin, molstarStructure, prev.type.name, theme, params);
                });
                recolored++;
            }
        }
    }
    if (recolored > 0) {
        await update.commit();
    }
}
/**
 * The key Mol* itself would show for a scheme, which its viewport never draws
 * and its hidden-by-default controls panel buries. Built on one structure, so a
 * data-dependent table (chain ids) names that structure's entries.
 */
export function colorSchemeLegend({ plugin, colorScheme, structure, entityId, }) {
    return colorScheme === 'default'
        ? undefined
        : plugin.representation.structure.themes.colorThemeRegistry.create(molstarThemeName(colorScheme), { structure }, colorScheme === 'mapped-chain' ? { entityId: entityId ?? '' } : {}).legend;
}
