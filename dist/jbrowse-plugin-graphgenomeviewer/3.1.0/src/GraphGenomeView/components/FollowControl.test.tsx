import { fireEvent, render, screen } from '@testing-library/react'

import FollowControl from './FollowControl'

import type { GraphGenomeViewModel } from '../model'

function control(state: Partial<GraphGenomeViewModel>) {
  const model = {
    loadedTrackId: 'graph',
    followLinearView: true,
    followState: { active: true },
    followNote: undefined,
    cutTier: 'fine',
    setFollowLinearView: vi.fn(),
    ...state,
  }
  render(<FollowControl model={model as unknown as GraphGenomeViewModel} />)
  return model
}

function status() {
  return screen.queryByTestId('graph-follow-status')?.textContent
}

test('a following graph offers Pin, and says it is following', () => {
  const model = control({})
  expect(status()).toBe('Following the linear view')
  fireEvent.click(screen.getByText('Pin'))
  expect(model.setFollowLinearView).toHaveBeenCalledWith(false)
})

test('a pinned graph offers Follow, and says it is pinned', () => {
  const model = control({
    followLinearView: false,
    followState: { active: false, reason: undefined },
  })
  expect(status()).toBe('Pinned')
  fireEvent.click(screen.getByText('Follow'))
  expect(model.setFollowLinearView).toHaveBeenCalledWith(true)
})

test('a follow that cannot run says why', () => {
  control({
    followState: {
      active: false,
      reason: 'Not following: x is not reference bp (Force-directed layout)',
    },
  })
  expect(status()).toMatch(/Force-directed layout/)
  expect(screen.getByText('Pin')).toBeTruthy()
})

test('a coarse cut says so', () => {
  control({ cutTier: 'coarse' })
  expect(status()).toBe('Following the linear view, coarse tier')
})

test('a held cut says what it is holding', () => {
  control({
    followNote: 'Holding the last cut: 6 Mb is past the 5 Mb a cut may span',
  })
  expect(status()).toMatch(/^Holding the last cut/)
})

test('a graph from a whole file has no follow control', () => {
  control({ loadedTrackId: '' })
  expect(screen.queryByText('Pin')).toBeNull()
  expect(status()).toBeUndefined()
})
