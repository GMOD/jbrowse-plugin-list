export declare function throttle<T extends (...args: Parameters<T>) => void>(func: T, limit: number): T;
