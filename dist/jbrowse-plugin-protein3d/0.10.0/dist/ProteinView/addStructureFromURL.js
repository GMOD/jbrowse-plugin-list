import { applyStructurePreset, parseStructureTrajectory, } from './structurePipeline';
/** Format defaults to what the URL's extension says, so a `.pdb`/`.ent`
 * archive URL loads rather than throwing in the mmCIF parser. */
export async function addStructureFromURL({ url, format, options, plugin, }) {
    const trajectory = await parseStructureTrajectory({ plugin, url, format });
    return applyStructurePreset({ plugin, trajectory, options });
}
