import type loadMolstar from './loadMolstar'
import type { Camera } from 'molstar/lib/mol-canvas3d/camera'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

type Molstar = Awaited<ReturnType<typeof loadMolstar>>
type Triple = [number, number, number]

/**
 * A camera a session or figure fixes, in the structure's own coordinates:
 * where the eye sits, what it looks at and which way is up. `radius` clips
 * the scene to a slab that deep either side of the target, so a filament
 * seen down its axis shows one rung; `mode` defaults to perspective.
 */
export interface SavedCamera {
  position: Triple
  target: Triple
  up: Triple
  radius?: number
  mode?: Camera.Mode
}

export function applySavedCamera(
  plugin: PluginContext,
  molstar: Molstar,
  { position, target, up, radius, mode = 'perspective' }: SavedCamera,
) {
  const { Vec3 } = molstar
  plugin.canvas3d?.setProps({ camera: { mode, manualReset: true } })
  plugin.canvas3d?.requestCameraReset({
    snapshot: {
      mode,
      position: Vec3.create(...position),
      target: Vec3.create(...target),
      up: Vec3.create(...up),
      ...(radius === undefined
        ? {}
        : { radius, radiusMax: radius, clipFar: true, fog: 0 }),
    },
  })
}
