// @vitest-environment jsdom
import { createElement } from 'react'

import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import Highlight from './Highlight'

import type { HighlightKind } from './util'

afterEach(() => {
  cleanup()
})

function drawn(kind: HighlightKind, width: number) {
  const { container } = render(
    createElement(Highlight, {
      model: { getHighlightCoords: () => ({ left: 0, width }) },
      region: { refName: 'chr17', start: 0, end: 3 },
      kind,
    }),
  )
  const div = container.querySelector(`[data-highlight="${kind}"]`)
  return div ? getComputedStyle(div) : undefined
}

// after a click, a passing hover read the same as the selection it crossed
test('a hover is drawn apart from the selection', () => {
  const selection = drawn('selection', 30)
  const hover = drawn('hover', 30)
  expect(selection?.borderStyle).toBe('solid')
  expect(hover?.borderStyle).toBe('dashed')
  expect(hover?.backgroundColor).not.toBe(selection?.backgroundColor)
})

test('a highlight a few px wide keeps its kind of border', () => {
  expect(drawn('selection', 2)?.borderStyle).toBe('solid')
  expect(drawn('hover', 2)?.borderStyle).toBe('dashed')
})
