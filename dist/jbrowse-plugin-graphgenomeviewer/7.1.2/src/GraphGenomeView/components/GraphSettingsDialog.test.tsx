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
  render(<GraphSettingsDialog model={model} open onClose={() => {}} />)
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
