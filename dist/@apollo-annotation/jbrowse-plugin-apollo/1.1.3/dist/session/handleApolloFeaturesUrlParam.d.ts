import type { AbstractSessionModel } from '@jbrowse/core/util';
import type { ClientDataStoreModel } from './ClientDataStore';
export declare function toUrlSafeBase64(base64: string): string;
export declare function fromUrlSafeBase64(urlSafeBase64: string): string;
export declare function compress(data: unknown): Promise<string>;
export declare function decompress(encoded: string): Promise<unknown>;
export declare function handleApolloFeaturesUrlParam(encodedFeatures: string, apolloDataStore: ClientDataStoreModel, assemblyManager: AbstractSessionModel['assemblyManager'], session: AbstractSessionModel): Promise<void>;
//# sourceMappingURL=handleApolloFeaturesUrlParam.d.ts.map