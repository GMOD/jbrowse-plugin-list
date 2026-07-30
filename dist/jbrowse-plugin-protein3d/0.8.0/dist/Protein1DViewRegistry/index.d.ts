import type { SimpleFeatureSerialized } from '@jbrowse/core/util';
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
    get(viewId: string): Protein1DViewInfo | undefined;
    /**
     * Pure lookup. When a session is supplied, entries whose view has since been
     * closed are skipped rather than deleted, so this stays side-effect-free and
     * safe to call from an observer's render (mutating the observable map there
     * would be a MobX anti-pattern).
     */
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
