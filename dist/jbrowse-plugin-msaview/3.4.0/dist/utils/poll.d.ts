/**
 * Poll a remote job until it reports done. `check` returns true when finished,
 * false when still pending, and throws on failure. Between checks it counts down
 * `intervalSeconds`, calling `onCountdown` each second so the UI can show
 * progress.
 */
export declare function pollLoop({ check, intervalSeconds, onCountdown, }: {
    check: () => Promise<boolean>;
    intervalSeconds: number;
    onCountdown: (secondsRemaining: number) => void;
}): Promise<void>;
