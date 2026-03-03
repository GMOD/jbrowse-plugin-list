import RpcMethodTypeWithFiltersAndRenameRegions from '@jbrowse/core/pluggableElementTypes/RpcMethodTypeWithFiltersAndRenameRegions';
import type { AnyConfigurationModel } from '@jbrowse/core/configuration';
import type { Region } from '@jbrowse/core/util';
export default class MafGetSamples extends RpcMethodTypeWithFiltersAndRenameRegions {
    name: string;
    execute(args: {
        adapterConfig: AnyConfigurationModel;
        stopToken?: string;
        sessionId: string;
        headers?: Record<string, string>;
        regions: Region[];
        bpPerPx: number;
    }, rpcDriverClassName: string): Promise<any>;
}
