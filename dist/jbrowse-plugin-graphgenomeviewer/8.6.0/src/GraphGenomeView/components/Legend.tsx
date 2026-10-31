import { Fragment } from 'react'
import type { ReactNode } from 'react'

import { observer } from 'mobx-react'

import { LegendSwatchView } from './LegendSwatch'
import {
  HEADING_GAP_PX,
  legendBoxStyle,
  legendHeadingStyle,
  legendNoteStyle,
  legendRowStyle,
} from './legendStyles'
import { legendSections, rowPitch, swatchColumn } from '../legendSections'

import type { LegendRow } from '../legendSections'
import type { GraphPaneModel } from '../model'

// One row: its swatch then its words, or a note with neither.
// `at`, where the hovered node sits on a walk, stands in for the line under
// it. A `column` centres the swatch in a slot that wide and indents the line
// under to the words.
export const LegendRowView = observer(function LegendRowView({
  row,
  at,
  hint,
  after,
  column,
}: {
  row: LegendRow
  at?: string
  hint?: string
  after?: ReactNode
  column?: number
}) {
  const indent = column === undefined ? undefined : { paddingLeft: column + 5 }
  return row.swatch ? (
    <div title={[row.title, hint].filter(Boolean).join(' · ') || undefined}>
      <div style={legendRowStyle}>
        <span
          style={{
            display: 'flex',
            flex: 'none',
            justifyContent: 'center',
            width: column,
          }}
        >
          <LegendSwatchView swatch={row.swatch} />
        </span>
        <span>
          {row.strong ? <strong>{row.strong}</strong> : null}
          {row.label}
        </span>
        {after}
      </div>
      {at ? (
        <div style={indent} data-testid="graph-walk-at">
          {at}
        </div>
      ) : row.under ? (
        <div style={indent}>{row.under}</div>
      ) : null}
    </div>
  ) : (
    <div style={legendNoteStyle}>{row.label}</div>
  )
})

const closeStyle = {
  pointerEvents: 'auto' as const,
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  padding: '0 2px',
  font: 'inherit',
  textDecoration: 'underline',
}

// Every key the drawing needs in one box, a section each, every line at one
// pitch
export const LegendPanel = observer(function LegendPanel({
  model,
}: {
  model: GraphPaneModel
}) {
  const sections = legendSections(model)
  if (sections.length === 0) {
    return null
  }
  const rows = sections.flatMap(section => section.rows)
  const pitch = rowPitch(rows)
  const column = swatchColumn(rows)
  return (
    <div style={{ ...legendBoxStyle, lineHeight: `${pitch}px` }}>
      {sections.map(({ testid, rows, heading, spaced }, i) => (
        <Fragment key={testid}>
          {heading ? (
            <div
              style={{
                ...legendHeadingStyle,
                paddingTop: i === 0 ? 0 : HEADING_GAP_PX,
              }}
            >
              {heading}
            </div>
          ) : null}
          <div
            data-testid={testid}
            style={spaced ? { paddingTop: HEADING_GAP_PX } : undefined}
          >
            {rows.map(row => (
              <LegendRowView
                key={row.key}
                row={row}
                column={column}
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
        </Fragment>
      ))}
    </div>
  )
})
