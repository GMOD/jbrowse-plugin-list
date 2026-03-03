export async function addStructureFromData({ data, format = 'pdb', options, plugin, }) {
    const _data = await plugin.builders.data.rawData({
        data,
        label: options?.dataLabel,
    });
    const trajectory = await plugin.builders.structure.parseTrajectory(_data, format);
    const model = await plugin.builders.structure.createModel(trajectory);
    await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'all-models', {
        useDefaultIfSingleModel: true,
        representationPresetParams: options?.representationParams,
    });
    return { model };
}
//# sourceMappingURL=addStructureFromData.js.map