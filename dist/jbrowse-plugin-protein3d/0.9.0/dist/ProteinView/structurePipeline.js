function presetStructure(preset) {
    const selector = preset && 'structure' in preset ? preset.structure : preset?.structures?.[0];
    return selector?.obj?.data;
}
export async function applyStructurePreset({ plugin, trajectory, options, }) {
    const model = await plugin.builders.structure.createModel(trajectory);
    const preset = await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'all-models', {
        useDefaultIfSingleModel: true,
        representationPresetParams: options?.representationParams,
    });
    return { model, structure: presetStructure(preset) };
}
