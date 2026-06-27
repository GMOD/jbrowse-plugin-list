import { useState } from 'react';
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
    function setValueAndStore(newValue) {
        setValue(newValue);
        localStorage.setItem(key, JSON.stringify(newValue));
    }
    return [value, setValueAndStore];
}
