import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache';
export async function fetchMSAList({ config, pluginManager, }) {
    const result = await getAdapter(pluginManager, 'msa', config);
    // @ts-expect-error
    return result.dataAdapter.getMSAList();
}
export async function fetchMSA({ config, pluginManager, msaId, }) {
    const result = await getAdapter(pluginManager, 'msa', config);
    // @ts-expect-error
    return result.dataAdapter.getMSA(msaId);
}
//# sourceMappingURL=fetchMSAData.js.map