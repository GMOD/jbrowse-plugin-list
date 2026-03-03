export function throttle(func, limit) {
    let lastCall = 0;
    return ((...args) => {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            func(...args);
        }
    });
}
//# sourceMappingURL=throttle.js.map