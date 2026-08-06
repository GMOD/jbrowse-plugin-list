import { useState } from 'react';
// Vendored rather than imported from `@jbrowse/core/util`: that barrel is
// host-provided, and a barrel split dropped this export, making the BLAST panel
// throw "(0, PR.useLocalStorage) is not a function" on hosts built during that
// window. Same failure mode as `defaultCodonTable`; keeping our own copy takes
// this plugin out of the whack-a-mole.
function readLocalStorage(key, initialValue) {
    try {
        const item = globalThis.localStorage.getItem(key);
        return item === null ? initialValue : JSON.parse(item);
    }
    catch (error) {
        console.error(error);
        return initialValue;
    }
}
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => readLocalStorage(key, initialValue));
    const setValue = (value) => {
        setStoredValue(value);
        try {
            globalThis.localStorage.setItem(key, JSON.stringify(value));
        }
        catch (error) {
            console.error(error);
        }
    };
    return [storedValue, setValue];
}
