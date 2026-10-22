import { expect, test, vi } from 'vitest'

import { applyFigureStyle } from './figureStyle'

import type { PluginContext } from 'molstar/lib/mol-plugin/context'

function fakePlugin() {
  const setProps = vi.fn()
  return {
    plugin: { canvas3d: { setProps } } as unknown as PluginContext,
    setProps,
  }
}
const Color = (hex: number) => hex

test('both effects off leave outline and occlusion off', () => {
  const { plugin, setProps } = fakePlugin()
  applyFigureStyle(plugin, Color, { silhouettes: false, occlusion: false })
  expect(setProps).toHaveBeenCalledWith({
    postprocessing: {
      outline: { name: 'off', params: {} },
      occlusion: { name: 'off', params: {} },
    },
  })
})

test('silhouettes turn the outline on, occlusion the ambient occlusion', () => {
  const { plugin, setProps } = fakePlugin()
  applyFigureStyle(plugin, Color, { silhouettes: true, occlusion: true })
  const { postprocessing } = setProps.mock.calls[0]![0] as {
    postprocessing: {
      outline: { name: string; params: { includeTransparent: boolean } }
      occlusion: { name: string; params: { samples: number; radius: number } }
    }
  }
  expect(postprocessing.outline.name).toBe('on')
  expect(postprocessing.outline.params.includeTransparent).toBe(true)
  expect(postprocessing.occlusion.name).toBe('on')
  expect(postprocessing.occlusion.params).toMatchObject({
    samples: 32,
    radius: 5,
  })
})

test('a plugin with no canvas is left alone', () => {
  applyFigureStyle({} as PluginContext, Color, {
    silhouettes: true,
    occlusion: true,
  })
})
