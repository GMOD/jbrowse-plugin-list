import React, { useEffect } from 'react'

import { ErrorMessage, LoadingEllipses, ResizeHandle } from '@jbrowse/core/ui'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'

import ManualAlignmentDialog from './ManualAlignmentDialog'
import ProteinViewHeader from './ProteinViewHeader'
import css from '../css/molstar'
import useProteinView from '../useProteinView'

import type { JBrowsePluginProteinViewModel } from '../model'

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
    const disposer = autorun(() => {
      model.setMolstarPluginContext(plugin)
    })
    return () => {
      disposer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plugin])

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
