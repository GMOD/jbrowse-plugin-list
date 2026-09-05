import { readStoredJson, writeStorage } from '../storage'

const SETTINGS_KEY = 'proteinView-settings'

export const PERSISTED_SETTINGS = [
  'showAlignment',
  'showProteinTracks',
  'showHighlight',
  'zoomToBaseLevel',
  'autoScrollAlignment',
  'compactTracks',
] as const

export type PersistedSettings = Partial<
  Record<(typeof PERSISTED_SETTINGS)[number], boolean>
>

/**
 * A stored preference fills in only what the snapshot leaves unsaid. Comparing
 * against the property defaults instead, as this used to, cannot tell a spec
 * that declares the default value from one that says nothing, so a stored
 * `zoomToBaseLevel: false` overrode a spec's explicit `true`. A re-hydrated
 * session snapshot names every setting, so it keeps exactly what it saved.
 */
export function withStoredSettings<T extends PersistedSettings>(
  snapshot: T,
  stored: PersistedSettings | undefined,
): T {
  if (!stored) {
    return snapshot
  }
  const filled = { ...snapshot }
  for (const key of PERSISTED_SETTINGS) {
    if (filled[key] === undefined && stored[key] !== undefined) {
      filled[key] = stored[key]
    }
  }
  return filled
}

export function readStoredSettings() {
  return readStoredJson(SETTINGS_KEY) as PersistedSettings | undefined
}

export function writeStoredSettings(settings: PersistedSettings) {
  writeStorage(SETTINGS_KEY, JSON.stringify(settings))
}
