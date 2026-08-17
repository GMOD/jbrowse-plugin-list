import { useCallback, useEffect, useRef, useState } from 'react';
const isNil = (k) => k === null || k === undefined || k === false;
// A null result means "don't fetch": no key, or an array key with a missing
// piece. Note what that makes of a boolean IN a key -- `false` reads as a
// missing piece and silently disables the fetch, so put a string there.
export function serializeKey(key) {
    return isNil(key) || (Array.isArray(key) && key.some(isNil))
        ? null
        : JSON.stringify(key);
}
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
export function useFetch(key, fetcher, { onSuccess } = {}) {
    const serialized = serializeKey(key);
    const [nonce, setNonce] = useState(0);
    const [settled, setSettled] = useState();
    const attempt = serialized === null ? null : `${nonce}\u0000${serialized}`;
    const current = settled?.attempt === attempt;
    const answersThisKey = settled?.question === serialized;
    // The fetcher and the success callback are inline closures at every call site,
    // so depending on their identity would refetch every render. This effect is
    // declared before the fetch effect and has no dependency list, so it has
    // already run with the current render's values by the time that one does.
    const latest = useRef({ fetcher, onSuccess });
    useEffect(() => {
        latest.current = { fetcher, onSuccess };
    });
    useEffect(() => {
        if (attempt === null || serialized === null) {
            return undefined;
        }
        let alive = true;
        latest.current
            .fetcher()
            .then(data => {
            if (alive) {
                setSettled({ attempt, question: serialized, data });
                latest.current.onSuccess?.(data);
            }
        })
            .catch((error) => {
            if (alive) {
                setSettled({ attempt, question: serialized, error });
            }
        });
        return () => {
            alive = false;
        };
    }, [attempt, serialized]);
    return {
        data: answersThisKey ? settled.data : undefined,
        error: current ? settled.error : undefined,
        isLoading: attempt !== null && !current,
        mutate: useCallback(() => {
            setNonce(n => n + 1);
        }, []),
    };
}
/** `value`, but only after it has stopped changing for `ms`. */
export function useDebounced(value, ms) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounced(value);
        }, ms);
        return () => {
            clearTimeout(timer);
        };
    }, [value, ms]);
    return debounced;
}
