import { useState } from 'react';
import { readStoredJson, writeStorage } from '../../storage';
export function useLocalStorage(key, defaultValue) {
    const [value, setValue] = useState(() => readStoredJson(key) ?? defaultValue);
    function setValueAndStore(newValue) {
        setValue(newValue);
        writeStorage(key, JSON.stringify(newValue));
    }
    return [value, setValueAndStore];
}
