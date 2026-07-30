import { applyStructurePreset } from './structurePipeline';
export async function addStructureFromData({ data, format = 'pdb', options, plugin, }) {
    const _data = await plugin.builders.data.rawData({
        data,
        label: options?.dataLabel,
    });
    const trajectory = await plugin.builders.structure.parseTrajectory(_data, format);
    return applyStructurePreset({ plugin, trajectory, options });
}
