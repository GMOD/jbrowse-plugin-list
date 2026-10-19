import { types } from '@jbrowse/mobx-state-tree'
import { beforeEach, expect, test, vi } from 'vitest'

import { withProteinLinkage } from '.'

import type { LinkageAlignmentHost, Protein1DLinkage } from './linkage'
import type * as CoreUtil from '@jbrowse/core/util'

const notify = vi.fn()
// long enough to clear p2s_mapper's floor on identical residues
const TRANSCRIPT = 'MEEPQSDPSVEPPLSQETFSDLWKLLPENN'
const ENTRY = `GS${TRANSCRIPT}`
const hosts: { asked: number; next: LinkageAlignmentHost } = {
  asked: 0,
  next: sequences(TRANSCRIPT, ENTRY),
}

vi.mock('@jbrowse/core/util', async importActual => ({
  ...(await importActual<typeof CoreUtil>()),
  getSession: () => ({ notify }),
}))
vi.mock('./sessionLinkageHost', () => ({
  sessionLinkageHost: () => {
    hosts.asked++
    return hosts.next
  },
}))

function sequences(
  transcript: string | Promise<string>,
  uniprot: string,
): LinkageAlignmentHost {
  return {
    transcriptProtein: async () => transcript,
    uniprotSequence: async () => uniprot,
    align: async () => ({
      alignment: {
        consensus: `  ${'|'.repeat(TRANSCRIPT.length)}`,
        alns: [
          { id: 'transcript', seq: `--${TRANSCRIPT}` },
          { id: 'uniprot', seq: ENTRY },
        ],
      },
      score: 3,
      matches: 3,
      explained: 1,
    }),
  }
}

const proteinLinkage: Protein1DLinkage = {
  connectedViewId: 'lgv',
  uniprotId: 'P04637',
  feature: {
    uniqueId: 't',
    refName: 'chr1',
    start: 0,
    end: 9,
    strand: 1,
    type: 'mRNA',
    subfeatures: [
      { uniqueId: 'c', refName: 'chr1', start: 0, end: 9, type: 'CDS' },
    ],
  },
}

const View = withProteinLinkage(types.model({ id: types.identifier }))
// afterAttach only runs on a node with a parent, as a session's views are
const Session = types.model({ views: types.array(View) }).actions(self => ({
  closeViews() {
    self.views.clear()
  },
}))

beforeEach(() => {
  notify.mockClear()
  hosts.asked = 0
  hosts.next = sequences(TRANSCRIPT, ENTRY)
})

test('a linked view aligns its transcript to the entry when it attaches', async () => {
  const [view] = Session.create({
    views: [{ id: 'p1d', proteinLinkage }],
  }).views
  expect(view!.proteinLinkageCoordinates).toBeUndefined()
  await vi.waitFor(() => {
    expect(view!.proteinLinkageCoordinates).toBeDefined()
  })
  const { transcriptSeqToStructureSeqPosition } =
    view!.proteinLinkageCoordinates!.maps
  expect(transcriptSeqToStructureSeqPosition[0]).toBe(2)
  expect(transcriptSeqToStructureSeqPosition[29]).toBe(31)
  expect(notify).not.toHaveBeenCalled()
})

test('a genome view with no linkage asks for nothing', () => {
  Session.create({ views: [{ id: 'lgv' }] })
  expect(hosts.asked).toBe(0)
})

test('a transcript that cannot be mapped says so once and links nothing', async () => {
  hosts.next = {
    ...sequences(TRANSCRIPT, ENTRY),
    transcriptProtein: async () => undefined,
  }
  const [view] = Session.create({
    views: [{ id: 'p1d', proteinLinkage }],
  }).views
  await vi.waitFor(() => {
    expect(notify).toHaveBeenCalledOnce()
  })
  expect(notify.mock.calls[0]?.[0]).toBe(
    'The protein view of P04637 is not linked to the genome: the transcript has no translation',
  )
  expect(view!.proteinLinkageCoordinates).toBeUndefined()
})

test('a failed sequence fetch is reported, not left as an unhandled rejection', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  hosts.next = {
    ...sequences(TRANSCRIPT, ENTRY),
    uniprotSequence: async () => {
      throw new Error('assembly not found')
    },
  }
  const [view] = Session.create({
    views: [{ id: 'p1d', proteinLinkage }],
  }).views
  await vi.waitFor(() => {
    expect(notify).toHaveBeenCalledOnce()
  })
  expect(`${notify.mock.calls[0]?.[0]}`).toContain('assembly not found')
  expect(error).toHaveBeenCalledOnce()
  expect(view!.proteinLinkageCoordinates).toBeUndefined()
  error.mockRestore()
})

test('a view closed before its alignment lands is left alone', async () => {
  let land = (_seq: string) => {}
  hosts.next = sequences(
    new Promise<string>(resolve => {
      land = resolve
    }),
    ENTRY,
  )
  const session = Session.create({ views: [{ id: 'p1d', proteinLinkage }] })
  session.closeViews()
  land(TRANSCRIPT)
  await new Promise(resolve => setTimeout(resolve, 10))
  expect(notify).not.toHaveBeenCalled()
})
