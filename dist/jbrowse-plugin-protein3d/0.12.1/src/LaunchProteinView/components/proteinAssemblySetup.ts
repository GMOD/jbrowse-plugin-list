import { uniprotFastaUrl } from 'p2s_mapper'

import type { SessionWithAddTracks } from '../utils/sessionWithAddTracks'

/**
 * Sets up a temporary assembly for a protein sequence from UniProt
 */
export function setupProteinAssembly(
  session: SessionWithAddTracks,
  uniprotId: string,
) {
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
          uri: uniprotFastaUrl(uniprotId),
        },
      },
    },
  })
}
