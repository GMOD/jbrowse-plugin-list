import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache';
import RpcMethodTypeWithFiltersAndRenameRegions from '@jbrowse/core/pluggableElementTypes/RpcMethodTypeWithFiltersAndRenameRegions';
import { firstValueFrom, toArray } from 'rxjs';
import { processFeaturesToFasta } from '../util/fastaUtils';
export default class MafGetSequences extends RpcMethodTypeWithFiltersAndRenameRegions {
    name = 'MafGetSequences';
    async execute(args, rpcDriverClassName) {
        const deserializedArgs = await this.deserializeArguments(args, rpcDriverClassName);
        const { samples, regions, adapterConfig, sessionId, showAllLetters, includeInsertions, } = deserializedArgs;
        const dataAdapter = (await getAdapter(this.pluginManager, sessionId, adapterConfig)).dataAdapter;
        const features = await firstValueFrom(dataAdapter.getFeatures(regions[0], deserializedArgs).pipe(toArray()));
        return processFeaturesToFasta({
            features: new Map(features.map(f => [f.id(), f])),
            samples,
            regions,
            showAllLetters,
            includeInsertions,
        });
    }
}
//# sourceMappingURL=MafGetSequences.js.map