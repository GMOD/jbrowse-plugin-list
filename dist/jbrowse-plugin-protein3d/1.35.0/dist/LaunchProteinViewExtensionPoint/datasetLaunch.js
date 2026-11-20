import { isRecord, isString } from './normalizeLaunch';
import { hostPluginManager, loadStructureMapping, readStructureDatasets, structuresFor, } from '../LaunchProteinView/utils/structureDatasets';
function namesDataset(entry) {
    return isRecord(entry) && entry.datasetId !== undefined;
}
/**
 * A launch's `datasetId`, on the launch or on an entry of `structures`, as the
 * url and UniProt accession the config's dataset lists for the launch's
 * `transcriptId`, else its `gene`. A launch naming no dataset is returned as
 * it came, without reading the config.
 */
export async function resolveDatasetStructures(session, given) {
    const launch = isRecord(given) ? given : {};
    const structures = Array.isArray(launch.structures) ? launch.structures : [];
    if (!namesDataset(launch) && !structures.some(namesDataset)) {
        return launch;
    }
    const ids = [launch.transcriptId, launch.gene].filter(isString);
    const datasets = readStructureDatasets(session.jbrowse);
    const pluginManager = hostPluginManager(session.jbrowse);
    async function sourceFrom(entry, at) {
        const { datasetId, ...rest } = entry;
        const dataset = datasets.find(d => d.datasetId === datasetId);
        if (!isString(datasetId) || !dataset) {
            throw new Error(`${at}datasetId ${JSON.stringify(datasetId)} names no dataset in the config's protein3d.datasets${datasets.length > 0 ? ` (${datasets.map(d => d.datasetId).join(', ')})` : ''}`);
        }
        if (ids.length === 0) {
            throw new Error(`${at}datasetId looks its structure up by the launch's \`transcriptId\` or \`gene\`, and the launch names neither`);
        }
        const mapping = await loadStructureMapping(dataset, pluginManager);
        const [structure] = ids.flatMap(id => structuresFor(mapping, id));
        if (!structure) {
            throw new Error(`${dataset.name} lists no structure under ${ids.join(' or ')}`);
        }
        return {
            ...rest,
            url: structure.url,
            uniprotId: isString(rest.uniprotId)
                ? rest.uniprotId
                : structure.uniprotId,
        };
    }
    const resolvedStructures = await Promise.all(structures.map((entry, i) => isRecord(entry) && namesDataset(entry)
        ? sourceFrom(entry, `structures[${i}].`)
        : entry));
    const top = namesDataset(launch) ? await sourceFrom(launch, '') : launch;
    return Array.isArray(launch.structures)
        ? { ...top, structures: resolvedStructures }
        : top;
}
