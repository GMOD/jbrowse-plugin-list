/**
 * Run a launch fn (sync or async) and surface any thrown error via onError.
 * Used to wrap `session.addView(...)` calls so MST validation errors don't
 * fall silently into the React error boundary.
 */
export async function safeLaunch(
  fn: () => unknown,
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
  userSelectedProteinSequence?: { seq: string }
  selectedTranscript?: unknown
}

/**
 * The transcript requirements a 3D launch needs, as user-facing reasons for
 * any that are unmet; the structure it opens is the caller's to require, since
 * the 1D view opens without one. Callers decide whether to surface these (e.g.
 * suppressed while loading or while a real upstream error is already shown
 * via <ErrorMessage>, where a duplicate hint would mislead). A structure names
 * its own source, so no accession is asked for: bypassing a lookup that failed
 * or found the wrong gene is what adding a PDB id is for.
 */
export function getLaunchMissingReasons({
  userSelectedProteinSequence,
  selectedTranscript,
}: LaunchRequirements): string[] {
  return [
    !userSelectedProteinSequence?.seq &&
      'Could not compute protein sequence (feature may be missing CDS subfeatures)',
    !selectedTranscript && 'No transcript selected',
  ].filter((s): s is string => typeof s === 'string')
}

/** Whether an error shown in the dialog holds the 3D launch. A failed isoform
 * ranking is shown but holds no launch of the right-clicked isoform, which
 * needs no ranking. */
export function errorHoldsLaunch({
  error,
  rankingError,
  selectedTranscriptId,
  preferredTranscriptId,
}: {
  error: unknown
  rankingError: unknown
  selectedTranscriptId?: string
  preferredTranscriptId?: string
}) {
  return (
    error !== undefined &&
    !(error === rankingError && selectedTranscriptId === preferredTranscriptId)
  )
}

/** Where the gene's structure list stands: still choosing its default rows,
 * listing none, or listing some */
export type Listing = 'finding' | 'empty' | 'listed'

/**
 * What the structures tab can launch. The 3D view needs a structure and a
 * translated transcript; the 1D view needs only the accession and the
 * transcript, but waits for the default structure, which picks the isoform it
 * links to.
 */
export function launchReadiness({
  rowCount,
  userPicked,
  defaultPending,
  addedPending,
  structureCount,
  loading,
  failed,
  userSelectedProteinSequence,
  selectedTranscript,
  uniprotId,
  lookupLoading,
}: LaunchRequirements & {
  rowCount: number
  /** the checked rows are the user's, not the default */
  userPicked: boolean
  defaultPending: boolean
  /** RCSB has not yet said whether a checked entry added by id exists */
  addedPending: boolean
  structureCount: number
  loading: boolean
  failed: boolean
  uniprotId?: string
  lookupLoading: boolean
}) {
  const listing: Listing =
    !userPicked && defaultPending
      ? 'finding'
      : rowCount === 0
        ? 'empty'
        : 'listed'
  const awaitingDefault = listing === 'finding'
  const transcriptReasons = getLaunchMissingReasons({
    userSelectedProteinSequence,
    selectedTranscript,
  })
  const noStructure = structureCount === 0
  return {
    listing,
    // with nothing listed the summary and the list already say so
    missingReasons:
      noStructure && listing !== 'empty'
        ? ['No structure checked', ...transcriptReasons]
        : transcriptReasons,
    ready:
      !loading &&
      !awaitingDefault &&
      !addedPending &&
      !failed &&
      !noStructure &&
      transcriptReasons.length === 0,
    ready1D:
      !!uniprotId && !!selectedTranscript && !lookupLoading && !awaitingDefault,
  }
}

/** Which launch controls are enabled: the 1D row is offered only to a session
 * that takes a temporary assembly, and nothing launches twice at once */
export function launchControls({
  ready,
  ready1D,
  launching,
  offers1D,
}: {
  ready: boolean
  ready1D: boolean
  launching: boolean
  offers1D: boolean
}) {
  const can3D = ready && !launching
  const can1D = offers1D && ready1D && !launching
  return { can3D, can1D, canOpenOptions: can3D || can1D }
}
