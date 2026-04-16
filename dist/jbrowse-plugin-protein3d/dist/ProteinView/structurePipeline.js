export async function applyStructurePreset({ plugin, trajectory, options, }) {
    const model = await plugin.builders.structure.createModel(trajectory);
    await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'all-models', {
        useDefaultIfSingleModel: true,
        representationPresetParams: options?.representationParams,
    });
    return { model };
}
//# sourceMappingURL=structurePipeline.js.map