import { getConf } from '@jbrowse/core/configuration';
import { revcom } from '@jbrowse/core/util';
import { convertCodingSequenceToPeptides } from '@jbrowse/core/util/convertCodingSequenceToPeptides';
import { getGeneticCode, parseTranslTable } from './geneticCodes';
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
        .toSorted((a, b) => a.get('start') - b.get('start'))
        .map(sub => ({
        start: sub.get('start') - featureStart,
        end: sub.get('end') - featureStart,
        type: sub.get('type'),
        phase: sub.get('phase'),
    }))
        .filter(f => f.type === 'CDS'));
    // RefSeq declares transl_table=2 on a mitochondrial CDS, usually on the CDS
    // rather than the transcript. GENCODE and UCSC declare nothing, so without
    // the assembly's code all 13 human mitochondrial proteins read TGA as a stop
    // and ATA as I.
    const cdsSubfeature = subfeatures.find((f) => f.get('type')?.toLowerCase() === 'cds');
    const geneticCodeId = parseTranslTable(feature.get('transl_table')) ??
        parseTranslTable(cdsSubfeature?.get('transl_table')) ??
        assemblyGeneticCodeId;
    return calculateProteinSequence({
        cds: strand === -1 ? revlist(cds, seq.length) : cds,
        sequence: strand === -1 ? revcom(seq) : seq,
        geneticCodeId,
    });
}
export async function fetchProteinSeq({ feature, session, assemblyName, }) {
    const start = feature.get('start');
    const end = feature.get('end');
    const refName = feature.get('refName');
    const { assemblyManager, rpcManager } = session;
    const assembly = assemblyName
        ? await assemblyManager.waitForAssembly(assemblyName)
        : undefined;
    if (!assembly) {
        throw new Error('assembly not found');
    }
    const sessionId = 'getSequence';
    const feats = await rpcManager.call(sessionId, 'CoreGetFeatures', {
        adapterConfig: getConf(assembly, ['sequence', 'adapter']),
        sessionId,
        regions: [
            {
                start,
                end,
                refName: assembly.getCanonicalRefName(refName),
                assemblyName,
            },
        ],
    });
    const [feat] = feats;
    const seq = feat?.get('seq');
    return seq
        ? getProteinSequence({
            seq,
            feature,
            assemblyGeneticCodeId: assemblyGeneticCode(assembly, refName),
        })
        : undefined;
}
// v5 hosts only; a v4 assembly has neither the method nor the config slot
function assemblyGeneticCode(assembly, refName) {
    const { getGeneticCodeId } = assembly;
    return getGeneticCodeId?.call(assembly, refName);
}
