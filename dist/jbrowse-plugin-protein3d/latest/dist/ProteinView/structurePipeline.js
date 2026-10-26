import { isBinaryStructureUrl, structureFormatFromContent, structureFormatFromName, } from 'p2s_mapper';
import { CRYSTALLIZATION_ADDITIVES } from './crystallizationAdditives';
import loadMolstar from './loadMolstar';
import { removeWithGhosts } from './removeStructure';
import { drawnTests } from './residueFilter';
import { serialPerPlugin } from './serialPerPlugin';
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
        await removeWithGhosts(plugin, await loadMolstar(), raw.ref);
        throw new Error(`No model could be read from ${url ?? 'the structure data'} as ${parsedAs}`);
    }
    return trajectory;
}
/** The label of a polymer component narrowed to part of the structure, which
 * other drawing (the surface) finds it by in place of its static type. */
export const DRAWN_CHAINS_POLYMER = 'Polymer, drawn chains';
function drawsPart({ chains, filter }) {
    return !!chains?.length || !!filter?.length;
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
async function applyStructurePreset(plugin, trajectory, source, assembly, drawn) {
    const params = { useDefaultIfSingleModel: true, structure: rootStructure(assembly) };
    return collectPreset(plugin, source, await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'all-models', params), drawn);
}
/**
 * Narrow the preset's polymer and ligand components to the residues the spec
 * draws. The structure itself stays whole, so mapping, highlights and colors
 * address it as before; only what is drawn shrinks.
 *
 * A `filter` narrows the ligand component too: a bound ligand is numbered in
 * the same author series as the polymer, well above its last residue, so a
 * residue bound leaves the ligand out as well.
 */
async function drawOnlyPart(plugin, structures, drawn) {
    const { MolScriptBuilder: MS, StateSelection, StateTransforms, } = await loadMolstar();
    const { chainTest, residueTest } = drawnTests(MS, drawn);
    const entityTest = (polymer) => polymer
        ? MS.core.rel.eq([MS.ammp('entityType'), 'polymer'])
        : MS.core.logic.and([
            MS.core.rel.neq([MS.ammp('entityType'), 'polymer']),
            MS.core.rel.neq([MS.ammp('entityType'), 'water']),
            MS.core.logic.not([
                MS.core.set.has([
                    MS.set(...CRYSTALLIZATION_ADDITIVES),
                    MS.ammp('label_comp_id'),
                ]),
            ]),
        ]);
    const update = plugin.state.data.build();
    for (const { ref } of structures) {
        for (const cell of plugin.state.data.select(StateSelection.Generators.byRef(ref)
            .subtree()
            .withTransformer(StateTransforms.Model.StructureComponent))) {
            const { type } = cell.transform.params ?? {};
            if (type?.name === 'static') {
                const polymer = type.params === 'polymer';
                update.to(cell).update(prev => ({
                    ...prev,
                    ...(polymer ? { label: DRAWN_CHAINS_POLYMER } : {}),
                    type: {
                        name: 'expression',
                        params: MS.struct.generator.atomGroups({
                            ...(chainTest ? { 'chain-test': chainTest } : {}),
                            ...(residueTest ? { 'residue-test': residueTest } : {}),
                            'entity-test': entityTest(polymer),
                        }),
                    },
                }));
            }
        }
    }
    // a lone rung of a filament has no strand partners, so Mol* draws it as
    // thin coil; drawn thicker it reads at figure size
    for (const { ref } of structures) {
        for (const cell of plugin.state.data.select(StateSelection.Generators.byRef(ref)
            .subtree()
            .withTransformer(StateTransforms.Representation.StructureRepresentation3D))) {
            if (cell.transform.params?.type.name === 'cartoon') {
                update.to(cell).update(prev => ({
                    ...prev,
                    type: {
                        ...prev.type,
                        params: { ...prev.type.params, sizeFactor: 0.45 },
                    },
                }));
            }
        }
    }
    await update.commit();
}
async function collectPreset(plugin, source, preset, drawn) {
    const { models, structures } = presetOutput(preset);
    await removeWater(plugin, structures);
    if (drawsPart(drawn)) {
        await drawOnlyPart(plugin, structures, drawn);
    }
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
/**
 * Load a structure from its text or its url, as the view shows one. A load
 * that fails after parsing takes its trajectory back out, or Mol* would draw a
 * structure no model of the view owns and none can remove.
 */
export function loadStructure({ plugin, data, url, assembly, chains, filter, }) {
    return serialPerPlugin(plugin, async () => {
        const trajectory = await parseStructureTrajectory({ plugin, data, url });
        const source = url ?? 'the structure data';
        try {
            return await applyStructurePreset(plugin, trajectory, source, assembly, {
                chains,
                filter,
            });
        }
        catch (e) {
            // a plugin disposed mid-load fails the removal too, and the load's
            // own error is the one to report
            await removeWithGhosts(plugin, await loadMolstar(), trajectory.ref).catch(() => { });
            throw e;
        }
    });
}
