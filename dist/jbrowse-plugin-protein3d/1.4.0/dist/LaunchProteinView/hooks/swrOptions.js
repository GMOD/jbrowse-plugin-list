// Shared SWR config for one-shot fetches that should never auto-revalidate
// (structure files, computed protein sequences). keepPreviousData is opt-in
// per-hook since it avoids result flicker when the key changes; a hook whose
// data describes one structure must not opt in, or the last structure's chains
// answer for the next. SWR retries an error forever by default, re-requesting
// an id that does not exist for as long as the dialog is open.
export const STATIC_SWR_OPTIONS = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    shouldRetryOnError: false,
};
