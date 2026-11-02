import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import GraphAddTrackWidget from './AddTrackWorkflow'
import {
  GRAPH_FILE_FIELDS,
  GRAPH_FILE_LABELS,
  GRAPH_INDEX_FIELDS,
} from './buildTrackConfig'

import type { AddTrackWorkflowModel } from '@jbrowse/core/util'

const { added, picks } = vi.hoisted(() => ({
  added: [] as { adapter: Record<string, unknown> }[],
  // the uri a file field picks, by field; else one named after the field
  picks: new Map<string, string>(),
}))

vi.mock('@jbrowse/core/ui', () => ({
  AssemblySelector: () => null,
  ErrorMessage: () => null,
  FileSelector: ({
    name,
    setLocation,
  }: {
    name: string
    setLocation: (loc: unknown) => void
  }) => (
    <button
      type="button"
      onClick={() => {
        setLocation({
          uri: picks.get(name) ?? `${name}.file`,
          locationType: 'UriLocation',
        })
      }}
    >
      {name}
    </button>
  ),
}))

vi.mock('@jbrowse/core/util', () => ({
  addTrackFromWidget: ({ conf }: { conf: { adapter: object } }) => {
    added.push(conf as (typeof added)[number])
  },
  getEnv: () => ({}),
  getSession: () => ({}),
  makeTrackId: () => 'graph',
}))

vi.mock('@jbrowse/mobx-state-tree', () => ({
  getRoot: () => ({}),
  isAlive: () => true,
}))

test('switching the file type forgets the index chosen for the last one', async () => {
  render(
    <GraphAddTrackWidget
      model={
        {
          assembly: 'hg38',
          setAssembly: () => {},
        } as unknown as AddTrackWorkflowModel
      }
    />,
  )
  fireEvent.click(screen.getByText(GRAPH_INDEX_FIELDS.RgfaTabixAdapter))
  fireEvent.click(
    screen.getByLabelText(GRAPH_FILE_LABELS.GbzBaseSyntenyAdapter),
  )
  fireEvent.click(screen.getByText(GRAPH_FILE_FIELDS.GbzBaseSyntenyAdapter))
  fireEvent.click(screen.getByText('Submit'))
  await waitFor(() => {
    expect(added).toHaveLength(1)
  })
  expect(added[0]!.adapter.type).toBe('GbzBaseSyntenyAdapter')
  expect(added[0]!.adapter).not.toHaveProperty('haplotypeIndexLocation')
})

test('a walk file adds a walk-indexed rGFA track for the haplotypes typed', async () => {
  added.length = 0
  picks.set(
    GRAPH_FILE_FIELDS.RgfaTabixWalks,
    'https://example.com/chr22.GRCh38.walks.bed.gz',
  )
  render(
    <GraphAddTrackWidget
      model={
        {
          assembly: 'hg38',
          setAssembly: () => {},
        } as unknown as AddTrackWorkflowModel
      }
    />,
  )
  fireEvent.click(screen.getByLabelText(GRAPH_FILE_LABELS.RgfaTabixWalks))
  fireEvent.click(screen.getByText(GRAPH_FILE_FIELDS.RgfaTabixWalks))
  fireEvent.change(screen.getByTestId('graph-haplotypes-input'), {
    target: { value: 'HG002, HG00733#1' },
  })
  fireEvent.click(screen.getByText('Submit'))
  await waitFor(() => {
    expect(added).toHaveLength(1)
  })
  expect(added[0]!.adapter).toEqual({
    type: 'RgfaTabixAdapter',
    walksLocation: {
      uri: 'https://example.com/chr22.GRCh38.walks.bed.gz',
      locationType: 'UriLocation',
    },
    walksIndex: {
      indexType: 'TBI',
      location: {
        uri: 'https://example.com/chr22.GRCh38.walks.bed.gz.tbi',
        locationType: 'UriLocation',
      },
    },
    assemblyNameToPanSN: { hg38: 'GRCh38' },
    defaultHaplotypes: ['HG002', 'HG00733#1'],
  })
})
