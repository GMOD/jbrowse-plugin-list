import React, { useState } from 'react'

import { Tooltip } from '@mui/material'
import { observer } from 'mobx-react'

import { HOVERED_BORDER, SELECTED_BORDER } from '../constants'

import type { JBrowsePluginProteinStructureModel } from '../model'

/** `248` for one residue, `245-250` for several */
export function rangeText(first: number, last: number) {
  return first === last ? `${first}` : `${first}-${last}`
}

/**
 * ArrowLeft and ArrowRight move focus to the neighbouring bar of the track, in
 * residue order, whichever order the bars were drawn in.
 */
export function moveBarFocus(event: React.KeyboardEvent<HTMLElement>) {
  const step =
    event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
  if (step !== 0) {
    const bars = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('[data-range-bar]'),
    ].toSorted(
      (a, b) => Number(a.dataset.rangeBar) - Number(b.dataset.rangeBar),
    )
    const next = bars[bars.findIndex(bar => bar === event.target) + step]
    if (next) {
      event.preventDefault()
      next.focus()
    }
  }
}

/**
 * The bars of one track, one tab stop among them (see RangeBar's `tabStop`)
 * and arrow keys between them, so a keyboard passes a track of 1,400 natural
 * variants with one Tab.
 */
export const RangeBarTrack = observer(function RangeBarTrack({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'contents' }} onKeyDown={moveBarFocus}>
      {children}
    </div>
  )
})

/**
 * One bar over a run of alignment columns, `alignmentEnd` inclusive: a UniProt
 * feature or an alignment domain. Hovering it, or reaching it by keyboard,
 * lights its columns, and a click, Enter or Space does what `onClick` says.
 * Only the track's `tabStop` bar is in the tab order; see RangeBarTrack.
 */
const RangeBar = observer(function RangeBar({
  alignmentStart,
  alignmentEnd,
  top,
  height,
  color,
  selected,
  tabStop,
  tooltip,
  ariaLabel,
  dataAttributes,
  onClick,
  model,
}: {
  alignmentStart: number
  alignmentEnd: number
  top: number | string
  height: string
  color: string | undefined
  selected: boolean
  tabStop: boolean
  tooltip: React.ReactNode
  ariaLabel: string
  dataAttributes: Record<`data-${string}`, string | number | undefined>
  onClick: () => void
  model: JBrowsePluginProteinStructureModel
}) {
  const [lit, setLit] = useState<'pointer' | 'keyboard'>()
  const { columnWidth } = model
  const enter = (by: 'pointer' | 'keyboard') => {
    setLit(by)
    model.setAlignmentHoverRange({ start: alignmentStart, end: alignmentEnd })
  }
  const leave = () => {
    setLit(undefined)
    model.setAlignmentHoverRange(undefined)
  }
  return (
    <Tooltip title={tooltip} followCursor disableFocusListener>
      <div
        {...dataAttributes}
        data-range-bar={alignmentStart}
        role="button"
        tabIndex={tabStop ? 0 : -1}
        aria-label={ariaLabel}
        aria-pressed={selected}
        onClick={onClick}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick()
          }
        }}
        onMouseEnter={() => {
          enter('pointer')
        }}
        onMouseLeave={leave}
        onFocus={event => {
          if (event.currentTarget.matches(':focus-visible')) {
            enter('keyboard')
          }
        }}
        onBlur={() => {
          if (lit === 'keyboard') {
            leave()
          }
        }}
        style={{
          position: 'absolute',
          left: alignmentStart * columnWidth,
          top,
          width: (alignmentEnd - alignmentStart + 1) * columnWidth,
          height,
          backgroundColor: color,
          opacity: lit || selected ? 0.9 : 0.6,
          cursor: 'pointer',
          borderRadius: 2,
          border: selected ? SELECTED_BORDER : lit ? HOVERED_BORDER : 'none',
          boxSizing: 'border-box',
        }}
      />
    </Tooltip>
  )
})

export default RangeBar
