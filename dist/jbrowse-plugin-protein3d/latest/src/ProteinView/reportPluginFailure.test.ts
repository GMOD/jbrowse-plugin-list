import { destroy, types } from '@jbrowse/mobx-state-tree'
import { afterEach, expect, test, vi } from 'vitest'

import { reportFigureNotices, reportPluginFailure } from './reportPluginFailure'

import type { FigureNoticeKind } from './reportPluginFailure'

function noPlugin(): object | undefined {
  return undefined
}

const Host = types
  .model('Host', {})
  .volatile(() => ({
    molstarPluginContext: noPlugin(),
    errors: new Array<unknown>(),
    figureNotices: new Array<[FigureNoticeKind, readonly string[]]>(),
  }))
  .actions(self => ({
    setPlugin(plugin?: object) {
      self.molstarPluginContext = plugin
    },
    addNotice(error: unknown) {
      self.errors.push(error)
    },
    setFigureNotices(kind: FigureNoticeKind, notices: readonly string[]) {
      self.figureNotices.push([kind, notices])
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

test('figure notices replace their kind only while their plugin is the view’s', () => {
  const plugin = {}
  const host = Host.create()
  host.setPlugin(plugin)
  const report = reportFigureNotices(host, plugin, 'marks')
  report(['mark A:999 is not in the structure'])
  expect(host.figureNotices).toEqual([
    ['marks', ['mark A:999 is not in the structure']],
  ])
  host.setPlugin({})
  report(['mark B:1 is not in the structure'])
  expect(host.figureNotices).toHaveLength(1)
  expect(consoleError).not.toHaveBeenCalled()
})
