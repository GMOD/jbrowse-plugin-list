import { useState } from 'react'

import { readStoredJson, writeStorage } from '../../storage'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(
    () => (readStoredJson(key) as T | undefined) ?? defaultValue,
  )

  function setValueAndStore(newValue: T) {
    setValue(newValue)
    writeStorage(key, JSON.stringify(newValue))
  }

  return [value, setValueAndStore]
}
