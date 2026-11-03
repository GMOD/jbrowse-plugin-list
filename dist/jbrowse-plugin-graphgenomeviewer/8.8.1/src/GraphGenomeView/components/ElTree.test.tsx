import { el } from '@jbrowse/bandage-core/el'
import { render } from '@testing-library/react'

import ElTree from './ElTree'

test('a core element tree renders with its SVG attributes and test ids', () => {
  const { container } = render(
    <svg>
      <ElTree
        el={el(
          'g',
          { class: 'row-gene', 'data-testid': 'graph-walk-gene' },
          el('rect', { x: 2, 'stroke-width': 1.5 }),
          el('text', { 'text-anchor': 'middle' }, 'AMY1C'),
        )}
      />
    </svg>,
  )
  const g = container.querySelector('[data-testid="graph-walk-gene"]')!
  expect(g.getAttribute('class')).toBe('row-gene')
  expect(g.querySelector('rect')!.getAttribute('stroke-width')).toBe('1.5')
  expect(g.querySelector('text')!.getAttribute('text-anchor')).toBe('middle')
  expect(g.textContent).toBe('AMY1C')
})
