import RpcMethodTypeWithFiltersAndRenameRegions from '@jbrowse/core/pluggableElementTypes/RpcMethodTypeWithFiltersAndRenameRegions';
import type { Sample } from '../types';
import type { AnyConfigurationModel } from '@jbrowse/core/configuration';
import type { Region } from '@jbrowse/core/util';
export default class MafGetSequences extends RpcMethodTypeWithFiltersAndRenameRegions {
    name: string;
    execute(args: {
        adapterConfig: AnyConfigurationModel;
        samples: Sample[];
        stopToken?: string;
        sessionId: string;
        headers?: Record<string, string>;
        regions: Region[];
        showAllLetters: boolean;
        includeInsertions?: boolean;
    }, rpcDriverClassName: string): Promise<string[]>;
}
