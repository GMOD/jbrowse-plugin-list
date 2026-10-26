import { chooseUniProtMappingForEntity, identityUniProtPositionMap, makeUniProtPositionMap, } from 'p2s_mapper';
const ISOFORM_SUFFIX = /-\d+$/;
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
export function structureUniProt({ uniprotId: alphaFoldUniprotId, pdbId, modelAccession, uniProtMappings, uniProtMappingsError, mappedEntity, }) {
    // A PDB entry named beside an accession is still a construct with its own
    // numbering, so it goes through SIFTS like any other
    if (alphaFoldUniprotId && !pdbId) {
        // An isoform model (AF-P04637-7) is numbered for the isoform, and UniProt
        // publishes features for the entry alone. Mapped one to one, 1,080 of
        // P04637's features sat on the wrong residue of that model, R248 on a
        // histidine 132 away. Until the two sequences are aligned, an isoform
        // model shows none of them.
        const isoformAccession = [modelAccession, alphaFoldUniprotId].find(a => a !== undefined && ISOFORM_SUFFIX.test(a));
        return {
            uniprotId: alphaFoldUniprotId.replace(ISOFORM_SUFFIX, ''),
            uniprotName: undefined,
            mapUniProtPosition: isoformAccession
                ? () => undefined
                : identityUniProtPositionMap,
            isLoading: false,
            error: undefined,
            isoformAccession,
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
