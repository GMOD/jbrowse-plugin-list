import { type IDBPDatabase } from 'idb/with-async-ittr';
export type FeatureDatabase = IDBPDatabase;
export declare function openDb(assemblyName: string, refNames: string[]): Promise<FeatureDatabase>;
//# sourceMappingURL=db.d.ts.map