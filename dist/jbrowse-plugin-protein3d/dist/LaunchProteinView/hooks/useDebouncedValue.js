import { useEffect, useState } from 'react';
/**
 * Returns `value` after it has been stable for `delayMs`. Used to throttle
 * network fetches keyed off a fast-changing input (e.g. text fields) without
 * having to debounce the input handler itself.
 */
export default function useDebouncedValue(value, delayMs = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => {
            setDebounced(value);
        }, delayMs);
        return () => {
            clearTimeout(t);
        };
    }, [value, delayMs]);
    return debounced;
}
//# sourceMappingURL=useDebouncedValue.js.map