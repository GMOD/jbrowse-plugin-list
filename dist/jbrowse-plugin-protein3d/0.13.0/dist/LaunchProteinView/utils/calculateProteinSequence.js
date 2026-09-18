import { getConf } from '@jbrowse/core/configuration';
import { revcom } from '@jbrowse/core/util';
import { convertCodingSequenceToPeptides } from '@jbrowse/core/util/convertCodingSequenceToPeptides';
import { getGeneticCode, parseTranslTable, } from '@jbrowse/core/util/geneticCodes';
import { isCDS } from '../codingFeature';
export function calculateProteinSequence({ cds, sequence, geneticCodeId, }) {
    // `starts` is deliberately not passed: @jbrowse/core 4.3.0's signature has no
    // such parameter, so alternative initiators (GTG under table 11, ATA under
    // table 2) render as their internal residue rather than M. Core main added it;
    // pass it here when the @jbrowse/core floor reaches that release.
    const { codonTable } = getGeneticCode(geneticCodeId);
    return convertCodingSequenceToPeptides({
        cds,
        sequence,
        codonTable,
    });
}
function revlist(list, seqlen) {
    return list
        .map(sub => ({
        ...sub,
        start: seqlen - sub.end,
        end: seqlen - sub.start,
    }))
        .toSorted((a, b) => a.start - b.start);
}
function getItemId(feat) {
    return `${feat.start}-${feat.end}`;
}
function dedupe(list) {
    return list.filter((item, pos, ary) => !pos || getItemId(item) !== getItemId(ary[pos - 1]));
}
export function getProteinSequence({ feature, seq, assemblyGeneticCodeId, }) {
    const featureStart = feature.get('start');
    const strand = feature.get('strand');
    const subfeatures = feature.get('subfeatures') ?? [];
    const cds = dedupe(subfeatures
        .filter(isCDS)
        .toSorted((a, b) => a.get('start') - b.get('start'))
        .map(sub => ({
        start: sub.get('start') - featureStart,
        end: sub.get('end') - featureStart,
        type: 'CDS',
        phase: sub.get('phase'),
    })));
    // RefSeq declares transl_table=2 on a mitochondrial CDS, usually on the CDS
    // rather than the transcript. GENCODE and UCSC declare nothing, so without
    // the assembly's code all 13 human mitochondrial proteins read TGA as a stop
    // and ATA as I.
    const cdsSubfeature = subfeatures.find(isCDS);
    const geneticCodeId = parseTranslTable(feature.get('transl_table')) ??
        parseTranslTable(cdsSubfeature?.get('transl_table')) ??
        assemblyGeneticCodeId;
    return calculateProteinSequence({
        cds: strand === -1 ? revlist(cds, seq.length) : cds,
        sequence: strand === -1 ? revcom(seq) : seq,
        geneticCodeId,
    });
}
/** The genome under one span, with the assembly's code for that contig. */
export async function fetchRegionSequence({ session, assemblyName, refName, start, end, }) {
    const { assemblyManager, rpcManager } = session;
    const assembly = assemblyName
        ? await assemblyManager.waitForAssembly(assemblyName)
        : undefined;
    if (!assembly) {
        throw new Error('assembly not found');
    }
    const sessionId = 'getSequence';
    // a named object keeps sessionId, which v4 hosts read from the args
    const args = {
        adapterConfig: getConf(assembly, ['sequence', 'adapter']),
        sessionId,
        regions: [
            {
                start,
                end,
                refName: assembly.getCanonicalRefName(refName) ?? refName,
                assemblyName: assembly.name,
            },
        ],
    };
    const [feat] = await rpcManager.call(sessionId, 'CoreGetFeatures', args);
    const seq = feat?.get('seq');
    return { seq, assemblyGeneticCodeId: assemblyGeneticCode(assembly, refName) };
}
export async function fetchProteinSeq({ feature, session, assemblyName, }) {
    const { seq, assemblyGeneticCodeId } = await fetchRegionSequence({
        session,
        assemblyName,
        refName: feature.get('refName'),
        start: feature.get('start'),
        end: feature.get('end'),
    });
    return seq
        ? getProteinSequence({ seq, feature, assemblyGeneticCodeId })
        : undefined;
}
/**
 * Translate several transcripts of one gene off a single sequence fetch. The
 * transcripts overlap, so one request for the span covering them all costs a
 * 20-isoform gene one round trip instead of twenty. `fetchSpan` is a parameter
 * so the slicing can be tested without a session.
 */
export async function translateTranscripts({ transcripts, fetchSpan, }) {
    const first = transcripts[0];
    if (!first) {
        return [];
    }
    const spanStart = Math.min(...transcripts.map(f => f.get('start')));
    const spanEnd = Math.max(...transcripts.map(f => f.get('end')));
    const { seq, assemblyGeneticCodeId } = await fetchSpan({
        refName: first.get('refName'),
        start: spanStart,
        end: spanEnd,
    });
    if (!seq) {
        return transcripts.map(feature => ({ feature }));
    }
    return transcripts.map(feature => {
        try {
            // An empty translation is a transcript with no CDS — a retained_intron
            // or an lncRNA — not a zero-length protein. Reported as untranslated, it
            // stays a disabled "(no data)" row; kept as '' it became a selectable
            // "(0aa)" isoform the ranking could pick.
            const protein = getProteinSequence({
                seq: seq.slice(feature.get('start') - spanStart, feature.get('end') - spanStart),
                feature,
                assemblyGeneticCodeId,
            });
            return protein ? { feature, seq: protein } : { feature };
        }
        catch (e) {
            return { feature, error: e };
        }
    });
}
export async function fetchTranscriptProteinSeqs({ transcripts, session, assemblyName, }) {
    return translateTranscripts({
        transcripts,
        fetchSpan: span => fetchRegionSequence({ session, assemblyName, ...span }),
    });
}
// v5 hosts only; a v4 assembly has neither the method nor the config slot
function assemblyGeneticCode(assembly, refName) {
    const { getGeneticCodeId } = assembly;
    return getGeneticCodeId?.call(assembly, refName);
}
