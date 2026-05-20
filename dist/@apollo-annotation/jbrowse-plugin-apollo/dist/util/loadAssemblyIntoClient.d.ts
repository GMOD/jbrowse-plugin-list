import { type ClientDataStore } from '@apollo-annotation/common';
import type { ApolloAssemblyI, CheckResultSnapshot } from '@apollo-annotation/mst';
export declare function loadAssemblyIntoClient(assemblyId: string, gff3FileText: string, apolloDataStore: ClientDataStore): Promise<ApolloAssemblyI>;
export declare function checkFeatures(assembly: ApolloAssemblyI): Promise<CheckResultSnapshot[]>;
//# sourceMappingURL=loadAssemblyIntoClient.d.ts.map