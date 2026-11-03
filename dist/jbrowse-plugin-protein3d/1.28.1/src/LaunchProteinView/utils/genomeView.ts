/** What a launch reads off the genome view it opens from. */
export interface LaunchingGenomeView {
  id: string
  assemblyNames: string[]
}

export function isLaunchingGenomeView(
  view: object,
): view is LaunchingGenomeView {
  return (
    'id' in view &&
    typeof view.id === 'string' &&
    'assemblyNames' in view &&
    Array.isArray(view.assemblyNames) &&
    view.assemblyNames.every(name => typeof name === 'string')
  )
}
