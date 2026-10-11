import { describe, expect, it } from 'vitest'

import { getLaunchMissingReasons } from './launchHelpers'

const ready = {
  userSelectedProteinSequence: { seq: 'MKT*' },
  selectedTranscript: { id: 'ENST1' },
}

describe('getLaunchMissingReasons', () => {
  it('needs an accession when nothing else names a structure', () => {
    expect(getLaunchMissingReasons(ready)).toEqual([
      'No UniProt ID found',
      'No structure selected',
    ])
  })

  it('needs none when a typed PDB id names the entry', () => {
    expect(
      getLaunchMissingReasons({
        ...ready,
        pdbId: '1tup',
        url: 'https://files.rcsb.org/download/1tup.cif',
      }),
    ).toEqual([])
  })

  it('keeps the AlphaFold tab honest: its url comes from the accession', () => {
    // no accession resolves no model, so both reasons stand
    expect(getLaunchMissingReasons({ ...ready, uniprotId: undefined })).toEqual(
      ['No UniProt ID found', 'No structure selected'],
    )
    expect(
      getLaunchMissingReasons({
        ...ready,
        uniprotId: 'P04637',
        url: 'https://alphafold.ebi.ac.uk/files/AF-P04637-F1-model_v6.cif',
      }),
    ).toEqual([])
  })

  it('still asks for the transcript and its translation', () => {
    expect(getLaunchMissingReasons({ pdbId: '1tup' })).toEqual([
      'Could not compute protein sequence (feature may be missing CDS subfeatures)',
      'No transcript selected',
    ])
  })
})
