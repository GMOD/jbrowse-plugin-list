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

// Mol* being up says nothing about the structure: the fetch, the parse, the
// alignment and the SIFTS lookup all run afterwards, and used to run behind an
// empty grey canvas. Sits over the canvas rather than in it, and passes the
// pointer through, so nothing it covers stops responding.
const StructureLoadingOverlay = observer(function StructureLoadingOverlay({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const { loadingMessages } = model
  return loadingMessages.length > 0 ? (
    <div
      data-testid="protein-view-loading-overlay"
      style={{
        position: 'absolute',
        top: 8,
        left: 8,
        maxWidth: 'calc(100% - 16px)',
        padding: '2px 8px',
        borderRadius: 4,
        background: 'rgba(255,255,255,0.85)',
        color: '#000',
        pointerEvents: 'none',
      }}
    >
      {loadingMessages.map(({ id, message }) => (
        <LoadingEllipses key={id} message={message} />
      ))}
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
      <div style={{ position: 'relative', width, height }}>
        {/* Molstar mounts its own DOM inside here. Tagged so callers (and the
            e2e suite) can find the viewer without reaching for molstar's
            internal `msp-plugin` class names, which are not ours to depend
            on. */}
        <div
          ref={parentRef}
          data-testid="protein-view-molstar"
          style={{
            position: 'relative',
            width,
            height,
          }}
        />
        <StructureLoadingOverlay model={model} />
      </div>
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
