import { applyStructurePreset } from './structurePipeline';
export async function addStructureFromURL({ url, format = 'mmcif', isBinary, options, plugin, }) {
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
//# sourceMappingURL=addStructureFromURL.js.map