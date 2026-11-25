import { describe, expect, it } from 'vitest'

import {
  errorHoldsLaunch,
  getLaunchMissingReasons,
  launchControls,
  launchReadiness,
} from './launchHelpers'

const ready = {
  userSelectedProteinSequence: { seq: 'MKT*' },
  selectedTranscript: { id: 'ENST1' },
}

describe('getLaunchMissingReasons', () => {
  it('needs nothing more once a translated transcript is chosen', () => {
    expect(getLaunchMissingReasons(ready)).toEqual([])
  })

  it('asks for the transcript and its translation', () => {
    expect(getLaunchMissingReasons({})).toEqual([
      'Could not compute protein sequence (feature may be missing CDS subfeatures)',
      'No transcript selected',
    ])
  })
})

describe('errorHoldsLaunch', () => {
  const ranking = new Error('alignment failed')
  it('holds the launch on any error but a ranking the selection needs not', () => {
    const preferred = { preferredTranscriptId: 'ENST1' }
    expect(
      errorHoldsLaunch({
        ...preferred,
        error: ranking,
        rankingError: ranking,
        selectedTranscriptId: 'ENST1',
      }),
    ).toBe(false)
    expect(
      errorHoldsLaunch({
        ...preferred,
        error: ranking,
        rankingError: ranking,
        selectedTranscriptId: 'ENST2',
      }),
    ).toBe(true)
    expect(
      errorHoldsLaunch({
        ...preferred,
        error: new Error('no chains'),
        rankingError: ranking,
        selectedTranscriptId: 'ENST1',
      }),
    ).toBe(true)
    expect(
      errorHoldsLaunch({
        ...preferred,
        error: undefined,
        rankingError: undefined,
      }),
    ).toBe(false)
  })
})

const settled = {
  ...ready,
  rowCount: 3,
  userPicked: false,
  defaultPending: false,
  addedPending: false,
  structureCount: 1,
  loading: false,
  failed: false,
  uniprotId: 'P01111',
  lookupLoading: false,
}

function gate(
  overrides: Partial<typeof settled>,
  { launching = false, offers1D = true } = {},
) {
  const readiness = launchReadiness({ ...settled, ...overrides })
  return {
    ...readiness,
    ...launchControls({ ...readiness, launching, offers1D }),
  }
}

describe('launch gating', () => {
  it('opens either view once a structure is checked', () => {
    expect(gate({})).toMatchObject({
      listing: 'listed',
      missingReasons: [],
      can3D: true,
      can1D: true,
      canOpenOptions: true,
    })
  })

  it('opens nothing with no accession and nothing listed', () => {
    expect(
      gate({ uniprotId: undefined, rowCount: 0, structureCount: 0 }),
    ).toMatchObject({
      listing: 'empty',
      can3D: false,
      can1D: false,
      canOpenOptions: false,
    })
  })

  it('opens the 1D view of an accession with no structure, and asks for none', () => {
    expect(gate({ rowCount: 0, structureCount: 0 })).toMatchObject({
      listing: 'empty',
      missingReasons: [],
      can3D: false,
      can1D: true,
      canOpenOptions: true,
    })
  })

  it('asks for a structure while rows are listed and none is checked', () => {
    expect(gate({ structureCount: 0 })).toMatchObject({
      listing: 'listed',
      missingReasons: ['No structure checked'],
      can3D: false,
      can1D: true,
    })
  })

  it('holds the 1D view until the default structure has picked its isoform', () => {
    expect(gate({ defaultPending: true, structureCount: 0 })).toMatchObject({
      listing: 'finding',
      can3D: false,
      can1D: false,
      canOpenOptions: false,
    })
    expect(gate({ defaultPending: true, userPicked: true })).toMatchObject({
      listing: 'listed',
      can3D: true,
      can1D: true,
    })
  })

  it('holds the 3D view until RCSB says a checked added entry exists', () => {
    expect(gate({ addedPending: true })).toMatchObject({
      missingReasons: [],
      can3D: false,
      can1D: true,
    })
  })

  it('holds the 1D view while the accession is looked up', () => {
    expect(gate({ lookupLoading: true })).toMatchObject({
      can3D: true,
      can1D: false,
    })
  })

  it('opens nothing while a launch runs', () => {
    expect(gate({}, { launching: true })).toMatchObject({
      can3D: false,
      can1D: false,
      canOpenOptions: false,
    })
  })

  it('offers no 1D view to a session that takes no temporary assembly', () => {
    expect(
      gate({ rowCount: 0, structureCount: 0 }, { offers1D: false }),
    ).toMatchObject({ can1D: false, canOpenOptions: false })
  })
})
