import { render } from '@testing-library/react'

import LabelLayer, { chipReadoutAt } from './LabelLayer'

import type { GraphPaneModel } from '../model'
import type { GenePin } from '@jbrowse/bandage-core/genes/genePins'

const pin: GenePin = {
  gene: {
    name: 'CFHR3',
    refName: 'HG00097#1#CM1',
    start: 5011,
    end: 5019,
    strand: 1,
    exons: [],
  },
  exons: '',
  exonsByNode: [],
  nodeIds: new Set(['h0+']),
  at: { x: 0, y: 0 },
  covered: 1,
  anchored: 1,
  body: [],
  onReference: false,
  walks: 1,
}

test("a chip's readout names the gene as the chip does, a copy with its haplotype, and gives its span 1-based on its contig", () => {
  const name = 'CFHR3 · HG00097#1'
  const genes = [{ item: { pin, name }, x: 100, y: 50, w: 90, text: name }]
  expect(chipReadoutAt({ genes }, 100, 50)).toEqual({
    label: name,
    readout: 'CM1:5,012-5,019',
  })
  expect(chipReadoutAt({ genes }, 400, 50)).toBeUndefined()
})

test("a pass's name is drawn in its thread's colour, with a leader to the thread", () => {
  const ink = 0xff_00_80_ff
  const model = {
    overlayLabels: {
      bubbles: [],
      genes: [],
      ticks: [],
      sizes: [],
      passes: [
        {
          item: { walk: 'hap#1#ctg', pass: 0, ink, at: { x: 200, y: 120 } },
          x: 200,
          y: 112,
          w: 40,
          text: 'pass 1',
        },
      ],
    },
    paneWidth: 400,
    canvasHeight: 300,
    hoveredBubble: null,
    bubbleFaded: () => false,
    bubbleIsOpen: () => false,
  }
  const { getAllByTestId } = render(
    <svg>
      <LabelLayer model={model as unknown as GraphPaneModel} />
    </svg>,
  )
  const [label] = getAllByTestId('graph-pass-label')
  expect(label!.textContent).toBe('pass 1')
  expect(label!.querySelector('line')!.getAttribute('stroke')).toBe(
    'rgba(255,128,0,1)',
  )
})
