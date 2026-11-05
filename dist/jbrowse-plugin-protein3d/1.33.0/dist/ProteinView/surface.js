import loadMolstar from './loadMolstar';
import { serialPerPlugin } from './serialPerPlugin';
import { drawnUnder, structureRootCell } from './structureCells';
import { DRAWN_CHAINS_POLYMER } from './structurePipeline';
export const SURFACE_TAG = 'jbrowse-surface';
export const DEFAULT_SURFACE_OPACITY = 0.45;
async function drawSurfaces({ plugin, structures, surface, }) {
    const molstar = await loadMolstar();
    const { StateSelection, StateTransforms, createStructureRepresentationParams, } = molstar;
    const alpha = surface?.opacity ?? DEFAULT_SURFACE_OPACITY;
    const update = plugin.state.data.build();
    let changed = false;
    for (const structure of structures) {
        const cell = structureRootCell(plugin, molstar, structure);
        if (!cell) {
            continue;
        }
        const existing = plugin.state.data.select(StateSelection.Generators.byRef(cell.transform.ref)
            .subtree()
            .withTag(SURFACE_TAG));
        const current = existing.filter(c => c.transform.params?.type?.params?.alpha === alpha);
        if (surface && current.length > 0 && current.length === existing.length) {
            continue;
        }
        for (const c of existing) {
            update.delete(c.transform.ref);
            changed = true;
        }
        if (!surface) {
            continue;
        }
        const polymers = plugin.state.data.select(StateSelection.Generators.byRef(cell.transform.ref)
            .subtree()
            .withTransformer(StateTransforms.Model.StructureComponent)
            .filter(c => {
            const { type, label } = c.transform.params ?? {};
            return ((type?.name === 'static' && type.params === 'polymer') ||
                label === DRAWN_CHAINS_POLYMER);
        }));
        for (const polymer of polymers) {
            const data = polymer.obj?.data;
            if (data) {
                update.to(polymer).apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(plugin, data, {
                    type: 'molecular-surface',
                    typeParams: { alpha, quality: 'high' },
                }), drawnUnder(cell, SURFACE_TAG));
                changed = true;
            }
        }
    }
    if (changed) {
        await update.commit();
    }
    return changed;
}
export function syncSurfaces(args) {
    return serialPerPlugin(args.plugin, () => drawSurfaces(args));
}
