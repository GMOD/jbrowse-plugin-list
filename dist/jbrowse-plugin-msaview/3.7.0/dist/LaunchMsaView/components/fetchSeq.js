import { getConf } from '@jbrowse/core/configuration';
export async function fetchSeq({ start, end, refName, session, assemblyName, }) {
    const { assemblyManager, rpcManager } = session;
    const assembly = await assemblyManager.waitForAssembly(assemblyName);
    if (!assembly) {
        throw new Error('assembly not found');
    }
    const sessionId = 'getSequence';
    // a named object keeps sessionId, which v4 hosts read from the args
    const args = {
        adapterConfig: getConf(assembly, ['sequence', 'adapter']),
        sessionId,
        regions: [
            {
                start,
                end,
                refName: assembly.getCanonicalRefName(refName) ?? refName,
                assemblyName,
            },
        ],
    };
    const feats = await rpcManager.call(sessionId, 'CoreGetFeatures', args);
    return {
        seq: feats[0]?.get('seq') ?? '',
        // travels with the sequence because the caller needs both to translate, and
        // resolving the assembly twice to get them is the shape that lost it
        assemblyGeneticCodeId: geneticCodeId(assembly, refName),
    };
}
function geneticCodeId(assembly, refName) {
    return assembly.getGeneticCodeId?.(refName);
}
