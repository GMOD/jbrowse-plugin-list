import React from 'react'

import { ErrorMessage, LoadingEllipses, ResizeHandle } from '@jbrowse/core/ui'
import CloseIcon from '@mui/icons-material/Close'
import { IconButton } from '@mui/material'
import { observer } from 'mobx-react'

import ManualAlignmentDialog from './ManualAlignmentDialog'
import ProteinViewHeader from './ProteinViewHeader'
import useProteinView from '../useProteinView'

import type { JBrowsePluginProteinViewModel } from '../model'

const ProteinView = observer(function ProteinView({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const { showControls } = model
  const { parentRef, error, loading } = useProteinView({
    showControls,
    model,
  })

  if (error) {
    return <ErrorMessage error={error} />
  }
  return (
    <ProteinViewContainer
      model={model}
      parentRef={parentRef}
      loading={loading}
    />
  )
})

// A failed superposition or recolor is worth reporting, not worth wearing for
// the rest of the session, so the message can be dismissed.
const DismissableError = observer(function DismissableError({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const { error } = model
  return error ? (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <ErrorMessage error={error} />
      </div>
      <IconButton
        size="small"
        aria-label="Dismiss error"
        onClick={() => {
          model.setError(undefined)
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </div>
  ) : null
})

const ProteinViewContainer = observer(function ProteinViewContainer({
  model,
  parentRef,
  loading,
}: {
  model: JBrowsePluginProteinViewModel
  parentRef?: React.RefObject<HTMLDivElement | null>
  loading?: boolean
}) {
  const { width, height } = model

  // for screenshot and e2e tooling: Mol* is up and every structure has settled
  const ready = !loading && !model.showLoading

  return (
    <div
      style={{ background: '#ccc' }}
      data-testid={ready ? 'protein-view-ready' : 'protein-view-loading'}
    >
      <DismissableError model={model} />
      {loading ? (
        <LoadingEllipses message="Loading protein viewer" />
      ) : (
        <ProteinViewHeader model={model} />
      )}
      {/* Molstar mounts its own DOM inside here. Tagged so callers (and the
          e2e suite) can find the viewer without reaching for molstar's internal
          `msp-plugin` class names, which are not ours to depend on. */}
      <div
        ref={parentRef}
        data-testid="protein-view-molstar"
        style={{
          position: 'relative',
          width,
          height,
        }}
      />
      <ResizeHandle
        style={{ height: 4, background: 'grey' }}
        onDrag={delta => {
          return model.setHeight(model.height + delta)
        }}
      />
      <ManualAlignmentDialog model={model} />
    </div>
  )
})

export default ProteinView
