import { addRelativeUris } from '@jbrowse/core/util/addRelativeUris';
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
export function hostedAssemblyFromConfig(config, assemblyName, configUrl) {
    const assembly = config.assemblies?.find(a => a.name === assemblyName || a.aliases?.includes(assemblyName));
    const tracks = new Map(config.tracks?.map(track => [track.trackId, track]));
    return assembly
        ? {
            configUrl,
            assembly,
            geneAdapter: GENE_TRACK_SUFFIXES.map(suffix => tracks.get(`${assembly.name}-${suffix}`)?.adapter).find(adapter => adapter !== undefined),
        }
        : undefined;
}
// throws on anything but a found config or a 404, so only a definitive
// answer is cached
async function fetchHostedAssembly(assemblyName) {
    for (const url of getConfigUrls(assemblyName)) {
        const response = await fetch(url);
        if (response.ok) {
            const config = await response.json();
            addRelativeUris(config, new URL(url));
            return hostedAssemblyFromConfig(config, assemblyName, url);
        }
        if (response.status !== 404) {
            throw new Error(`${url}: HTTP ${response.status}`);
        }
    }
    return undefined;
}
const lookups = new Map();
export function findHostedAssembly(assemblyName) {
    let lookup = lookups.get(assemblyName);
    if (!lookup) {
        lookup = fetchHostedAssembly(assemblyName).catch((error) => {
            lookups.delete(assemblyName);
            console.error(error);
            return undefined;
        });
        lookups.set(assemblyName, lookup);
    }
    return lookup;
}
//# sourceMappingURL=hostedAssembly.js.map