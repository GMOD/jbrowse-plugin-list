import React, { useEffect } from 'react'

import { ErrorMessage, LoadingEllipses, ResizeHandle } from '@jbrowse/core/ui'
import { observer } from 'mobx-react'

import { JBrowsePluginProteinViewModel } from '../model'
import ManualAlignmentDialog from './ManualAlignmentDialog'
import ProteinViewHeader from './ProteinViewHeader'
import css from '../css/molstar'
import useProteinView from '../useProteinView'

const style = document.createElement('style')
style.append(css)
document.head.append(style)

const ProteinView = observer(function ProteinView({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const { showControls } = model
  const { plugin, parentRef, error, loading } = useProteinView({
    showControls,
  })

  useEffect(() => {
    model.setMolstarPluginContext(plugin)
  }, [plugin, model])

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

const ProteinViewContainer = observer(function ProteinViewContainer({
  model,
  parentRef,
  loading,
}: {
  model: JBrowsePluginProteinViewModel
  parentRef?: React.RefObject<HTMLDivElement | null>
  loading?: boolean
}) {
  const { width, height, error } = model

  return (
    <div style={{ background: '#ccc' }}>
      {error ? <ErrorMessage error={error} /> : null}
      {loading ? (
        <LoadingEllipses message="Loading protein viewer" />
      ) : (
        <ProteinViewHeader model={model} />
      )}
      <div
        ref={parentRef}
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
