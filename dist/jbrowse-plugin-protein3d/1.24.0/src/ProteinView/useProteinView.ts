import { useEffect, useRef, useState } from 'react'

import { isAlive } from '@jbrowse/mobx-state-tree'

import loadMolstar from './loadMolstar'

import type { JBrowsePluginProteinViewModel } from './model'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

let cssInjected = false

function injectMolstarCss(css: string) {
  if (!cssInjected) {
    cssInjected = true
    const style = document.createElement('style')
    style.append(css)
    document.head.append(style)
  }
}

export default function useProteinView({
  showControls,
  model,
}: {
  showControls: boolean
  model: JBrowsePluginProteinViewModel
}) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [plugin, setPlugin] = useState<PluginContext>()
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
    // read through a call, which the compiler does not narrow across an await
    const isCancelled = () => state.cancelled
    void (async () => {
      let created: PluginContext | undefined
      try {
        const {
          Color,
          GeometryExport,
          MAQualityAssessment,
          PluginConfig,
          PluginSpec,
          DefaultPluginUISpec,
          createPluginUI,
          registerColorThemes,
          renderReact18,
          css,
        } = await loadMolstar()
        // the view can close or minimize while the Mol* chunk downloads
        const parent = parentRef.current
        if (isCancelled() || !parent) {
          return
        }
        injectMolstarCss(css)

        const host = document.createElement('div')
        parent.append(host)
        state.host = host
        const defaultSpec = DefaultPluginUISpec()
        created = await createPluginUI({
          target: host,
          render: renderReact18,
          spec: {
            ...defaultSpec,
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
        registerColorThemes(created)
        // molstar's default selection is a faint green tint that a green or
        // pLDDT cartoon swallows; solid magenta reads over every scheme
        created.canvas3d?.setProps({
          renderer: { selectColor: Color(0xff00ff), selectStrength: 1 },
          marking: { selectEdgeColor: Color(0xff00ff) },
        })
        if (isCancelled()) {
          created.dispose()
          host.remove()
        } else {
          state.plugin = created
          setPlugin(created)
          model.setMolstarPluginContext(created)
        }
      } catch (e) {
        if (created && state.plugin !== created) {
          created.dispose()
          state.host?.remove()
        }
        console.error(e)
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      state.cancelled = true
      // Drop the stale reference before disposing so model autoruns don't act
      // on a torn-down plugin.
      if (isAlive(model)) {
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
  // Depending on the plugin applies a toggle made while it was being created.
  useEffect(() => {
    const state = { cancelled: false }
    void (async () => {
      try {
        if (plugin) {
          const { PluginCommands } = await loadMolstar()
          if (!state.cancelled) {
            await PluginCommands.Layout.Update(plugin, {
              state: { showControls },
            })
          }
        }
      } catch (e) {
        console.error(e)
        if (isAlive(model)) {
          model.setError(e)
        }
      }
    })()
    return () => {
      state.cancelled = true
    }
  }, [plugin, showControls, model])

  return { parentRef, error, loading }
}
