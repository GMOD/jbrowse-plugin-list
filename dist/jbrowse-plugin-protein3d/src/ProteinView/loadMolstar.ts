let cached: Promise<typeof import('./molstarExports')> | undefined

export default function loadMolstar() {
  cached ??= import('./molstarExports')
  return cached
}
