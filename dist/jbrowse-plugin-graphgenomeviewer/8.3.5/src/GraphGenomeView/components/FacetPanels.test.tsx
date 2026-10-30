import { act, render } from '@testing-library/react'
import { observable, runInAction } from 'mobx'

import FacetPanels from './FacetPanels'

import type { GraphPaneModel } from '../model'

const renderers = vi.hoisted(() => [] as { resize: ReturnType<typeof vi.fn> }[])
const uploads = vi.hoisted(() => ({ count: 0 }))

vi.mock('@jbrowse/bandage-core/renderer/Canvas2DRenderer', () => ({
  Canvas2DRenderer: class {
    resize = vi.fn()
    uploadGeometry() {
      uploads.count += 1
    }
    dispose() {}
    constructor() {
      renderers.push(this)
    }
  },
}))
vi.mock('../legendSections', async importOriginal => ({
  ...(await importOriginal()),
  walkKeyRow: () => ({ key: 'walk', label: 'HG002#1' }),
  facetKeyRows: () => [],
}))

test('a facet grid resize keeps the renderers and the uploaded geometry', () => {
  const built = { batch: {} }
  const model = observable({
    facetPanels: [{ walks: [{ name: 'HG002#1' }] }],
    facetGrid: { columns: 1, width: 300, height: 200, total: 220 },
    facetPlacement: { cells: [0] },
    paneWidth: 800,
    canvasHeight: 400,
    hostPlacesX: false,
    buildDrawing: () => built,
    applySelection: () => {},
    paint: () => {},
    paintHover: () => {},
    walkLabel: (name: string) => name,
    hoveredOn: () => undefined,
  })
  render(
    <FacetPanels
      model={model as unknown as GraphPaneModel}
      handlers={{} as never}
      canvasStyle={{}}
    />,
  )
  expect(renderers).toHaveLength(2)
  expect(uploads.count).toBe(1)

  act(() => {
    runInAction(() => {
      model.facetGrid = { columns: 1, width: 360, height: 240, total: 260 }
    })
  })
  expect(renderers).toHaveLength(2)
  expect(uploads.count).toBe(1)
  for (const r of renderers) {
    expect(r.resize).toHaveBeenLastCalledWith(360, 240)
  }
})
