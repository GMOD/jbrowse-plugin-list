import type { Loci } from 'molstar/lib/mol-model/loci';
import type { Structure } from 'molstar/lib/mol-model/structure';
interface FramedStructure {
    readonly loading: boolean;
    readonly seededSelection: boolean;
    readonly molstarStructure: Structure | undefined;
    readonly mappedEntity: {
        entityId: string;
    } | undefined;
    readonly selectLabelSeqIds: number[];
}
export interface SelectionFramerHost {
    readonly molstarPluginContext: {
        managers: {
            camera: {
                focusLoci(loci: Loci[]): void;
            };
        };
    } | undefined;
    readonly structures: readonly FramedStructure[];
    readonly superposedCount: number;
}
/**
 * Builds the body of the autorun that moves the camera to a declared
 * selection. A session "opened on R248" used to show the whole fold with R248
 * out of sight. It waits until every structure has settled and, with several,
 * until they are superposed, because the reset that ends a superposition would
 * undo it; then it frames the seeded residues once per plugin. Only a spec's
 * seed moves the camera: a click is the user's, and the view they chose stays.
 */
export declare function makeSelectionFramer(host: SelectionFramerHost): () => void;
export {};
