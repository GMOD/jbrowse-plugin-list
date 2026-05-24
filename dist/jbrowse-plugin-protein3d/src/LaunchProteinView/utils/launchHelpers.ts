/**
 * Run a launch fn (sync or async) and surface any thrown error via onError.
 * Used to wrap `session.addView(...)` calls so MST validation errors don't
 * fall silently into the React error boundary.
 */
export async function safeLaunch(
  fn: () => void | Promise<void>,
  onSuccess?: () => void,
  onError?: (e: unknown) => void,
) {
  try {
    await fn()
    onSuccess?.()
  } catch (e) {
    console.error(e)
    onError?.(e)
  }
}

interface LaunchRequirements {
  uniprotId?: string
  userSelectedProteinSequence?: { seq: string }
  selectedTranscript?: unknown
  isLoading?: boolean
  /**
   * If a real error already surfaced (e.g. from UniProt lookup), suppress the
   * derived "No UniProt ID found" reason — the underlying error is already
   * shown via <ErrorMessage> and the duplicate hint is misleading.
   */
  error?: unknown
}

/**
 * Compute user-facing reasons the Launch button is disabled. Suppressed
 * while loading or while a real upstream error is being displayed.
 */
export function getLaunchMissingReasons({
  uniprotId,
  userSelectedProteinSequence,
  selectedTranscript,
  isLoading,
  error,
}: LaunchRequirements): string[] {
  if (isLoading || error) {
    return []
  }
  return [
    !uniprotId && 'No UniProt ID found',
    !userSelectedProteinSequence &&
      'Could not compute protein sequence (feature may be missing CDS subfeatures)',
    !selectedTranscript && 'No transcript selected',
  ].filter((s): s is string => typeof s === 'string')
}
