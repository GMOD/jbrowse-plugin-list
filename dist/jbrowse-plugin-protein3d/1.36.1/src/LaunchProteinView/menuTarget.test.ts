import { LAUNCH_LABEL, resolveSubMenu } from '@jbrowse/core/ui'
import { SimpleFeature } from '@jbrowse/core/util'
import { expect, test, vi } from 'vitest'

import { resolveTarget, withProteinMenuItems } from '.'

import type { MenuItem } from '@jbrowse/core/ui'

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
  expect(await target?.fetchFeature()).toBe(gene)
  expect(fetchFullFeature).toHaveBeenCalledWith('gene', 0)
})

test('a click on the gene itself names no isoform', () => {
  const target = resolveTarget({
    contextMenuItems: () => [],
    contextMenuInfo: {
      item: { featureId: 'gene', type: 'gene' },
      displayedRegionIndex: 0,
    },
    fetchFullFeature: () => Promise.resolve(gene),
  })
  expect(target?.type).toBe('gene')
  expect(target?.preferredTranscriptId).toBeUndefined()
})

const hostItems = [{ label: 'Host row', onClick: () => {} }]

const geneDisplay = {
  contextMenuItems: () => [],
  contextMenuInfo: {
    item: { featureId: 'gene', type: 'gene' },
    displayedRegionIndex: 0,
  },
  fetchFullFeature: () => Promise.resolve(gene),
}

function labels(items: MenuItem[]) {
  return items.map(i => ('label' in i ? i.label : undefined))
}

function launchRows(items: MenuItem[]) {
  const launch = items.find(i => 'subMenu' in i && i.label === LAUNCH_LABEL)
  return launch && 'subMenu' in launch ? resolveSubMenu(launch) : []
}

test('a gene gets the protein row in a Launch submenu after the host rows', () => {
  const items = withProteinMenuItems(geneDisplay, hostItems)
  expect(labels(items)).toEqual(['Host row', LAUNCH_LABEL])
  expect(labels(launchRows(items))).toEqual(['Protein view...'])
})

test('the protein row joins a Launch submenu another plugin built', () => {
  const items = withProteinMenuItems(geneDisplay, [
    ...hostItems,
    {
      label: LAUNCH_LABEL,
      subMenu: [{ label: 'MSA view...', onClick: () => {} }],
    },
  ])
  expect(labels(items)).toEqual(['Host row', LAUNCH_LABEL])
  expect(labels(launchRows(items))).toEqual(['MSA view...', 'Protein view...'])
})

test('a host shape this plugin cannot read leaves the host rows standing', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const items = withProteinMenuItems(
    {
      contextMenuItems: () => [],
      get contextMenuInfo(): never {
        throw new Error('host shape changed')
      },
      fetchFullFeature: () => Promise.resolve(gene),
    },
    hostItems,
  )
  expect(items).toBe(hostItems)
  expect(error).toHaveBeenCalledOnce()
  error.mockRestore()
})
