import { useState } from 'react'

import { safeLaunch } from '../utils/launchHelpers'

/**
 * Shared launch-button wiring for the action components: holds the launch
 * error state and returns a `runLaunch` factory that closes any open menu,
 * runs the launch via safeLaunch, and surfaces failures inline.
 */
export function useSafeLaunch(onSuccess: () => void, onBeforeLaunch?: () => void) {
  const [launchError, setLaunchError] = useState<unknown>()
  const runLaunch = (fn: () => void | Promise<void>) => () => {
    onBeforeLaunch?.()
    void safeLaunch(fn, onSuccess, setLaunchError)
  }
  return { runLaunch, launchError }
}
