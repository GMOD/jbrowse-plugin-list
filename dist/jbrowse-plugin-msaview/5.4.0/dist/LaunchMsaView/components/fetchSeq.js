import { getConf } from '@jbrowse/core/configuration';
export async function fetchSeq({ start, end, refName, session, assemblyName, }) {
    const { assemblyManager, rpcManager } = session;
    const assembly = await assemblyManager.waitForAssembly(assemblyName);
    if (!assembly) {
        throw new Error('assembly not found');
    }
    const feats = await rpcManager.call('getSequence', 'CoreGetFeatures', {
        adapterConfig: getConf(assembly, ['sequence', 'adapter']),
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
