export type FetchKey = string | readonly unknown[] | null | undefined | false;
export declare function serializeKey(key: FetchKey): string | null;
/**
 * Fetch once per key, keeping loading and error state with the data instead of
 * spread across three `useState`s and a cancellation flag.
 *
 * Everything the caller reads is derived from the one settled result, which is
 * what keeps the states consistent: while a key change is in flight there is no
 * frame showing the previous key's data as though it were the new key's. A
 * `mutate()` refetch under the same key does leave its data up, because it is
 * the same question asked again and blanking it flashes an empty list.
 */
export declare function useFetch<Data>(key: FetchKey, fetcher: () => Promise<Data>, { onSuccess }?: {
    onSuccess?: (data: Data) => void;
}): {
    data: Data | undefined;
    error: unknown;
    isLoading: boolean;
    mutate: () => void;
};
/** `value`, but only after it has stopped changing for `ms`. */
export declare function useDebounced<T>(value: T, ms: number): T;
