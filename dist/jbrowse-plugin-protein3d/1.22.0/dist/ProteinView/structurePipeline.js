import { isBinaryStructureUrl, structureFormatFromContent, structureFormatFromName, } from 'p2s_mapper';
import loadMolstar from './loadMolstar';
// Typed as always resolving to a trajectory, but Mol* reverts a parse that
// fails and resolves with nothing
function parseTrajectory(plugin, raw, format) {
    return plugin.builders.structure.parseTrajectory(raw, format);
}
/** Download or ingest a structure and parse it into a trajectory, with the
 * format sniffed from the content or the url.
 * Needs no renderer, so a headless plugin can run it to read sequences.
 *
 * A parse that fails resolves with no trajectory, and a file read with the
 * wrong parser can yield one with no frames. Both used to reach the user as
 * `Cannot read properties of undefined` from a later call, so they are named
 * here, parser included. */
export async function parseStructureTrajectory({ plugin, data, url, }) {
    let raw;
    let parsedAs;
    if (data !== undefined) {
        parsedAs = structureFormatFromContent(data);
        raw = await plugin.builders.data.rawData({ data }, { state: { isGhost: true } });
    }
    else if (url !== undefined) {
        parsedAs = structureFormatFromName(url);
        raw = await plugin.builders.data.download({ url, isBinary: isBinaryStructureUrl(url) }, { state: { isGhost: true } });
    }
    else {
        throw new Error('a structure needs either data or a url');
    }
    const trajectory = await parseTrajectory(plugin, raw, parsedAs);
    if (!trajectory?.obj?.data.frameCount) {
        throw new Error(`No model could be read from ${url ?? 'the structure data'} as ${parsedAs}`);
    }
    return trajectory;
}
/** The `assembly` value that builds the deposited model, every chain the file
 * holds, rather than one of the entry's biological assemblies. */
export const DEPOSITED_MODEL = 'deposited';
function rootStructure(assembly) {
    return assembly === undefined
        ? undefined
        : assembly === DEPOSITED_MODEL
            ? { name: 'model', params: {} }
            : { name: 'assembly', params: { id: assembly } };
}
// The 'all-models' preset hands back { model, structure } through the default
// preset for a single-model trajectory, { models, structures } for an
// ensemble, and {} if the trajectory vanished.
function presetOutput(preset) {
    return preset && 'structure' in preset
        ? { models: [preset.model], structures: [preset.structure] }
        : { models: preset?.models ?? [], structures: preset?.structures ?? [] };
}
/**
 * Drop the preset's water component. A crystal's ordered waters draw as a
 * cloud of dots over the cartoon and every highlight, and nothing the view
 * shows reads them.
 */
async function removeWater(plugin, structures) {
    const { StateSelection, StateTransforms } = await loadMolstar();
    const update = plugin.state.data.build();
    for (const { ref } of structures) {
        for (const cell of plugin.state.data.select(StateSelection.Generators.byRef(ref)
            .subtree()
            .withTransformer(StateTransforms.Model.StructureComponent))) {
            const { type } = cell.transform.params ?? {};
            if (type?.name === 'static' && type.params === 'water') {
                update.delete(cell.transform.ref);
            }
        }
    }
    await update.commit();
}
/**
 * Build the trajectory's models, structures and representations. One load is
 * one Mol* structure per model, so an NMR ensemble is twenty of them, and the
 * load returns every one: a color, a highlight or a superposition that
 * addresses only the first leaves the other nineteen behind. They come from
 * the preset rather than `hierarchy.current.structures`, which also holds every
 * other load's.
 *
 * A single-model file falls through to Mol*'s default preset, which takes the
 * `structure` param: absent, it builds the first assembly. An ensemble builds
 * each model whole and ignores it.
 */
async function applyStructurePreset(plugin, trajectory, source, assembly) {
    const params = { useDefaultIfSingleModel: true, structure: rootStructure(assembly) };
    const preset = await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'all-models', params);
    const { models, structures } = presetOutput(preset);
    await removeWater(plugin, structures);
    const loaded = structures.flatMap(s => (s.obj ? [s.obj.data] : []));
    if (loaded.length === 0) {
        throw new Error(`No structure could be built from ${source} by Mol*'s all-models preset`);
    }
    return {
        model: models[0],
        structures: loaded,
        modelIds: loaded.flatMap(s => s.models.map(m => m.id)),
    };
}
/** Load a structure from its text or its url, as the view shows one. */
export async function loadStructure({ plugin, data, url, assembly, }) {
    const trajectory = await parseStructureTrajectory({ plugin, data, url });
    return applyStructurePreset(plugin, trajectory, url ?? 'the structure data', assembly);
}
