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
    const model = await plugin.builders.structure.createModel(trajectory);
    await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'all-models', {
        useDefaultIfSingleModel: true,
        representationPresetParams: options?.representationParams,
    });
    return { model };
}
//# sourceMappingURL=addStructureFromURL.js.map