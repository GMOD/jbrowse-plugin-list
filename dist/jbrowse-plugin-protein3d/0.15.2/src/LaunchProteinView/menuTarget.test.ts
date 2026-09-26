import { SimpleFeature } from '@jbrowse/core/util'
import { expect, test, vi } from 'vitest'

import { resolveTarget } from '.'

const cds = (id: string) => ({
  uniqueId: id,
  refName: 'chr1',
  start: 10,
  end: 90,
  type: 'CDS',
})

const gene = new SimpleFeature({
  uniqueId: 'gene',
  refName: 'chr1',
  start: 0,
  end: 100,
  type: 'gene',
  subfeatures: ['mrna-1', 'mrna-2'].map(id => ({
    uniqueId: id,
    refName: 'chr1',
    start: 0,
    end: 100,
    type: 'mRNA',
    subfeatures: [cds(`${id}-cds`)],
  })),
})

test('a canvas click on an isoform fetches the gene and names the isoform', async () => {
  const fetchFullFeature = vi.fn(() => Promise.resolve(gene))
  const target = resolveTarget({
    contextMenuItems: () => [],
    contextMenuInfo: {
      item: { featureId: 'gene', type: 'gene' },
      subfeature: {
        featureId: 'mrna-2',
        type: 'mRNA',
        parentFeatureId: 'gene',
      },
      displayedRegionIndex: 0,
    },
    fetchFullFeature,
  })
  expect(target?.preferredTranscriptId).toBe('mrna-2')
  expect(
    target && 'fetchFeature' in target && (await target.fetchFeature()),
  ).toBe(gene)
  expect(fetchFullFeature).toHaveBeenCalledWith('gene', 0)
})

test('a legacy click on an isoform opens on the gene and names the isoform', () => {
  const mrna2 = gene.get('subfeatures')![1]!
  const target = resolveTarget({
    contextMenuItems: () => [],
    contextMenuFeature: mrna2,
  })
  expect(target && 'feature' in target && target.feature).toBe(gene)
  expect(target?.preferredTranscriptId).toBe('mrna-2')
})

test('a click on the gene itself names no isoform', () => {
  const target = resolveTarget({
    contextMenuItems: () => [],
    contextMenuFeature: gene,
  })
  expect(target?.preferredTranscriptId).toBeUndefined()
})
