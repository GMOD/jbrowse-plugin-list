import { autorun, observable, runInAction } from 'mobx'
import { Camera } from 'molstar/lib/mol-canvas3d/camera'
import { Canvas3DParams } from 'molstar/lib/mol-canvas3d/canvas3d'
import { Vec3 } from 'molstar/lib/mol-math/linear-algebra/3d/vec3'
import { ParamDefinition } from 'molstar/lib/mol-util/param-definition'
import { expect, test, vi } from 'vitest'

import { keepSavedCamera, liveCamera } from './savedCamera'

import type { SavedCamera } from './savedCamera'
import type {
  Canvas3D,
  Canvas3DCameraResetOptions,
  Canvas3DProps,
} from 'molstar/lib/mol-canvas3d/canvas3d'

vi.mock('./loadMolstar', async () => {
  const { Canvas3DParams } = await import('molstar/lib/mol-canvas3d/canvas3d')
  const { Vec3 } = await import('molstar/lib/mol-math/linear-algebra')
  return { default: async () => ({ Canvas3DParams, Vec3 }) }
})

/**
 * Mol*'s canvas as a camera sees it: its default props, and a reset that
 * lays the requested snapshot over the camera's last state, as
 * resolveCameraReset does, so a fog or clipping a snapshot leaves out
 * carries over.
 */
function standInCanvas() {
  let props: Canvas3DProps = ParamDefinition.getDefaultValues(Canvas3DParams)
  let state = Camera.createDefaultSnapshot()
  return {
    get props() {
      return props
    },
    get state() {
      return state
    },
    setProps(change: Parameters<Canvas3D['setProps']>[0]) {
      if (typeof change !== 'function') {
        props = { ...props, camera: { ...props.camera, ...change.camera } }
      }
    },
    requestCameraReset(options?: Canvas3DCameraResetOptions) {
      const snapshot = options?.snapshot
      if (snapshot && typeof snapshot !== 'function') {
        state = Camera.copySnapshot(
          Camera.copySnapshot(Camera.createDefaultSnapshot(), state),
          snapshot,
        )
      }
    },
  }
}

function keptView(camera: SavedCamera | undefined) {
  const canvas = standInCanvas()
  const view = observable(
    { plugin: { canvas3d: canvas }, camera, settled: true },
    { plugin: false },
  )
  const failures: unknown[] = []
  const dispose = autorun(
    keepSavedCamera(view, () => e => {
      failures.push(e)
    }),
  )
  return { canvas, view, failures, dispose }
}

const CLIPPED: SavedCamera = {
  position: [0, 0, 50],
  target: [0, 0, 0],
  up: [0, 1, 0],
  radius: 8,
  mode: 'orthographic',
}

function settle() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

test('a fixed camera turns off automatic framing and, with a radius, the fog', async () => {
  const { canvas, dispose } = keptView(CLIPPED)
  await settle()
  expect(canvas.props.camera.manualReset).toBe(true)
  expect(canvas.state.fog).toBe(0)
  expect(canvas.state.radius).toBe(8)
  dispose()
})

// a reset leaves the fog the clipped camera set, so clearing the camera has
// to put the canvas's own back along with Mol*'s framing and projection
test("clearing the camera hands Mol* back its framing, projection and the canvas's fog", async () => {
  const { canvas, view, failures, dispose } = keptView(CLIPPED)
  await settle()
  runInAction(() => {
    view.camera = undefined
  })
  await settle()
  const { cameraFog, cameraClipping } = canvas.props
  expect(cameraFog.name).toBe('on')
  expect(canvas.state.fog).toBe(
    cameraFog.name === 'on' ? cameraFog.params.intensity : 0,
  )
  expect(canvas.state.fog).toBeGreaterThan(0)
  expect(canvas.state.clipFar).toBe(cameraClipping.far)
  expect(canvas.props.camera.manualReset).toBe(
    Canvas3DParams.camera.defaultValue.manualReset,
  )
  expect(canvas.props.camera.manualReset).toBe(false)
  expect(canvas.props.camera.mode).toBe(Canvas3DParams.camera.defaultValue.mode)
  expect(failures).toEqual([])
  dispose()
})

test('a camera without a radius keeps the fog a clipped one turned off', async () => {
  const { canvas, view, dispose } = keptView(CLIPPED)
  await settle()
  runInAction(() => {
    view.camera = { ...CLIPPED, radius: undefined }
  })
  await settle()
  expect(canvas.state.fog).toBeGreaterThan(0)
  expect(canvas.props.camera.manualReset).toBe(true)
  dispose()
})

test('a view that never fixed a camera leaves the canvas alone', async () => {
  const { canvas, view, dispose } = keptView(undefined)
  const reset = vi.spyOn(canvas, 'requestCameraReset')
  runInAction(() => {
    view.settled = false
  })
  await settle()
  expect(reset).not.toHaveBeenCalled()
  dispose()
})

test('a camera waits for every structure to load', async () => {
  const { canvas, view, dispose } = keptView(CLIPPED)
  await settle()
  runInAction(() => {
    view.settled = false
  })
  const reset = vi.spyOn(canvas, 'requestCameraReset')
  runInAction(() => {
    view.camera = { ...CLIPPED, radius: 4 }
  })
  await settle()
  expect(reset).not.toHaveBeenCalled()
  runInAction(() => {
    view.settled = true
  })
  await settle()
  expect(canvas.state.radius).toBe(4)
  dispose()
})

function canvasAt(snapshot: Partial<Camera.Snapshot>, sceneRadius: number) {
  return {
    camera: {
      state: Camera.copySnapshot(Camera.createDefaultSnapshot(), snapshot),
    },
    boundingSphereVisible: { radius: sceneRadius },
  }
}

test('the live camera reads back as plain triples', () => {
  expect(
    liveCamera(
      canvasAt(
        {
          mode: 'orthographic',
          position: Vec3.create(74.7, 116.7, -65.4),
          target: Vec3.create(91.1, 94.2, -46.2),
          up: Vec3.create(0, 0, 1),
          radius: 8,
        },
        40,
      ),
    ),
  ).toEqual({
    mode: 'orthographic',
    position: [74.7, 116.7, -65.4],
    target: [91.1, 94.2, -46.2],
    up: [0, 0, 1],
    radius: 8,
  })
})

// a camera without a radius clips to the scene's, so that radius is the
// default a saved camera leaves out, and with it the fog stays on
test('a camera that clips to the whole scene saves no radius', () => {
  expect(liveCamera(canvasAt({ radius: 40 }, 40))).not.toHaveProperty('radius')
})
