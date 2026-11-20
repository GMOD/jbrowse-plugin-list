import { types } from '@jbrowse/mobx-state-tree'

// Persisted choices that read a value outside `values` as unset. A plain
// `types.enumeration` throws on one, so a session saved by a build that had an
// option this one dropped failed to load at all; here it opens on the default.
function knownOrUnset<T extends string>(values: readonly T[]) {
  return (value: string | undefined) =>
    values.includes(value as T) ? (value as T) : undefined
}

export function lenientMaybeEnum<T extends string>(values: T[]) {
  return types.snapshotProcessor(types.maybe(types.enumeration(values)), {
    preProcessor: knownOrUnset(values),
  })
}

export function lenientOptionalEnum<T extends string>(
  values: T[],
  fallback: T,
) {
  return types.snapshotProcessor(
    types.optional(types.enumeration(values), fallback),
    { preProcessor: knownOrUnset(values) },
  )
}

// A `stringEnum` config slot's model, whose choices the config editor still
// lists. Core types the slot's value from a model that takes what it gives, so
// the processor is typed as taking `T` though a config from another build
// hands it any string.
export function lenientSlotEnum<T extends string>(values: T[], fallback: T) {
  return types.snapshotProcessor(types.enumeration(values), {
    preProcessor: (value: T) => (values.includes(value) ? value : fallback),
  })
}
