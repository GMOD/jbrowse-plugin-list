import { autorun, observable, runInAction } from 'mobx'
import { expect, test, vi } from 'vitest'

import { makeVariantEffectLoader } from './variantEffectLoader'

import type {
  VariantEffectHost,
  VariantEffectState,
} from './variantEffectLoader'
import type { UniProtValues, VariantEffectScheme } from './variantEffects'

function deferred() {
  let resolve: (values: UniProtValues) => void = () => {}
  let reject: (error: unknown) => void = () => {}
  const promise = new Promise<UniProtValues>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

interface TestHost {
  variantEffectScheme: VariantEffectScheme | undefined
  uniProtEntry: VariantEffectHost['uniProtEntry']
  variantEffects: VariantEffectState | undefined
  alive: boolean
  setVariantEffects(state: VariantEffectState): void
}

function makeHost(initial: {
  scheme?: VariantEffectScheme
  uniprotId?: string
  isoformAccession?: string
  isLoading?: boolean
}) {
  // held by reference, as an MST volatile holds them
  const host = observable<TestHost>(
    {
      variantEffectScheme: initial.scheme,
      uniProtEntry: {
        uniprotId: initial.uniprotId,
        isoformAccession: initial.isoformAccession,
        isLoading: initial.isLoading ?? false,
      },
      variantEffects: undefined,
      alive: true,
      setVariantEffects(state: VariantEffectState) {
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
  fetchValues: (
    scheme: VariantEffectScheme,
    accession: string,
  ) => Promise<UniProtValues>,
) {
  return autorun(makeVariantEffectLoader(host, () => host.alive, fetchValues))
}

const values: UniProtValues = {
  sequence: 'V',
  byPosition: new Map([[600, 0.95]]),
}

test('asks for the entry once the scheme wants it, and keeps the answer', async () => {
  const host = makeHost({ uniprotId: 'P15056' })
  const fetchValues = vi.fn(async () => values)
  const dispose = start(host, fetchValues)
  expect(fetchValues).not.toHaveBeenCalled()
  runInAction(() => {
    host.variantEffectScheme = 'alphamissense'
  })
  expect(host.variantEffects).toEqual({
    scheme: 'alphamissense',
    accession: 'P15056',
  })
  await vi.waitFor(() => {
    expect(host.variantEffects?.values).toBe(values)
  })
  expect(fetchValues).toHaveBeenCalledExactlyOnceWith('alphamissense', 'P15056')
  dispose()
})

test('waits for SIFTS before asking for a PDB entry', () => {
  const host = makeHost({ scheme: 'clinvar', isLoading: true })
  const fetchValues = vi.fn(async () => values)
  const dispose = start(host, fetchValues)
  expect(host.variantEffects).toBeUndefined()
  runInAction(() => {
    host.uniProtEntry = { uniprotId: 'P04637', isLoading: false }
  })
  expect(fetchValues).toHaveBeenCalledExactlyOnceWith('clinvar', 'P04637')
  dispose()
})

test('an isoform model or a structure without an entry asks nothing', () => {
  for (const entry of [
    { uniprotId: 'P04637', isoformAccession: 'P04637-7' },
    { uniprotId: undefined },
  ]) {
    const host = makeHost({ scheme: 'alphamissense', ...entry })
    const fetchValues = vi.fn(async () => values)
    const dispose = start(host, fetchValues)
    expect(fetchValues).not.toHaveBeenCalled()
    expect(host.variantEffects).toEqual({
      scheme: 'alphamissense',
      accession: undefined,
    })
    dispose()
  }
})

test('drops an answer to a scheme the view has since left', async () => {
  const host = makeHost({ scheme: 'alphamissense', uniprotId: 'P15056' })
  const slow = deferred()
  const fetchValues = vi.fn((scheme: VariantEffectScheme) =>
    scheme === 'alphamissense' ? slow.promise : Promise.resolve(values),
  )
  const dispose = start(host, fetchValues)
  runInAction(() => {
    host.variantEffectScheme = 'clinvar'
  })
  await vi.waitFor(() => {
    expect(host.variantEffects?.values).toBe(values)
  })
  slow.resolve({ sequence: 'M', byPosition: new Map([[1, 0.1]]) })
  await slow.promise
  expect(host.variantEffects).toEqual({
    scheme: 'clinvar',
    accession: 'P15056',
    values,
  })
  dispose()
})

test('records a failure for the header and ignores one after removal', async () => {
  const host = makeHost({ scheme: 'alphamissense', uniprotId: 'Q00000' })
  const failure = new Error('HTTP 404')
  const dispose = start(host, () => Promise.reject(failure))
  await vi.waitFor(() => {
    expect(host.variantEffects?.error).toBe(failure)
  })
  dispose()

  const gone = makeHost({ scheme: 'alphamissense', uniprotId: 'Q00000' })
  const pending = deferred()
  const disposeGone = start(gone, () => pending.promise)
  runInAction(() => {
    gone.alive = false
  })
  pending.reject(failure)
  await pending.promise.catch(() => {})
  expect(gone.variantEffects?.error).toBeUndefined()
  disposeGone()
})
