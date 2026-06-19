import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache';
import RpcMethodTypeWithFiltersAndRenameRegions from '@jbrowse/core/pluggableElementTypes/RpcMethodTypeWithFiltersAndRenameRegions';
export default class MafGetSamples extends RpcMethodTypeWithFiltersAndRenameRegions {
    name = 'MafGetSamples';
    async execute(args, rpcDriverClassName) {
        const pm = this.pluginManager;
        const deserializedArgs = await this.deserializeArguments(args, rpcDriverClassName);
        const { regions, adapterConfig, sessionId } = deserializedArgs;
        const { dataAdapter } = await getAdapter(pm, sessionId, adapterConfig);
        // @ts-expect-error
        return dataAdapter.getSamples(regions, deserializedArgs);
    }
}
//# sourceMappingURL=MafGetSamples.js.map