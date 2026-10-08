// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

import { useSafeLaunch } from './useSafeLaunch'

test('a second click during an async launch does not launch again', async () => {
  const onSuccess = vi.fn()
  const { result } = renderHook(() => useSafeLaunch(onSuccess))
  let finish = () => {}
  const launch = vi.fn(
    () =>
      new Promise<void>(resolve => {
        finish = resolve
      }),
  )

  act(() => {
    result.current.runLaunch(launch)()
  })
  expect(result.current.launching).toBe(true)
  act(() => {
    result.current.runLaunch(launch)()
  })
  expect(launch).toHaveBeenCalledOnce()

  finish()
  await waitFor(() => {
    expect(result.current.launching).toBe(false)
  })
  expect(onSuccess).toHaveBeenCalledOnce()
})

test('a failed launch frees the button and reports the error', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const onSuccess = vi.fn()
  const { result } = renderHook(() => useSafeLaunch(onSuccess))
  const failure = new Error('Failed to fetch')
  act(() => {
    result.current.runLaunch(() => Promise.reject(failure))()
  })
  await waitFor(() => {
    expect(result.current.launchError).toBe(failure)
  })
  expect(result.current.launching).toBe(false)
  expect(onSuccess).not.toHaveBeenCalled()
  error.mockRestore()
})
