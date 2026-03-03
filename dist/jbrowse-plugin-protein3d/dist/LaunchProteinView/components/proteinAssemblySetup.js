/**
 * Sets up a temporary assembly for a protein sequence from UniProt
 */
export function setupProteinAssembly(session, uniprotId) {
    session.addTemporaryAssembly?.({
        name: uniprotId,
        sequence: {
            type: 'ReferenceSequenceTrack',
            trackId: `${uniprotId}-ReferenceSequenceTrack`,
            sequenceType: 'pep',
            adapter: {
                type: 'UnindexedFastaAdapter',
                rewriteRefNames: "jexl:split(refName,'|')[1]",
                fastaLocation: {
                    uri: `https://rest.uniprot.org/uniprotkb/${uniprotId}.fasta`,
                },
            },
        },
    });
}
//# sourceMappingURL=proteinAssemblySetup.js.map