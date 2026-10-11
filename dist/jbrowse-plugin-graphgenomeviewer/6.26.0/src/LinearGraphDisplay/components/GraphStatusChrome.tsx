import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import DisplayBackgroundProgress from '@jbrowse/display-kit/DisplayBackgroundProgress'
import DisplayErrorBar from '@jbrowse/display-kit/DisplayErrorBar'
import DisplayLoadingOverlay from '@jbrowse/display-kit/DisplayLoadingOverlay'
import TooLargeMessage from '@jbrowse/display-kit/TooLargeMessage'
import {
  BottomRightCornerContext,
  TrackOverlayPortal,
  useChromeOverlayOverride,
} from '@jbrowse/display-ui'

import type { LinearGraphDisplayModel } from '../model'
import type { DisplayStatusPhase } from '@jbrowse/render-core/displayPhase'

const muiOverlays = {
  TooLarge: TooLargeMessage,
  ErrorBar: DisplayErrorBar,
  Loading: DisplayLoadingOverlay,
  BackgroundProgress: DisplayBackgroundProgress,
}

/**
 * The status chrome of a display that owns its canvas: the zoom-in notice in
 * place of the display, and the error bar, loading overlay and progress chip
 * over it in the track's overlay layer. Core's `DisplayStatusChrome` drew this
 * until jbrowse-web main removed it on 2026-10-08 (d8db736896), and its named
 * import came back undefined there, failing the track with React error #130.
 * Built here from the overlays every host from 5.0.0-beta.11 serves.
 */
export default function GraphStatusChrome({
  model,
  phase,
  drawn,
  testid,
  style,
  children,
  ...dataProps
}: {
  model: LinearGraphDisplayModel
  phase: DisplayStatusPhase
  drawn: boolean
  testid: string
  style?: CSSProperties
  children: ReactNode
} & Record<`data-${string}`, unknown>) {
  const { TooLarge, ErrorBar, Loading, BackgroundProgress } =
    useChromeOverlayOverride() ?? muiOverlays
  const [corner, setCorner] = useState<HTMLDivElement | null>(null)
  const { displayId } = model.configuration
  if (phase === 'tooLarge') {
    return (
      <div
        style={{ display: 'contents' }}
        data-display-id={displayId}
        data-display-phase={phase}
      >
        <TrackOverlayPortal>
          <div style={{ pointerEvents: 'auto' }}>
            <TooLarge model={model} />
          </div>
        </TrackOverlayPortal>
      </div>
    )
  }
  return (
    <div
      {...dataProps}
      style={{ position: 'relative', height: model.height, ...style }}
      data-testid={testid}
      data-display-id={displayId}
      data-display-drawn={drawn}
      data-display-phase={phase}
    >
      <BottomRightCornerContext value={corner}>
        {children}
      </BottomRightCornerContext>
      <TrackOverlayPortal>
        <ErrorBar model={model} visible={phase === 'error'} />
        <Loading
          model={model}
          visible={phase === 'loading' || phase === 'canceled'}
          immediate={!drawn}
        />
        <div
          ref={setCorner}
          style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
            pointerEvents: 'none',
          }}
        >
          <BackgroundProgress model={model} visible={phase === 'ready'} />
        </div>
      </TrackOverlayPortal>
    </div>
  )
}
