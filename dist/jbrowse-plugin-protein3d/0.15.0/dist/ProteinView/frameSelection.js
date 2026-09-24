import { residueLoci } from './applyLociInteractivity';
import loadMolstar from './loadMolstar';
/**
 * Every structure loaded and aligned and, with several, superposed: the
 * reset that ends a superposition would undo any framing done before it.
 */
export function structuresSettled(host) {
    const { structures, superposedCount } = host;
    return (structures.length > 0 &&
        structures.every(s => !s.loading) &&
        (structures.length < 2 || superposedCount === structures.length));
}
/**
 * Moves the camera to the residues. A single residue is also focused, which
 * draws it, its neighbours and their contacts as sticks, as clicking it in 3D
 * does; Mol* focuses one structure at a time, so that is the first target's.
 * `stillCurrent` is asked after Mol* loads, so a plugin replaced meanwhile is
 * left alone.
 */
export async function frameResidues(plugin, targets, stillCurrent = () => true) {
    const molstar = await loadMolstar();
    if (stillCurrent()) {
        const loci = targets.map(t => residueLoci(molstar, t));
        plugin.managers.camera.focusLoci(loci);
        if (loci[0] && targets[0]?.labelSeqIds.length === 1) {
            plugin.managers.structure.focus.setFromLoci(loci[0]);
        }
    }
}
/**
 * Builds the body of the autorun that moves the camera to a declared
 * selection. A session "opened on R248" used to show the whole fold with R248
 * out of sight. It waits until every structure has settled and, with several,
 * until they are superposed, because the reset that ends a superposition would
 * undo it; then it frames the seeded residues once per plugin. Only a spec's
 * seed or focusResidues moves the camera: a click is the user's, and the view
 * they chose stays.
 */
export function makeSelectionFramer(host) {
    let framedPlugin;
    return function frameSeededSelection() {
        const { molstarPluginContext: plugin, structures } = host;
        if (!plugin || plugin === framedPlugin || !structuresSettled(host)) {
            return;
        }
        // a seed resolved by the same change that settles the structure may land
        // after this run, so the plugin counts as framed only once it has targets
        const targets = structures.flatMap(s => s.seedLit && s.molstarStructure && s.clickedLabelSeqIds.length
            ? [
                {
                    structure: s.molstarStructure,
                    entityId: s.mappedEntity?.entityId,
                    labelSeqIds: s.clickedLabelSeqIds,
                },
            ]
            : []);
        if (targets.length === 0) {
            return;
        }
        framedPlugin = plugin;
        frameResidues(plugin, targets, () => host.molstarPluginContext === plugin).catch((e) => {
            console.error(e);
        });
    };
}
