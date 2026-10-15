import { render, screen } from '@testing-library/react'

import GraphSettingsDialog from './GraphSettingsDialog'

import type { GraphPaneModel } from '../model'

function shown(layoutEngine: string) {
  const model = {
    maxGraphNodes: 20_000,
    anchorPaths: [],
    nodeWidth: 'depth',
    drawPaths: false,
    effectiveDrawPaths: false,
    pathCount: 0,
    geneTrackChoices: [],
    repeatTrackChoices: [],
    hasGraph: true,
    usesLayoutEngine: true,
    layoutEngine,
    layoutQuality: 2,
    bubbleSpread: 'auto',
    linearLayout: false,
  } as unknown as GraphPaneModel
  render(<GraphSettingsDialog model={model} onClose={() => {}} />)
  return screen.queryByText('Linear layout') !== null
}

test.each([
  ['fmmm', true],
  ['stress', false],
])(
  'linear layout is offered under %s: %s, since stress ignores it',
  (engine, offered) => {
    expect(shown(engine)).toBe(offered)
  },
)

test('a lone repeat track the heuristic skips can still be picked', () => {
  const model = {
    maxGraphNodes: 20_000,
    anchorPaths: [],
    nodeWidth: 'depth',
    pathCount: 0,
    geneTrackChoices: [],
    repeatTrackChoices: [
      { trackId: 'loci', name: 'loci.bed', adapterType: 'BedTabixAdapter' },
    ],
    repeatTrackId: '',
    hasGraph: true,
    layoutEngine: 'stress',
  } as unknown as GraphPaneModel
  render(<GraphSettingsDialog model={model} onClose={() => {}} />)
  expect(screen.getByTestId('graph-repeat-track-select')).toBeTruthy()
  expect(screen.getByText('Automatic (none)')).toBeTruthy()
})
