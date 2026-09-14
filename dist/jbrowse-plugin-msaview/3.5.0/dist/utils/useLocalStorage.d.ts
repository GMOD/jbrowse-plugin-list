export declare function readLocalStorage<T>(key: string, initialValue: T): T;
export declare function useLocalStorage<T>(key: string, initialValue: T): readonly [T, (value: T) => void];
