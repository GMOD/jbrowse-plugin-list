import { SimpleFeature } from '@jbrowse/core/util'
import { expect, test, vi } from 'vitest'

import { withProteinMenuItems } from '.'

import type * as CoreUtil from '@jbrowse/core/util'

const { session, launch3DProteinView, answer } = vi.hoisted(() => ({
  session: { notify: vi.fn(), notifyError: vi.fn(), queueDialog: vi.fn() },
  launch3DProteinView: vi.fn(() => Promise.resolve()),
  answer: Promise.withResolvers<undefined>(),
}))

vi.mock('@jbrowse/core/util', async importActual => ({
  ...(await importActual<typeof CoreUtil>()),
  getSession: () => session,
  getContainingView: () => ({ id: 'genome', assemblyNames: ['hg38'] }),
  getContainingTrack: () => ({}),
}))

vi.mock('./resolveGeneLaunch', () => ({
  describeMissingStructure: () => '',
  sessionGeneLaunchHost: () => ({}),
  resolveGeneLaunch: async ({ feature }: { feature: SimpleFeature }) => {
    await answer.promise
    return {
      transcript: feature,
      userProvidedTranscriptSequence: 'MEEP',
      uniprotId: 'P04637',
      url: 'https://alphafold.ebi.ac.uk/files/AF-P04637-F1-model_v6.cif',
    }
  },
}))

vi.mock('./utils/launchViewUtils', () => ({ launch3DProteinView }))

const gene = new SimpleFeature({
  uniqueId: 'gene',
  refName: 'chr17',
  start: 0,
  end: 100,
  type: 'gene',
  name: 'TP53',
  subfeatures: [
    {
      uniqueId: 'mrna',
      refName: 'chr17',
      start: 0,
      end: 100,
      type: 'mRNA',
      subfeatures: [
        { uniqueId: 'cds', refName: 'chr17', start: 10, end: 90, type: 'CDS' },
      ],
    },
  ],
})

test('a second click while the lookup runs opens no second view', async () => {
  const items = withProteinMenuItems(
    {
      contextMenuItems: () => [],
      contextMenuInfo: {
        item: { featureId: 'gene', type: 'gene' },
        displayedRegionIndex: 0,
      },
      fetchFullFeature: () => Promise.resolve(gene),
    },
    [],
  )
  const open = items.find(
    item => 'label' in item && item.label === 'Open AlphaFold structure',
  )
  if (!open || !('onClick' in open)) {
    throw new Error('no AlphaFold menu item')
  }
  open.onClick()
  await vi.waitFor(() => {
    expect(session.notify).toHaveBeenCalledWith(
      'Looking up the AlphaFold structure of TP53',
      'info',
    )
  })
  open.onClick()
  await vi.waitFor(() => {
    expect(session.notify).toHaveBeenCalledWith(
      'Still looking up the AlphaFold structure of TP53',
      'info',
    )
  })
  answer.resolve(undefined)
  await vi.waitFor(() => {
    expect(launch3DProteinView).toHaveBeenCalledTimes(1)
  })
})
