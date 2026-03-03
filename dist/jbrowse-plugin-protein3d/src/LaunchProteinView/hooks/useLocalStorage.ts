import { useEffect, useState } from 'react'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        return JSON.parse(stored) as T
      } catch {
        return defaultValue
      }
    }
    return defaultValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
