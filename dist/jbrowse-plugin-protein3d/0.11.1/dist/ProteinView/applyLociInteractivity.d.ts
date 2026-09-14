import type { Structure, StructureElement, StructureSelection } from 'molstar/lib/mol-model/structure';
import type { Script } from 'molstar/lib/mol-script/script';
/** The part of a plugin's `managers.interactivity` that lights residues. */
export interface LociMarks {
    lociHighlights: {
        clearHighlights(): void;
        highlight(current: {
            loci: StructureElement.Loci;
        }): void;
    };
    lociSelects: {
        deselectAll(): void;
        select(current: {
            loci: StructureElement.Loci;
        }): void;
    };
}
/** Residues of one structure, addressed by Mol*'s own `label_seq_id`. */
export interface ResidueTarget {
    structure: Structure;
    /** Confines the residues to this mmCIF entity, so a residue number doesn't
     * light up on a binding partner or the other half of a homodimer. */
    entityId?: string;
    labelSeqIds: number[];
}
/**
 * The loci for a set of residues. Taking label_seq_ids rather than the
 * plugin's 0-based positions keeps that conversion in one place (see
 * Entity.seqIds) instead of assuming `pos + 1`, which mis-paints a PDB file
 * whose residues don't start at 1.
 */
export declare function residueLoci(molstar: {
    Script: typeof Script;
    StructureSelection: typeof StructureSelection;
}, { structure, entityId, labelSeqIds }: ResidueTarget): StructureElement.Loci;
/**
 * Reconcile one interactivity channel (hover-`highlight` or click-`select`) to
 * the residues every structure of a view wants lit. The channel is plugin-wide,
 * so a call covers all structures at once; clearing per structure wipes the
 * others. Nothing awaits between clearing and marking, so when two calls
 * overlap the later one's residues are what stay lit.
 */
export declare function setMolstarLoci({ interactivity, channel, targets, }: {
    interactivity: LociMarks;
    channel: 'highlight' | 'select';
    targets: ResidueTarget[];
}): Promise<void>;
