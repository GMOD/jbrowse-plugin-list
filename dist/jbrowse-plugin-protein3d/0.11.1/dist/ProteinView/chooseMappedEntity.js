import { alignmentTooLarge, scoredAlignment, selfScore, } from './pairwiseAlignment';
import { stripStopCodon } from '../LaunchProteinView/utils/util';
import { structureAlignedSeq, transcriptAlignedSeq } from '../mappings';
/**
 * Whether a structure interaction (hover/click) should drive genome navigation.
 * Only the transcript's mapped entity may — a hover on any other chain carries
 * that chain's own label_seq_id and would mis-map through the wrong alignment.
 * A structure with no resolved mapping (`mappedEntityId` undefined, e.g. a
 * standalone viewer with no transcript) stays fully interactive.
 */
export function interactionMatchesMappedEntity(entityId, mappedEntityId) {
    return mappedEntityId === undefined || entityId === mappedEntityId;
}
/**
 * Identical residues over the shorter of the two sequences: how much of
 * whichever is smaller, transcript or entity, the other reproduces.
 *
 * A raw match count favours whatever chain is longest, and a complex's partner
 * usually is: on 1H26 the 11-residue p53 peptide matches 11 while CDK2 accrues
 * 58 scattered identities, and on 4ZZJ SIRT1 beats the 7-residue p53 peptide
 * 63 to 6. The Smith-Waterman score is no better there (56 vs 58). Dividing
 * by length asks the question the picker actually has, which chain *is* this
 * gene's product: the peptide scores 0.69 and 0.50, the partners 0.19 and
 * 0.17, and across a ribosome's 55 chains no decoy passes 0.29.
 *
 * Dividing by the *entity's* length alone penalised a fusion construct: a
 * 60-residue target fused to a 370-residue carrier scored 0.14, and a random
 * 10-mer decoy chain with 3 identities beat it a third of the time (measured
 * 2026-09-11). Dividing by the shorter sequence leaves every chain shorter
 * than the transcript scored as before and lets a chain that contains the
 * whole transcript score near 1 however long its tag is. The pseudocount
 * keeps a two-residue fragment that happens to match (a tRNA end in 7K00)
 * from scoring 1.0.
 */
const EXPLAINED_PSEUDOCOUNT = 5;
export function explainedFraction(matches, transcriptLength, entityLength) {
    return (matches / (Math.min(transcriptLength, entityLength) + EXPLAINED_PSEUDOCOUNT));
}
function countMatches(pa) {
    const a = transcriptAlignedSeq(pa);
    const b = structureAlignedSeq(pa);
    let matches = 0;
    for (let i = 0; i < a.length; i++) {
        const ca = a[i];
        const cb = b[i];
        if (ca !== '-' && cb !== '-' && ca?.toUpperCase() === cb?.toUpperCase()) {
            matches++;
        }
    }
    return matches;
}
/**
 * Align one transcript to one entity, stop codons stripped on both sides. An
 * exact match skips the DP entirely; an oversized pair returns undefined rather
 * than locking up the tab. Used both to score every entity of a structure and
 * to honour a user's explicit chain choice.
 */
export function alignTranscriptToEntity(transcript, entitySeq, algorithm) {
    const t = stripStopCodon(transcript);
    const s = stripStopCodon(entitySeq);
    if (!t || !s || alignmentTooLarge(t.length, s.length)) {
        return undefined;
    }
    if (s === t) {
        return {
            alignment: {
                consensus: '|'.repeat(t.length),
                alns: [
                    { id: 'seq1', seq: t },
                    { id: 'seq2', seq: s },
                ],
            },
            matches: t.length,
            explained: explainedFraction(t.length, t.length, s.length),
            score: selfScore(t),
        };
    }
    const { alignment, score } = scoredAlignment(t, s, algorithm);
    const matches = countMatches(alignment);
    return {
        alignment,
        matches,
        explained: explainedFraction(matches, t.length, s.length),
        score,
    };
}
/**
 * Pick which polymer entity of a structure corresponds to the transcript.
 *
 * The plugin historically hardcoded entity `[0]`, which silently mis-maps every
 * heteromeric / protein-DNA / processed-peptide structure where the protein of
 * interest is some other chain. Selecting by alignment makes the structure self-
 * describe which entity is the gene's protein: an exact sequence match wins
 * outright, otherwise the entity with the highest identity over the shorter
 * sequence (see `explainedFraction`). Nucleic-acid entities are never
 * candidates.
 *
 * Returns `undefined` only when there is nothing to map (no transcript or no
 * protein entities) — never a silent fallback to the wrong entity.
 */
export function chooseMappedEntity(transcript, entities, algorithm) {
    const t = stripStopCodon(transcript);
    if (!t) {
        return undefined;
    }
    const candidates = entities.map(e => typeof e === 'string'
        ? { seq: stripStopCodon(e) }
        : { ...e, seq: stripStopCodon(e.seq) });
    const exactIndex = candidates.findIndex(c => !c.nucleicAcid && c.seq.length > 0 && c.seq === t);
    if (exactIndex !== -1) {
        const exact = alignTranscriptToEntity(t, candidates[exactIndex].seq, algorithm);
        return { index: exactIndex, ...exact };
    }
    // Each alignment is an O(len(t) * len(s)) main-thread DP, so a complex with
    // many chains pays it once per chain. Homomers and repeated chains share a
    // sequence, so align each distinct one once and reuse the result.
    const bySeq = new Map();
    let best;
    for (let index = 0; index < candidates.length; index++) {
        const { seq, nucleicAcid } = candidates[index];
        if (nucleicAcid) {
            continue;
        }
        if (!bySeq.has(seq)) {
            bySeq.set(seq, alignTranscriptToEntity(t, seq, algorithm));
        }
        const scored = bySeq.get(seq);
        if (scored && (!best || scored.explained > best.explained)) {
            best = { index, ...scored };
        }
    }
    return best;
}
