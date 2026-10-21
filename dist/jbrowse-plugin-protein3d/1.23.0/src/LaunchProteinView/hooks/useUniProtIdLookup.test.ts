// @vitest-environment jsdom
import { SimpleFeature } from '@jbrowse/core/util'
import { act, renderHook, waitFor } from '@testing-library/react'
import { expect, test } from 'vitest'

import useUniProtIdLookup from './useUniProtIdLookup'

// no identifier and no gene name, so the lookup opens on the manual field
const feature = new SimpleFeature({
  uniqueId: 'f',
  refName: 'chr17',
  start: 0,
  end: 10,
})

function renderLookup() {
  return renderHook(() =>
    useUniProtIdLookup({ feature, view: { assemblyNames: [] } }),
  )
}

test('a pasted accession is trimmed and upper-cased', async () => {
  const { result } = renderLookup()
  act(() => {
    result.current.setManualUniprotId(' p04637\n')
  })
  expect(result.current.manualUniprotId).toBe('P04637')
  expect(result.current.manualUniprotIdInvalid).toBe(false)
  await waitFor(() => {
    expect(result.current.uniprotId).toBe('P04637')
  })
})

test('the lookup is loading until a retyped accession is the one it names', async () => {
  const { result } = renderLookup()
  act(() => {
    result.current.setManualUniprotId('P04637')
  })
  await waitFor(() => {
    expect(result.current.uniprotId).toBe('P04637')
  })
  expect(result.current.isLookupLoading).toBe(false)

  act(() => {
    result.current.setManualUniprotId('Q9Y6K9')
  })
  expect(result.current.uniprotId).toBe('P04637')
  expect(result.current.isLookupLoading).toBe(true)
  await waitFor(() => {
    expect(result.current.uniprotId).toBe('Q9Y6K9')
  })
  expect(result.current.isLookupLoading).toBe(false)
})

test('text that is no accession names none and is flagged', async () => {
  const { result } = renderLookup()
  act(() => {
    result.current.setManualUniprotId('TP53')
  })
  expect(result.current.manualUniprotIdInvalid).toBe(true)
  await waitFor(() => {
    expect(result.current.isLookupLoading).toBe(false)
  })
  expect(result.current.uniprotId).toBeUndefined()
})
