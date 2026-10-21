import type { PluginContext } from 'molstar/lib/mol-plugin/context'

/**
 * Silhouettes around every object and stronger contact shading, the look a
 * published structure figure has (ChimeraX's silhouettes and soft lighting).
 */
export function applyFigureStyle(
  plugin: PluginContext,
  Color: (hex: number) => number,
  on: boolean,
) {
  plugin.canvas3d?.setProps({
    postprocessing: {
      outline: on
        ? {
            name: 'on',
            params: {
              scale: 1,
              threshold: 0.33,
              color: Color(0x000000),
              includeTransparent: true,
            },
          }
        : { name: 'off', params: {} },
    },
  })
}
