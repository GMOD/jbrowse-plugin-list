import { rowPitch } from '@jbrowse/bandage-core/layout/walkRowDraw'
import { autorun, observable, runInAction } from 'mobx'

import { walkRowTreesOnPane } from './WalkRowsOverlay'
import { sectionPlacement } from '../walkRowGroups'

import type { WalkRow } from '@jbrowse/bandage-core/layout/walkRows'

function row(name: string, bp: number): WalkRow {
  return {
    name,
    label: name,
    sample: name,
    bp,
    offReferenceBp: 0,
    gapBp: 0,
    complete: true,
    runs: [{ start: 0, bp, onReference: true, referenceStart: 1000 }],
  }
}

function pane() {
  const pitch = rowPitch(4, 200)
  const source = observable({
    walkRowBars: {
      origin: 1000,
      reference: row('GRCh38', 3000),
      rows: [row('A', 2000), row('B', 2500), row('C', 1000)],
    },
    walkRowPlacement: sectionPlacement([], pitch.rowPx),
    walkRowPitch: pitch,
    walkRowGroups: undefined,
    referenceRampDomain: undefined,
    walkRowGenes: undefined,
    scaleX: 0.1,
    scaleY: 1,
    translateX: 20,
    translateY: 10,
    paneWidth: 600,
    canvasHeight: 200,
  })
  const trees = walkRowTreesOnPane(source, 't', false)
  const seen: unknown[] = []
  const stop = autorun(() => {
    seen.push(trees.get())
  })
  return { source, seen, stop }
}

test('a pan reuses the trees and the translate they were drawn at', () => {
  const { source, seen, stop } = pane()
  runInAction(() => {
    source.translateX = 35
    source.translateY = 4
  })
  expect(seen).toHaveLength(1)
  expect(seen[0]).toMatchObject({ at: { translateX: 20, translateY: 10 } })
  stop()
})

test('a zoom redraws the trees, and so does a pan that turns a readout round', () => {
  const { source, seen, stop } = pane()
  runInAction(() => {
    source.scaleX = 0.2
  })
  expect(seen).toHaveLength(2)
  runInAction(() => {
    source.translateX = 380
  })
  expect(seen).toHaveLength(3)
  expect(seen[2]).toMatchObject({ at: { translateX: 380, translateY: 10 } })
  stop()
})
