// localStorage throws in a private window or when site data is blocked, and a
// preference is never worth a crash, so every read and write goes through here.
export function readStorage(key: string) {
  try {
    return localStorage.getItem(key) ?? undefined
  } catch {
    return undefined
  }
}

export function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    console.warn(`could not save ${key}`, e)
  }
}

export function readStoredJson(key: string): unknown {
  const stored = readStorage(key)
  if (stored === undefined) {
    return undefined
  }
  try {
    return JSON.parse(stored)
  } catch {
    return undefined
  }
}
