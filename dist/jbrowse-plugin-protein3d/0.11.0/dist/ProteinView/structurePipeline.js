import { isBinaryStructureUrl, structureFormatFromContent, structureFormatFromName, } from './structureFormat';
/** Download or ingest a structure and parse it into a trajectory, with the
 * format sniffed from the content or the url unless the caller says otherwise.
 * Needs no renderer, so a headless plugin can run it to read sequences. */
export async function parseStructureTrajectory({ plugin, data, url, format, dataLabel, }) {
    if (data !== undefined) {
        const raw = await plugin.builders.data.rawData({ data, label: dataLabel });
        return plugin.builders.structure.parseTrajectory(raw, format ?? structureFormatFromContent(data));
    }
    if (url === undefined) {
        throw new Error('a structure needs either data or a url');
    }
    const downloaded = await plugin.builders.data.download({ url, isBinary: isBinaryStructureUrl(url) }, { state: { isGhost: true } });
    return plugin.builders.structure.parseTrajectory(downloaded, format ?? structureFormatFromName(url));
}
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
