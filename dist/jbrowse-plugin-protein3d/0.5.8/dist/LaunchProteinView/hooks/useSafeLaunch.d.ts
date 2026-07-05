/**
 * Shared launch-button wiring for the action components: holds the launch
 * error state and returns a `runLaunch` factory that closes any open menu,
 * runs the launch via safeLaunch, and surfaces failures inline.
 */
export declare function useSafeLaunch(onSuccess: () => void, onBeforeLaunch?: () => void): {
    runLaunch: (fn: () => unknown) => () => void;
    launchError: unknown;
};
