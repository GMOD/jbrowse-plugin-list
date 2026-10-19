import { autorun, observable, runInAction } from 'mobx'
import { expect, test, vi } from 'vitest'

import { makeVariantEffectLoader } from './variantEffectLoader'
import { alphaMissenseAsk } from './variantEffectSource'

import type {
  VariantEffectAsk,
  VariantEffectState,
} from './variantEffectLoader'
import type { VariantEffectRequest } from './variantEffectSource'
import type { VariantEffectValues } from './variantEffects'

function deferred() {
  let resolve: (values: VariantEffectValues) => void = () => {}
  let reject: (error: unknown) => void = () => {}
  const promise = new Promise<VariantEffectValues>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

interface TestHost {
  variantEffectAsk: VariantEffectAsk | undefined
  variantEffects: VariantEffectState | undefined
  alive: boolean
  setVariantEffects(state: VariantEffectState | undefined): void
}

function makeHost(ask?: VariantEffectAsk) {
  // held by reference, as an MST volatile holds them
  const host = observable<TestHost>(
    {
      variantEffectAsk: ask,
      variantEffects: undefined,
      alive: true,
      setVariantEffects(state: VariantEffectState | undefined) {
        host.variantEffects = state
      },
    },
    undefined,
    { deep: false },
  )
  return host
}

function start(
  host: ReturnType<typeof makeHost>,
  fetchValues: (request: VariantEffectRequest) => Promise<VariantEffectValues>,
) {
  return autorun(makeVariantEffectLoader(host, () => host.alive, fetchValues))
}

function ask(uniprotId: string) {
  return alphaMissenseAsk({ uniprotId, isLoading: false })
}

const values: VariantEffectValues = {
  numbering: 'uniprot',
  sequence: 'V',
  byPosition: new Map([[600, 0.95]]),
}

test('asks once the scheme wants something, and keeps the answer', async () => {
  const host = makeHost()
  const fetchValues = vi.fn(async () => values)
  const dispose = start(host, fetchValues)
  expect(fetchValues).not.toHaveBeenCalled()
  runInAction(() => {
    host.variantEffectAsk = ask('P15056')
  })
  expect(host.variantEffects).toEqual({ key: 'alphamissense:P15056' })
  await vi.waitFor(() => {
    expect(host.variantEffects?.values).toBe(values)
  })
  expect(fetchValues).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ scheme: 'alphamissense', accession: 'P15056' }),
  )
  dispose()
})

test('asks nothing while waiting or when nothing can be asked', () => {
  const host = makeHost({ status: 'waiting' })
  const fetchValues = vi.fn(async () => values)
  const dispose = start(host, fetchValues)
  runInAction(() => {
    host.variantEffectAsk = { status: 'unavailable', reason: 'no entry' }
  })
  expect(fetchValues).not.toHaveBeenCalled()
  expect(host.variantEffects).toBeUndefined()
  runInAction(() => {
    host.variantEffectAsk = ask('P04637')
  })
  expect(fetchValues).toHaveBeenCalledOnce()
  dispose()
})

test('drops an answer to a request the structure has since left', async () => {
  const host = makeHost(ask('P15056'))
  const slow = deferred()
  const fetchValues = vi.fn((request: VariantEffectRequest) =>
    request.label === 'P15056' ? slow.promise : Promise.resolve(values),
  )
  const dispose = start(host, fetchValues)
  runInAction(() => {
    host.variantEffectAsk = ask('P04637')
  })
  await vi.waitFor(() => {
    expect(host.variantEffects?.values).toBe(values)
  })
  slow.resolve({
    numbering: 'uniprot',
    sequence: 'M',
    byPosition: new Map([[1, 0.1]]),
  })
  await slow.promise
  expect(host.variantEffects).toEqual({ key: 'alphamissense:P04637', values })
  dispose()
})

test('leaving the schemes forgets the answer, so choosing one again asks again', async () => {
  const host = makeHost(ask('Q00000'))
  const failure = new Error('HTTP 404')
  const fetchValues = vi.fn(() => Promise.reject(failure))
  const dispose = start(host, fetchValues)
  await vi.waitFor(() => {
    expect(host.variantEffects?.error).toBe(failure)
  })
  expect(fetchValues).toHaveBeenCalledOnce()
  runInAction(() => {
    host.variantEffectAsk = undefined
  })
  expect(host.variantEffects).toBeUndefined()
  runInAction(() => {
    host.variantEffectAsk = ask('Q00000')
  })
  expect(fetchValues).toHaveBeenCalledTimes(2)
  dispose()
})

test('ignores an answer that lands after removal', async () => {
  const gone = makeHost(ask('Q00000'))
  const pending = deferred()
  const dispose = start(gone, () => pending.promise)
  runInAction(() => {
    gone.alive = false
  })
  pending.reject(new Error('HTTP 404'))
  await pending.promise.catch(() => {})
  expect(gone.variantEffects?.error).toBeUndefined()
  dispose()
})
