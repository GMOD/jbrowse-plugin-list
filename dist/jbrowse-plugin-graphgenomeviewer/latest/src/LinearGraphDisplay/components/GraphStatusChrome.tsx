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
import { observer } from 'mobx-react'

import type { LinearGraphDisplayModel } from '../model'
import type { DisplayStatusPhase } from '@jbrowse/render-core/displayPhase'

const muiOverlays = {
  TooLarge: TooLargeMessage,
  ErrorBar: DisplayErrorBar,
  Loading: DisplayLoadingOverlay,
  BackgroundProgress: DisplayBackgroundProgress,
}

const ZOOM_IN_ADVICE =
  'Zoom in to see features, or force load this track for the rest of the session (may be slow)'
const FORCE_LOAD_ADVICE =
  'Force load this track for the rest of the session (may be slow)'

// Hosts before the plain-props overlay change (jbrowse-components 3a5393f5a6)
// read `model` and `visible`; later hosts read values and callbacks. Each
// overlay gets both, so one build runs on either.
function overlayProps(model: LinearGraphDisplayModel) {
  const { error } = model
  const regionTooLarge =
    error instanceof Error &&
    (error as { regionTooLarge?: unknown }).regionTooLarge === true
  return {
    error: {
      error,
      onRetry: regionTooLarge
        ? undefined
        : () => {
            model.reload()
          },
    },
    tooLarge: {
      message: [
        model.regionTooLargeReason,
        model.zoomCanReleaseGate ? ZOOM_IN_ADVICE : FORCE_LOAD_ADVICE,
      ]
        .filter(Boolean)
        .join('. '),
      onForceLoad: () => {
        model.forceLoad()
      },
    },
    loading: {
      message: model.statusMessage,
      progress: model.statusProgress,
      canceled: model.fetchCanceled,
      onCancel: () => {
        model.cancelFetchByUser()
      },
      onRetry: () => {
        model.reload()
      },
    },
    background: {
      message: model.statusMessage,
      progress: model.statusProgress,
    },
  }
}

/**
 * The status chrome of a display that owns its canvas: the zoom-in notice in
 * place of the display, and the error bar, loading overlay and progress chip
 * over it in the track's overlay layer. Core's `DisplayStatusChrome` drew this
 * until jbrowse-web main removed it on 2026-10-08 (d8db736896), and its named
 * import came back undefined there, failing the track with React error #130.
 * Built here from the overlays every host from 5.0.0-beta.11 serves.
 */
export default observer(function GraphStatusChrome({
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
  const props = overlayProps(model)
  const attributes = {
    ...dataProps,
    'data-testid': testid,
    'data-display-id': model.configuration.displayId,
    'data-display-drawn': drawn,
    'data-display-phase': phase,
  }
  if (phase === 'tooLarge') {
    return (
      <div style={{ display: 'contents' }} {...attributes}>
        <TrackOverlayPortal>
          <div style={{ pointerEvents: 'auto' }}>
            <TooLarge model={model} {...props.tooLarge} />
          </div>
        </TrackOverlayPortal>
      </div>
    )
  }
  return (
    <div
      style={{ position: 'relative', height: model.height, ...style }}
      {...attributes}
    >
      <BottomRightCornerContext value={corner}>
        {children}
      </BottomRightCornerContext>
      <TrackOverlayPortal>
        {/* a backend's render error is the canvas's banner, whose retry
        rebuilds the backend */}
        {phase === 'error' && model.error !== undefined ? (
          <ErrorBar model={model} visible {...props.error} />
        ) : null}
        <Loading
          model={model}
          {...props.loading}
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
          {phase === 'ready' && model.statusMessage ? (
            <BackgroundProgress model={model} visible {...props.background} />
          ) : null}
        </div>
      </TrackOverlayPortal>
    </div>
  )
})
