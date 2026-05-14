import { useEffect, useRef, useState } from 'react'

import loadMolstar from './loadMolstar'

import type { JBrowsePluginProteinViewModel } from './model'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export default function useProteinView({
  showControls,
  model,
}: {
  showControls: boolean
  model?: JBrowsePluginProteinViewModel
}) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<unknown>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const state: { cancelled: boolean; plugin?: PluginContext } = {
      cancelled: false,
    }
    void (async () => {
      try {
        if (!parentRef.current) {
          return
        }
        const {
          GeometryExport,
          PluginConfig,
          PluginSpec,
          DefaultPluginUISpec,
          createPluginUI,
          renderReact18,
        } = await loadMolstar()

        const d = document.createElement('div')
        parentRef.current.append(d)
        const defaultSpec = DefaultPluginUISpec()
        const created = await createPluginUI({
          target: d,
          render: renderReact18,
          spec: {
            ...DefaultPluginUISpec(),
            behaviors: [
              ...defaultSpec.behaviors,
              PluginSpec.Behavior(GeometryExport),
            ],
            layout: {
              initial: {
                controlsDisplay: 'reactive',
                showControls,
              },
            },
            config: [[PluginConfig.Viewport.ShowExpand, false]],
          },
        })
        await created.initialized
        if (state.cancelled) {
          created.unmount()
        } else {
          state.plugin = created
          model?.setMolstarPluginContext(created)
        }
      } catch (e) {
        console.error(e)
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      state.cancelled = true
      state.plugin?.unmount()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showControls])

  return { parentRef, error, loading }
}
