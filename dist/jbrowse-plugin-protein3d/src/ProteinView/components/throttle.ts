export function throttle<T extends (...args: Parameters<T>) => void>(
  func: T,
  limit: number,
): T {
  let lastCall = 0
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= limit) {
      lastCall = now
      func(...args)
    }
  }) as T
}
