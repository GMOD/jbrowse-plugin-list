import { BaseAdapter, type BaseRefNameAliasAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type RpcServer from 'librpc-web-mod/dist/server';
import type { RefNameAliases } from './../BackendDrivers/BackendDriver';
declare global {
    const rpcServer: RpcServer;
}
export default class RefNameAliasAdapter extends BaseAdapter implements BaseRefNameAliasAdapter {
    private refNameAliases;
    getRefNameAliases(): Promise<RefNameAliases[]>;
    freeResources(): void;
}
//# sourceMappingURL=ApolloRefNameAliasAdapter.d.ts.map