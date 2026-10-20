import { destroy, types } from '@jbrowse/mobx-state-tree'
import { afterEach, expect, test, vi } from 'vitest'

import { reportPluginFailure } from './reportPluginFailure'

function noPlugin(): object | undefined {
  return undefined
}

const Host = types
  .model('Host', {})
  .volatile(() => ({
    molstarPluginContext: noPlugin(),
    errors: new Array<unknown>(),
  }))
  .actions(self => ({
    setPlugin(plugin?: object) {
      self.molstarPluginContext = plugin
    },
    setError(error: unknown) {
      self.errors.push(error)
    },
  }))

const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

afterEach(() => {
  consoleError.mockClear()
})

test('a failure on the current plugin reaches the view and the console', () => {
  const plugin = {}
  const host = Host.create()
  host.setPlugin(plugin)
  const error = new Error('commit failed')
  reportPluginFailure(host, plugin)(error)
  expect(host.errors).toEqual([error])
  expect(consoleError).toHaveBeenCalledWith(error)
})

test('a failure on a plugin swapped away reaches the console alone', () => {
  const plugin = {}
  const host = Host.create()
  host.setPlugin(plugin)
  const report = reportPluginFailure(host, plugin)
  host.setPlugin(undefined)
  report(new Error('disposed'))
  expect(host.errors).toEqual([])
  expect(consoleError).toHaveBeenCalledTimes(1)
})

test('a failure after the view is destroyed reaches the console alone', () => {
  const plugin = {}
  const host = Host.create()
  host.setPlugin(plugin)
  const report = reportPluginFailure(host, plugin)
  destroy(host)
  expect(() => {
    report(new Error('destroyed'))
  }).not.toThrow()
  expect(consoleError).toHaveBeenCalledTimes(1)
})
