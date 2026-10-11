import { render, screen } from '@testing-library/react'

import { TubeMapLegend } from './TubeMapOverlay'

import type { GraphPaneModel } from '../model'

function legend(readsShown: { shown: number; total: number } | undefined) {
  const model = {
    tubeMapKeys: {
      logWidths: false,
      foldBp: undefined,
      forwardReads: true,
      reverseReads: false,
      substitution: false,
      insertion: false,
      deletion: false,
    },
    readsShown,
  }
  render(<TubeMapLegend model={model as unknown as GraphPaneModel} />)
}

test('a sampled read set says how many of its reads are drawn', () => {
  legend({ shown: 5000, total: 12_345 })
  expect(screen.getByText('5,000 of 12,345 reads shown')).toBeTruthy()
})

test('a read set drawn whole says nothing of its count', () => {
  legend({ shown: 40, total: 40 })
  expect(screen.queryByText(/reads shown/)).toBeNull()
})
