import type { ReactNode } from 'react'

import { observer } from 'mobx-react'

import { LegendSwatchView } from './LegendSwatch'
import { legendBoxStyle, legendNoteStyle, legendRowStyle } from './legendStyles'
import { legendSections } from '../legendSections'

import type { LegendRow } from '../legendSections'
import type { GraphPaneModel } from '../model'

// One row: its swatch then its words, or a note with neither. `at`, where
// the hovered node sits on a walk, stands in for the line under it.
export function LegendRowView({
  row,
  at,
  hint,
  after,
}: {
  row: LegendRow
  at?: string
  hint?: string
  after?: ReactNode
}) {
  return row.swatch ? (
    <div title={[row.title, hint].filter(Boolean).join(' · ') || undefined}>
      <div style={legendRowStyle}>
        <LegendSwatchView swatch={row.swatch} />
        <span>
          {row.strong ? <strong>{row.strong}</strong> : null}
          {row.label}
        </span>
        {after}
      </div>
      {at ? (
        <div data-testid="graph-walk-at">{at}</div>
      ) : row.under ? (
        <div>{row.under}</div>
      ) : null}
    </div>
  ) : (
    <div style={legendNoteStyle}>{row.label}</div>
  )
}

const closeStyle = {
  pointerEvents: 'auto' as const,
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  padding: '0 2px',
  font: 'inherit',
  textDecoration: 'underline',
}

// Every key the drawing needs, a section each
export const LegendPanel = observer(function LegendPanel({
  model,
}: {
  model: GraphPaneModel
}) {
  return (
    <>
      {legendSections(model).map(({ testid, rows }) => (
        <div key={testid} style={legendBoxStyle} data-testid={testid}>
          {rows.map(row => (
            <LegendRowView
              key={row.key}
              row={row}
              at={row.walk ? model.hoveredOn(row.walk) : undefined}
              after={
                row.closesBubble ? (
                  <button
                    type="button"
                    style={closeStyle}
                    data-testid="graph-close-bubble"
                    onClick={() => {
                      model.closeBubbles()
                    }}
                  >
                    close
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      ))}
    </>
  )
})
