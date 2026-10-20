/**
 * Identity and coverage in one short line for a structure's header row, from
 * both sides: which of the transcript's residues the structure holds, and how
 * much of the structure the alignment leaves out, said only when it leaves
 * some out. The full sentences are the row's tooltip.
 */
export function describeCoverage(q) {
    if (q.aligned === 0) {
        return 'no residues aligned';
    }
    return [
        `${Math.round(q.identity * 100)}% identity`,
        q.aligned === q.transcriptLength
            ? 'whole transcript'
            : `transcript ${q.transcriptStart}–${q.transcriptEnd} (${q.aligned} of ${q.transcriptLength})`,
        q.aligned < q.structureLength
            ? `${q.aligned} of ${q.structureLength} structure residues`
            : undefined,
    ]
        .filter(Boolean)
        .join(' · ');
}
