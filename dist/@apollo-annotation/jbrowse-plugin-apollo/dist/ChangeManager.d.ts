import { type Change } from '@apollo-annotation/common';
import type { ClientDataStoreModel } from './session/ClientDataStore';
export interface SubmitOpts {
    /** defaults to true */
    submitToBackend?: boolean;
    /** defaults to true */
    addToRecents?: boolean;
    /** defaults to undefined */
    internetAccountId?: string;
    /** defaults to false */
    updateJobsManager?: boolean;
}
export declare class ChangeManager {
    private dataStore;
    constructor(dataStore: ClientDataStoreModel);
    recentChanges: Change[];
    undoneChanges: Change[];
    submit(change: Change, opts?: SubmitOpts): Promise<void>;
    undo(change: Change, submitToBackend?: boolean): Promise<void>;
    redo(change: Change, submitToBackend?: boolean): Promise<void>;
    undoLastChange(): Promise<void>;
    redoLastChange(): Promise<void>;
}
//# sourceMappingURL=ChangeManager.d.ts.map