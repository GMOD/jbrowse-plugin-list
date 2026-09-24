import { getConfigUrls } from './configUrls';
// jb2hubs' defaultGeneTrackId order, which also picks the track minimal.json
// keeps and a hub genome's default session opens
const GENE_TRACK_SUFFIXES = [
    'ncbiRefSeq',
    'ncbiRefSeqCurated',
    'ncbiGene',
    'refGene',
    'ensGene',
    'augustusGene',
    'xenoRefGene',
];
function withAbsoluteUris(value, base) {
    if (Array.isArray(value)) {
        return value.map(item => withAbsoluteUris(item, base));
    }
    if (typeof value === 'object' && value !== null) {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [
            key,
            key === 'uri' && typeof item === 'string'
                ? new URL(item, base).href
                : withAbsoluteUris(item, base),
        ]));
    }
    return value;
}
export function describeFromConfig(config, assemblyName, configUrl) {
    const assembly = config.assemblies?.find(a => a.name === assemblyName || a.aliases?.includes(assemblyName));
    if (!assembly) {
        return undefined;
    }
    const tracks = new Map(config.tracks?.map(track => [track.trackId, track]));
    const geneAdapter = GENE_TRACK_SUFFIXES.map(suffix => tracks.get(`${assembly.name}-${suffix}`)?.adapter).find(adapter => adapter !== undefined);
    return {
        displayName: assembly.displayName,
        geneAdapter: geneAdapter && withAbsoluteUris(geneAdapter, configUrl),
        refNameAliases: assembly.refNameAliases &&
            withAbsoluteUris(assembly.refNameAliases, configUrl),
    };
}
// throws on anything but a found config or a 404, so only a definitive
// answer is cached
async function fetchDescription(assemblyName) {
    for (const url of getConfigUrls(assemblyName)) {
        const response = await fetch(url);
        if (response.ok) {
            const config = (await response.json());
            return describeFromConfig(config, assemblyName, url);
        }
        if (response.status !== 404) {
            throw new Error(`${url}: HTTP ${response.status}`);
        }
    }
    return undefined;
}
const descriptions = new Map();
function describe(assemblyName) {
    let description = descriptions.get(assemblyName);
    if (!description) {
        description = fetchDescription(assemblyName).catch((error) => {
            descriptions.delete(assemblyName);
            console.error(error);
            return undefined;
        });
        descriptions.set(assemblyName, description);
    }
    return description;
}
/**
 * Core-describeAssemblies: what the hosted config of each named genome says
 * of it, read without connecting it. A name another plugin already described,
 * or one no hosted config could hold, is left alone
 */
export async function describeAssemblies(described, assemblyNames) {
    const before = typeof described === 'object' && described !== null ? described : {};
    const names = Array.isArray(assemblyNames)
        ? assemblyNames.filter((name) => typeof name === 'string')
        : [];
    const answers = await Promise.all(names
        .filter(name => !Object.hasOwn(before, name) && getConfigUrls(name).length > 0)
        .map(async (name) => [name, await describe(name)]));
    return {
        ...before,
        ...Object.fromEntries(answers.filter(([, description]) => description !== undefined)),
    };
}
//# sourceMappingURL=describeAssemblies.js.map