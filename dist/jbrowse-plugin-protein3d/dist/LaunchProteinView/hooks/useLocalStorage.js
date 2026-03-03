import { useEffect, useState } from 'react';
export function useLocalStorage(key, defaultValue) {
    const [value, setValue] = useState(() => {
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                return JSON.parse(stored);
            }
            catch {
                return defaultValue;
            }
        }
        return defaultValue;
    });
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
}
//# sourceMappingURL=useLocalStorage.js.map