import { SimpleFeatureSerialized } from '@jbrowse/core/util';
export interface Protein1DViewInfo {
    viewId: string;
    connectedViewId: string;
    feature: SimpleFeatureSerialized;
    uniprotId: string;
}
interface SessionWithViews {
    views: {
        id: string;
    }[];
}
declare class Protein1DViewRegistry {
    views: import("mobx").ObservableMap<string, Protein1DViewInfo>;
    constructor();
    register(info: Protein1DViewInfo): void;
    unregister(viewId: string): void;
    cleanupStaleViews(session: SessionWithViews): void;
    get(viewId: string): Protein1DViewInfo | undefined;
    getByUniprotId(uniprotId: string, session?: SessionWithViews): Protein1DViewInfo | undefined;
    get entries(): Protein1DViewInfo[];
    getGenomeHighlightForProteinPosition(uniprotId: string, proteinPos: number, session?: SessionWithViews): {
        refName: string;
        start: number;
        end: number;
    } | undefined;
}
export declare const protein1DViewRegistry: Protein1DViewRegistry;
export {};
