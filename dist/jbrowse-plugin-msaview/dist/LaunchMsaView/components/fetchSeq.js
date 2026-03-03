import { getConf } from '@jbrowse/core/configuration';
export async function fetchSeq({ start, end, refName, session, assemblyName, }) {
    const { assemblyManager, rpcManager } = session;
    const assembly = await assemblyManager.waitForAssembly(assemblyName);
    if (!assembly) {
        throw new Error('assembly not found');
    }
    const sessionId = 'getSequence';
    const feats = (await rpcManager.call(sessionId, 'CoreGetFeatures', {
        adapterConfig: getConf(assembly, ['sequence', 'adapter']),
        sessionId,
        regions: [
            {
                start,
                end,
                refName: assembly.getCanonicalRefName(refName),
                assemblyName,
            },
        ],
    }));
    return feats[0]?.get('seq') ?? '';
}
//# sourceMappingURL=fetchSeq.js.map