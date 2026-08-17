import { isBinaryStructureUrl, structureFormatFromName, } from './structureFormat';
import { applyStructurePreset } from './structurePipeline';
/** Format and binary-ness default to what the URL's extension says, so a
 * `.pdb`/`.ent` archive URL loads rather than throwing in the mmCIF parser. */
export async function addStructureFromURL({ url, format = structureFormatFromName(url), isBinary = isBinaryStructureUrl(url), options, plugin, }) {
    const data = await plugin.builders.data.download({
        url,
        isBinary,
    }, {
        state: {
            isGhost: true,
        },
    });
    const trajectory = await plugin.builders.structure.parseTrajectory(data, format);
    return applyStructurePreset({ plugin, trajectory, options });
}
