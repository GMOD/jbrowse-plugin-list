import {
  DEFAULT_FOLDSEEK_DATABASES,
  FOLDSEEK_DATABASES,
  FOLDSEEK_MAX_RESIDUES,
  cleanFoldseekSequence,
  foldseekLengthProblem,
  predict3Di as predict,
  submitFoldseekSearch as submit,
  waitForFoldseekResults as wait,
} from 'p2s_mapper'

import type { FoldseekDatabaseId } from 'p2s_mapper'

// The client is p2s_mapper's, shared with react-msaview-structure. These
// wrappers keep the shape this plugin's hooks and dialogs already call.
export {
  FOLDSEEK_DATABASES,
  FOLDSEEK_MAX_RESIDUES,
  cleanFoldseekSequence,
  foldseekLengthProblem,
}
export type {
  FoldseekAlignment,
  FoldseekDatabaseId,
  FoldseekDatabaseResult,
  FoldseekResult,
  FoldseekTicket as FoldseekTicketResponse,
} from 'p2s_mapper'

export const DEFAULT_DATABASES = DEFAULT_FOLDSEEK_DATABASES

export function predict3Di({
  aaSequence,
  signal,
}: {
  aaSequence: string
  signal?: AbortSignal
}) {
  return predict(aaSequence, { signal })
}

export function submitFoldseekSearch({
  aaSequence,
  di3Sequence,
  databases,
  signal,
}: {
  aaSequence: string
  di3Sequence: string
  databases: FoldseekDatabaseId[]
  signal?: AbortSignal
}) {
  return submit({ aaSequence, di3Sequence, databases }, { signal })
}

export function waitForFoldseekResults({
  ticketId,
  onStatusChange,
  signal,
}: {
  ticketId: string
  onStatusChange?: (status: string) => void
  signal?: AbortSignal
}) {
  return wait(ticketId, { signal, onStatus: onStatusChange })
}
