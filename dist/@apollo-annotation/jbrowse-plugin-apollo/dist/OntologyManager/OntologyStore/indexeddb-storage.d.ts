import { type IDBPDatabase } from 'idb/with-async-ittr';
import { type OntologyDB } from './indexeddb-schema';
import type OntologyStore from '.';
export type Database = IDBPDatabase<OntologyDB>;
/** open the IndexedDB and create the DB schema if necessary */
export declare function openDatabase(this: OntologyStore, dbName: string): Promise<IDBPDatabase<OntologyDB>>;
/** load a OBO Graph JSON file into a database */
export declare function loadOboGraphJson(this: OntologyStore, db: Database): Promise<void>;
export declare function getTextIndexFields(this: OntologyStore): import("..").TextIndexFieldDefinition[];
export declare function isDatabaseCurrent(this: OntologyStore, db: Database): Promise<boolean>;
//# sourceMappingURL=indexeddb-storage.d.ts.map