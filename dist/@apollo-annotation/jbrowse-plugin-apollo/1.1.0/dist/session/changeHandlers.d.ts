import { type localChanges } from '@apollo-annotation/shared';
import type { ClientDataStoreModel } from './ClientDataStore';
type ChangeHandlers = {
    [K in keyof typeof localChanges]: (dataStore: ClientDataStoreModel, change: InstanceType<(typeof localChanges)[K]>) => Promise<void>;
};
export declare function isLocalChange(changeName: string): changeName is keyof typeof localChanges;
export declare const changeHandlers: ChangeHandlers;
export {};
//# sourceMappingURL=changeHandlers.d.ts.map