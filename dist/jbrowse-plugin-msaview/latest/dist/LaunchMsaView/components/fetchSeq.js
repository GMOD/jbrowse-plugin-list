import { getSequenceAdapterConfig } from '@jbrowse/core/assemblyManager/assembly';
export async function fetchSeq({ start, end, refName, session, assemblyName, signal, }) {
    const { assemblyManager, rpcManager } = session;
    const assembly = await assemblyManager.waitForAssembly(assemblyName);
    if (!assembly) {
        throw new Error('assembly not found');
    }
    const adapterConfig = getSequenceAdapterConfig(assembly);
    if (!adapterConfig) {
        throw new Error(`assembly ${assemblyName} has no sequence adapter`);
    }
    // eslint-disable-next-line no-restricted-syntax -- one transcript's span of reference sequence, and both callers already label the wait ("Translating transcript", "Looking up …")
    const feats = await rpcManager.call('getSequence', 'CoreGetFeatures', {
        adapterConfig,
        signal,
        regions: [
            {
                start,
                end,
                refName: assembly.getCanonicalRefName(refName) ?? refName,
                assemblyName,
            },
        ],
    });
    return {
        seq: feats[0]?.get('seq') ?? '',
        // travels with the sequence because the caller needs both to translate, and
        // resolving the assembly twice to get them is the shape that lost it
        assemblyGeneticCodeId: assembly.getGeneticCodeId(refName),
    };
}
