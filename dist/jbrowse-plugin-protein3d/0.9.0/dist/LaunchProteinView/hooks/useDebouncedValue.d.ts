/**
 * Returns `value` after it has been stable for `delayMs`. Used to throttle
 * network fetches keyed off a fast-changing input (e.g. text fields) without
 * having to debounce the input handler itself.
 */
export default function useDebouncedValue<T>(value: T, delayMs?: number): T;
