import { useEffect, useRef, useState } from 'react'

import { isAlive } from '@jbrowse/mobx-state-tree'

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
  const pluginRef = useRef<PluginContext | null>(null)
  const [error, setError] = useState<unknown>()
  const [loading, setLoading] = useState(true)

  // Create the Mol* plugin once on mount. showControls is intentionally NOT a
  // dependency: toggling it is applied at runtime in the effect below via
  // Layout.Update, rather than tearing down and rebuilding the entire WebGL
  // plugin (which leaks a GPU context and reloads every structure each toggle).
  useEffect(() => {
    const state: {
      cancelled: boolean
      plugin?: PluginContext
      host?: HTMLDivElement
    } = { cancelled: false }
    void (async () => {
      try {
        if (!parentRef.current) {
          return
        }
        const {
          GeometryExport,
          MAQualityAssessment,
          PluginConfig,
          PluginSpec,
          DefaultPluginUISpec,
          createPluginUI,
          renderReact18,
        } = await loadMolstar()

        const host = document.createElement('div')
        parentRef.current.append(host)
        state.host = host
        const defaultSpec = DefaultPluginUISpec()
        const created = await createPluginUI({
          target: host,
          render: renderReact18,
          spec: {
            ...DefaultPluginUISpec(),
            behaviors: [
              ...defaultSpec.behaviors,
              PluginSpec.Behavior(GeometryExport),
              // Parses per-residue pLDDT from AlphaFold mmCIF and registers the
              // 'plddt-confidence' color theme used by the color-scheme menu.
              PluginSpec.Behavior(MAQualityAssessment),
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
          created.dispose()
          host.remove()
        } else {
          state.plugin = created
          pluginRef.current = created
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
      pluginRef.current = null
      // Drop the stale reference before disposing so model autoruns don't act
      // on a torn-down plugin.
      if (model && isAlive(model)) {
        model.setMolstarPluginContext(undefined)
      }
      // dispose() (not unmount()) is what frees the WebGL context, canvas3d and
      // GPU buffers; unmount() is a no-op on the createPluginUI path. Mirrors
      // Mol*'s own Viewer.dispose().
      state.plugin?.dispose()
      state.host?.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show/hide the Mol* controls panel at runtime without rebuilding the plugin.
  useEffect(() => {
    const state = { cancelled: false }
    void (async () => {
      const plugin = pluginRef.current
      if (plugin) {
        const { PluginCommands } = await loadMolstar()
        if (!state.cancelled) {
          await PluginCommands.Layout.Update(plugin, {
            state: { showControls },
          })
        }
      }
    })()
    return () => {
      state.cancelled = true
    }
  }, [showControls])

  return { parentRef, error, loading }
}
