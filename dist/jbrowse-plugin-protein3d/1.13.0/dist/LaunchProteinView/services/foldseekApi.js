import { DEFAULT_FOLDSEEK_DATABASES, FOLDSEEK_DATABASES, FOLDSEEK_MAX_RESIDUES, cleanFoldseekSequence, foldseekLengthProblem, predict3Di as predict, submitFoldseekSearch as submit, waitForFoldseekResults as wait, } from 'p2s_mapper';
// The client is p2s_mapper's, shared with react-msaview-structure. These
// wrappers keep the shape this plugin's hooks and dialogs already call.
export { FOLDSEEK_DATABASES, FOLDSEEK_MAX_RESIDUES, cleanFoldseekSequence, foldseekLengthProblem, };
export const DEFAULT_DATABASES = DEFAULT_FOLDSEEK_DATABASES;
export function predict3Di({ aaSequence, signal, }) {
    return predict(aaSequence, { signal });
}
export function submitFoldseekSearch({ aaSequence, di3Sequence, databases, signal, }) {
    return submit({ aaSequence, di3Sequence, databases }, { signal });
}
export function waitForFoldseekResults({ ticketId, onStatusChange, signal, }) {
    return wait(ticketId, { signal, onStatus: onStatusChange });
}
