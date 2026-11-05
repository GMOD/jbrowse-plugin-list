import loadMolstar from './loadMolstar'

import type { Camera } from 'molstar/lib/mol-canvas3d/camera'
import type {
  Canvas3D,
  Canvas3DParams,
  Canvas3DProps,
} from 'molstar/lib/mol-canvas3d/canvas3d'
import type { Vec3 as MolstarVec3 } from 'molstar/lib/mol-math/linear-algebra'

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

/** What fixing and releasing a camera needs of Mol*'s canvas. */
export type CameraCanvas = Pick<
  Canvas3D,
  'props' | 'setProps' | 'requestCameraReset'
>

/**
 * The fog and far clipping the canvas's own settings give a camera, which a
 * clipping radius turns off and a reset does not restore: Mol* carries both
 * over from the camera's last state.
 */
function canvasDepthCue({ cameraFog, cameraClipping }: Canvas3DProps) {
  return {
    fog: cameraFog.name === 'on' ? cameraFog.params.intensity : 0,
    clipFar: cameraClipping.far,
  }
}

export function applySavedCamera(
  canvas: CameraCanvas | undefined,
  { Vec3 }: { Vec3: typeof MolstarVec3 },
  { position, target, up, radius, mode = 'perspective' }: SavedCamera,
) {
  canvas?.setProps({ camera: { mode, manualReset: true } })
  canvas?.requestCameraReset({
    snapshot: {
      mode,
      position: Vec3.create(...position),
      target: Vec3.create(...target),
      up: Vec3.create(...up),
      ...(radius === undefined
        ? canvasDepthCue(canvas.props)
        : { radius, radiusMax: radius, clipFar: true, fog: 0 }),
    },
  })
}

/**
 * Hands the camera back to Mol*: its own projection and automatic framing,
 * so a structure loaded later is framed, and the canvas's fog and clipping,
 * then a reset onto the whole scene.
 */
export function releaseSavedCamera(
  canvas: CameraCanvas | undefined,
  params: { Canvas3DParams: typeof Canvas3DParams },
) {
  const { mode, manualReset } = params.Canvas3DParams.camera.defaultValue
  canvas?.setProps({ camera: { mode, manualReset } })
  canvas?.requestCameraReset({
    snapshot: { mode, ...canvasDepthCue(canvas.props) },
  })
}

/** What keeping a view's camera reads of the view. */
export interface CameraView<P extends { canvas3d?: CameraCanvas }> {
  readonly plugin: P | undefined
  readonly camera: SavedCamera | undefined
  /** every structure loaded, so the camera frames them all */
  readonly settled: boolean
}

/**
 * The body of the reaction that keeps a view's fixed camera on its canvas:
 * applied once every structure has loaded, and when the view's camera is
 * cleared while the canvas still holds one, handed back to Mol*. The canvas
 * says whether it holds one, so an undo or a snapshot clearing the camera
 * releases it as applyFigure does.
 */
export function keepSavedCamera<P extends { canvas3d?: CameraCanvas }>(
  view: CameraView<P>,
  onFailure: (plugin: P) => (error: unknown) => void,
) {
  return () => {
    const { plugin, camera } = view
    const canvas = plugin?.canvas3d
    if (plugin && camera && view.settled) {
      loadMolstar()
        .then(molstar => {
          applySavedCamera(canvas, molstar, camera)
        })
        .catch(onFailure(plugin))
    } else if (plugin && !camera && canvas?.props.camera.manualReset) {
      loadMolstar()
        .then(molstar => {
          releaseSavedCamera(canvas, molstar)
        })
        .catch(onFailure(plugin))
    }
  }
}

function tripleOf(vector: ArrayLike<number>): Triple {
  const [x, y, z] = Array.from(vector)
  if (x === undefined || y === undefined || z === undefined) {
    throw new Error(`a camera vector has ${vector.length} components, not 3`)
  }
  return [x, y, z]
}

/** What the camera reading needs of Mol*'s canvas. */
export interface LiveCanvas {
  camera: { state: Readonly<Camera.Snapshot> }
  boundingSphereVisible: { radius: number }
}

/**
 * The camera on screen as a SavedCamera, so applying it puts the eye back.
 * Mol* always clips to `radius` around the target; it is left out when that is
 * the visible scene's own radius, which is what a camera without one gets, so
 * the fog a whole-scene view draws survives the round trip.
 */
export function liveCamera(canvas: LiveCanvas): SavedCamera {
  const { position, target, up, radius, mode } = canvas.camera.state
  const sceneRadius = canvas.boundingSphereVisible.radius
  return {
    position: tripleOf(position),
    target: tripleOf(target),
    up: tripleOf(up),
    mode,
    ...(Math.abs(radius - sceneRadius) <= 1e-6 * Math.max(sceneRadius, 1)
      ? {}
      : { radius }),
  }
}
