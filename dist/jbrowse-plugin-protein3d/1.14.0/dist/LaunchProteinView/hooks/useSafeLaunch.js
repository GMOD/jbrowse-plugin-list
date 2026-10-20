import { useState } from 'react';
import { safeLaunch } from '../utils/launchHelpers';
/**
 * Shared launch-button wiring for the action components: holds the launch
 * error state and returns a `runLaunch` factory that closes any open menu,
 * runs the launch via safeLaunch, and surfaces failures inline. `launching`
 * is true while an async launch is in flight, and a click then is dropped, so
 * a download cannot be launched twice.
 */
export function useSafeLaunch(onSuccess, onBeforeLaunch) {
    const [launchError, setLaunchError] = useState();
    const [launching, setLaunching] = useState(false);
    const runLaunch = (fn) => () => {
        onBeforeLaunch?.();
        if (!launching) {
            setLaunching(true);
            setLaunchError(undefined);
            void safeLaunch(fn, onSuccess, setLaunchError).then(() => {
                setLaunching(false);
            });
        }
    };
    return { runLaunch, launchError, launching };
}
