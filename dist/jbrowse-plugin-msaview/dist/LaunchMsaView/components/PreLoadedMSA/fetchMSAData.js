import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache';
async function getMsaAdapter(pluginManager, config) {
    const result = await getAdapter(pluginManager, 'msa', config);
    return result.dataAdapter;
}
export async function fetchMSAList({ config, pluginManager, }) {
    const adapter = await getMsaAdapter(pluginManager, config);
    return adapter.getMSAList();
}
export async function fetchMSA({ config, pluginManager, msaId, }) {
    const adapter = await getMsaAdapter(pluginManager, config);
    return adapter.getMSA(msaId);
}
//# sourceMappingURL=fetchMSAData.js.map