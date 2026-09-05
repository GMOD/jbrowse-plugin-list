import { type MapUniProtPosition } from '../pdbUniProtMapping';
export interface StructureUniProt {
    /** accession the structure's mapped entity corresponds to, when known */
    uniprotId: string | undefined;
    /** UniProt entry name (e.g. "P53_HUMAN"), only resolved via SIFTS */
    uniprotName: string | undefined;
    /** 1-based UniProt position -> 0-based structure position */
    mapUniProtPosition: MapUniProtPosition;
    isLoading: boolean;
    error: unknown;
}
/**
 * Resolves which UniProt entry a loaded structure represents, and how UniProt
 * positions line up with its structure-sequence positions.
 *
 * AlphaFold models are the UniProt sequence, so the accession comes straight
 * from the filename and positions map 1:1. Experimental PDB entries need SIFTS:
 * the accession isn't in the URL at all, and the construct's numbering differs
 * from UniProt's by a per-segment offset. Without this, PDB structures showed no
 * UniProt feature tracks at all (no accession to query) — and any that did
 * resolve would have been drawn at the wrong residues.
 */
export default function useStructureUniProt({ url, mappedEntityId, }: {
    url: string | undefined;
    mappedEntityId: string | undefined;
}): StructureUniProt;
