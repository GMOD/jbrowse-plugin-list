import { uniprotFastaUrl } from 'p2s_mapper'

export interface TemporaryAssemblySession {
  addTemporaryAssembly: (conf: Record<string, unknown>) => void
}

export function canAddTemporaryAssembly<
  T extends { addTemporaryAssembly?: (conf: Record<string, unknown>) => void },
>(session: T): session is T & TemporaryAssemblySession {
  return session.addTemporaryAssembly !== undefined
}

/**
 * Sets up a temporary assembly for a protein sequence from UniProt
 */
export function setupProteinAssembly(
  session: TemporaryAssemblySession,
  uniprotId: string,
) {
  session.addTemporaryAssembly({
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
