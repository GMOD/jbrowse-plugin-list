// Shared SWR config for one-shot fetches that should never auto-revalidate
// (structure files, computed protein sequences). keepPreviousData is opt-in
// per-hook since it avoids result flicker when the key changes.
export const STATIC_SWR_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
} as const
