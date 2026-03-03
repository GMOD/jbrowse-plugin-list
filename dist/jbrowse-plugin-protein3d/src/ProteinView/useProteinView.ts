import { useEffect, useRef, useState } from 'react'

import loadMolstar from './loadMolstar'

import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export default function useProteinView({
  showControls,
}: {
  showControls: boolean
}) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [plugin, setPlugin] = useState<PluginContext>()
  const [error, setError] = useState<unknown>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let p: PluginContext | undefined
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ;(async () => {
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
        p = await createPluginUI({
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
        await p.initialized
        setPlugin(p)
      } catch (e) {
        console.error(e)
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      p?.unmount()
    }
  }, [showControls])

  return { parentRef, error, plugin, loading }
}
