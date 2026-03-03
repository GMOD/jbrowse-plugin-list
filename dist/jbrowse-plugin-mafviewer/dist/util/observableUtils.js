/**
 * Subscribes to an observable and returns a promise that resolves when complete.
 * Useful for streaming processing where you want to handle each item as it arrives.
 */
export function subscribeToObservable(observable, onNext) {
    return new Promise((resolve, reject) => {
        observable.subscribe({
            next: onNext,
            error: reject,
            complete: resolve,
        });
    });
}
//# sourceMappingURL=observableUtils.js.map