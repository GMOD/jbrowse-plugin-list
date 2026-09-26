import { chooseUniProtMappingForEntity, identityUniProtPositionMap, makeUniProtPositionMap, } from 'p2s_mapper';
/**
 * Which UniProt entry a loaded structure represents, and how UniProt positions
 * line up with its structure-sequence positions.
 *
 * AlphaFold models are the UniProt sequence, so the accession comes straight
 * from the filename and positions map 1:1. Experimental PDB entries need SIFTS:
 * the accession isn't in the URL at all, and the construct's numbering differs
 * from UniProt's by a per-segment offset. Without this, PDB structures showed no
 * UniProt feature tracks at all (no accession to query) — and any that did
 * resolve would have been drawn at the wrong residues. The structure model
 * fetches SIFTS, since its mapping reads the same segments.
 */
export function structureUniProt({ uniprotId: alphaFoldUniprotId, pdbId, uniProtMappings, uniProtMappingsError, mappedEntity, }) {
    if (alphaFoldUniprotId) {
        return {
            uniprotId: alphaFoldUniprotId,
            uniprotName: undefined,
            mapUniProtPosition: identityUniProtPositionMap,
            isLoading: false,
            error: undefined,
        };
    }
    const sifts = uniProtMappings
        ? chooseUniProtMappingForEntity(uniProtMappings, mappedEntity)
        : undefined;
    return {
        uniprotId: sifts?.accession,
        uniprotName: sifts?.name,
        mapUniProtPosition: sifts
            ? makeUniProtPositionMap(sifts.segments)
            : identityUniProtPositionMap,
        isLoading: !!pdbId && !uniProtMappings && !uniProtMappingsError,
        error: uniProtMappingsError,
    };
}
