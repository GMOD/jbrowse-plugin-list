import React, { useMemo, useRef } from 'react'

import { observer } from 'mobx-react'

import { CHAR_WIDTH } from '../constants'
import { throttle } from './throttle'

import type { JBrowsePluginProteinStructureModel } from '../model'

const CharacterSpans = observer(function CharacterSpans({
  str,
}: {
  str: string
}) {
  return str.split('').map((char, i) => (
    <span
      key={i}
      style={{
        position: 'absolute',
        left: i * CHAR_WIDTH,
        width: CHAR_WIDTH,
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))
})

const MatchOverlays = observer(function MatchOverlays({
  model,
  height,
}: {
  model: JBrowsePluginProteinStructureModel
  height: number
}) {
  const { showHighlight, alignmentMatchSet } = model
  return !showHighlight || !alignmentMatchSet
    ? null
    : [...alignmentMatchSet].map(i => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: i * CHAR_WIDTH,
            top: 0,
            width: CHAR_WIDTH,
            height,
            background: '#33ff19a0',
            pointerEvents: 'none',
          }}
        />
      ))
})

const HoverHighlight = observer(function HoverHighlight({
  model,
  strLength,
  height,
}: {
  model: JBrowsePluginProteinStructureModel
  strLength: number
  height: number
}) {
  const { alignmentHoverPos } = model
  const showHoverHighlight =
    alignmentHoverPos !== undefined &&
    alignmentHoverPos >= 0 &&
    alignmentHoverPos < strLength

  return !showHoverHighlight ? null : (
    <span
      style={{
        position: 'absolute',
        left: alignmentHoverPos * CHAR_WIDTH,
        top: 0,
        width: CHAR_WIDTH,
        height,
        background: '#f698',
        pointerEvents: 'none',
      }}
    />
  )
})

const RangeHighlight = observer(function RangeHighlight({
  range,
  strLength,
  background,
  border,
  height,
}: {
  range: { start: number; end: number } | undefined
  strLength: number
  background: string
  border?: string
  height: number
}) {
  if (!range) {
    return null
  }
  const { start, end } = range
  const clampedStart = Math.max(0, start)
  const clampedEnd = Math.min(strLength - 1, end)
  if (clampedStart > clampedEnd) {
    return null
  }
  const width = (clampedEnd - clampedStart + 1) * CHAR_WIDTH

  return (
    <span
      style={{
        position: 'absolute',
        left: clampedStart * CHAR_WIDTH,
        top: 0,
        width,
        height,
        background,
        border,
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    />
  )
})

// eslint-disable-next-line react-refresh/only-export-components
export const AlignmentHighlights = observer(function AlignmentHighlights({
  model,
  strLength,
  height,
}: {
  model: JBrowsePluginProteinStructureModel
  strLength: number
  height: number
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: strLength * CHAR_WIDTH,
        height,
        pointerEvents: 'none',
      }}
    >
      <MatchOverlays model={model} height={height} />
      <RangeHighlight
        range={model.clickAlignmentRange}
        strLength={strLength}
        background="rgba(0, 120, 255, 0.3)"
        border="1px solid rgba(0, 120, 255, 0.6)"
        height={height}
      />
      <RangeHighlight
        range={model.alignmentHoverRange}
        strLength={strLength}
        background="rgba(255, 165, 0, 0.4)"
        height={height}
      />
      <HoverHighlight model={model} strLength={strLength} height={height} />
    </div>
  )
})

const SplitString = observer(function SplitString({
  model,
  str,
}: {
  model: JBrowsePluginProteinStructureModel
  str: string
}) {
  const containerRef = useRef<HTMLSpanElement>(null)

  const handleMouseMove = useMemo(
    () =>
      throttle((e: React.MouseEvent) => {
        const container = containerRef.current
        if (!container) {
          return
        }
        const rect = container.getBoundingClientRect()
        const x = e.clientX - rect.left
        const index = Math.floor(x / CHAR_WIDTH)
        if (index >= 0 && index < str.length) {
          model.hoverAlignmentPosition(index)
        }
      }, 16),
    [str.length, model],
  )

  const handleClick = useMemo(
    () => (e: React.MouseEvent) => {
      const container = containerRef.current
      if (!container) {
        return
      }
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const index = Math.floor(x / CHAR_WIDTH)
      if (index >= 0 && index < str.length) {
        model.clickAlignmentPosition(index)
      }
    },
    [str.length, model],
  )

  return (
    <span
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: str.length * CHAR_WIDTH,
        height: '1em',
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <CharacterSpans str={str} />
    </span>
  )
})

export default SplitString
