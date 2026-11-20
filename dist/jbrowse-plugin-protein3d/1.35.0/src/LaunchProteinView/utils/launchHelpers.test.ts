import { describe, expect, it } from 'vitest'

import { getLaunchMissingReasons } from './launchHelpers'

const ready = {
  structureCount: 1,
  userSelectedProteinSequence: { seq: 'MKT*' },
  selectedTranscript: { id: 'ENST1' },
}

describe('getLaunchMissingReasons', () => {
  it('needs nothing more once a structure and a translated transcript are chosen', () => {
    expect(getLaunchMissingReasons(ready)).toEqual([])
  })

  it('needs a structure checked', () => {
    expect(getLaunchMissingReasons({ ...ready, structureCount: 0 })).toEqual([
      'No structure checked',
    ])
  })

  it('still asks for the transcript and its translation', () => {
    expect(getLaunchMissingReasons({ structureCount: 2 })).toEqual([
      'Could not compute protein sequence (feature may be missing CDS subfeatures)',
      'No transcript selected',
    ])
  })
})
