import { EMPTY_DOMAIN_COLOR, domainMarkOf } from './alignmentDomains';
import { SITES_TAG } from './alignmentSites';
import loadMolstar from './loadMolstar';
import { molstarThemeOf, resolvedColor } from './proteinColor';
import { RESIDUE_MARKS_TAG } from './residueMarks';
import { SESSION_HIGHLIGHTS_TAG } from './sessionHighlights';
import { structureRootCell } from './structureCells';
import { VARIANT_EFFECT_SCHEMES } from './variantEffects';
/**
 * The themes that color by values placed on each structure's residues, which
 * they read from a registry (see placedValueRegistry)
 */
export const PLACED_VALUE_SCHEMES = [
    ...VARIANT_EFFECT_SCHEMES,
    'alignment-domains',
    'residue-values',
];
function isPlacedValueScheme(theme) {
    return PLACED_VALUE_SCHEMES.some(s => s === theme);
}
function themeParams(color, { entityId, domainColor, revision, representationType = '', }) {
    const scale = resolvedColor(color);
    return color.field === 'mappedChain'
        ? { entityId: entityId ?? '' }
        : color.field === 'domain'
            ? {
                revision,
                color: domainColor ?? EMPTY_DOMAIN_COLOR,
                mark: domainMarkOf(representationType),
            }
            : scale && isPlacedValueScheme(molstarThemeOf(color))
                ? { revision, color: scale }
                : scale && { color: scale };
}
let revision = 0;
/**
 * Recolor every representation of every structure in one Mol* state update.
 * The representations are found in the live state tree rather than through
 * `updateRepresentationsTheme`, whose components come from the hierarchy
 * snapshot (see structureRootCell). The non-ghost ones are what that call
 * reached: each component's, the focus representation's included. The
 * alignment sites' sticks keep their own theme (see alignmentSites).
 *
 * A placed-value theme's values reach it through the registry it reads (see
 * placedValueRegistry), registered for each structure before the update; a
 * structure without values is drawn grey.
 */
export async function applyColorTheme({ plugin, color, structures, }) {
    const molstar = await loadMolstar();
    const { StateSelection, StateTransforms, createStructureColorThemeParams, registerPlacedValues, } = molstar;
    const theme = molstarThemeOf(color);
    const placed = isPlacedValueScheme(theme);
    if (placed) {
        revision++;
    }
    const update = plugin.state.data.build();
    let recolored = 0;
    for (const { molstarStructure, entityId, placedValues, placedSites, domainColor, } of structures) {
        if (placed) {
            registerPlacedValues(theme, molstarStructure, placedValues);
        }
        if (color.field === 'domain') {
            registerPlacedValues('alignment-sites', molstarStructure, placedSites);
        }
        const cell = structureRootCell(plugin, molstar, molstarStructure);
        const representations = cell
            ? plugin.state.data.select(StateSelection.Generators.ofTransformer(StateTransforms.Representation.StructureRepresentation3D, cell.transform.ref))
            : [];
        for (const representation of representations) {
            if (!representation.state.isGhost &&
                !representation.transform.tags?.includes(SITES_TAG) &&
                !representation.transform.tags?.includes(SESSION_HIGHLIGHTS_TAG) &&
                !representation.transform.tags?.includes(RESIDUE_MARKS_TAG)) {
                update.to(representation).update(prev => {
                    prev.colorTheme = createStructureColorThemeParams(plugin, molstarStructure, prev.type.name, theme, themeParams(color, {
                        entityId,
                        domainColor,
                        revision,
                        representationType: prev.type.name,
                    }));
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
 * The key Mol* itself would show for a color, which its viewport never draws
 * and its hidden-by-default controls panel buries. Built on one structure, so a
 * data-dependent table (chain ids) names that structure's entries.
 */
export function colorLegendOf({ plugin, color, structure, entityId, domainColor, }) {
    const theme = molstarThemeOf(color);
    return theme === undefined
        ? undefined
        : plugin.representation.structure.themes.colorThemeRegistry.create(theme, { structure }, themeParams(color, { entityId, domainColor }) ?? {}).legend;
}
