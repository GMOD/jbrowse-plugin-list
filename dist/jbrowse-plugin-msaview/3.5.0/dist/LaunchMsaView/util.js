import { getContainingView, sum } from '@jbrowse/core/util';
export function getLinearGenomeView(model) {
    return getContainingView(model);
}
function uniqueDefined(vals) {
    return [...new Set(vals.filter((v) => !!v))];
}
function joinDefined(sep, parts) {
    return parts.filter((p) => !!p).join(sep);
}
export function getTranscriptFeatures(feature) {
    // check if we are looking at a 'two-level' or 'three-level' feature by
    // finding exon/CDS subfeatures. we want to select from transcript names
    const subfeatures = feature.get('subfeatures') ?? [];
    // Check for mRNA/transcript subfeatures (three-level: gene → mRNA → CDS)
    // Filter to only those that have CDS subfeatures (i.e. are coding)
    const transcripts = subfeatures.filter((f) => (f.get('type') === 'mRNA' || f.get('type') === 'transcript') &&
        f.get('subfeatures')?.some((s) => s.get('type') === 'CDS'));
    if (transcripts.length > 0) {
        return transcripts;
    }
    // Has direct CDS children, treat feature itself as the transcript
    // (two-level: gene → CDS or mRNA → CDS)
    return [feature];
}
export function getTranscriptLength(feature) {
    const cdsLen = sum(feature
        .get('subfeatures')
        ?.filter(f => f.get('type') === 'CDS')
        .map(s => s.get('end') - s.get('start')) ?? []);
    return {
        len: Math.floor(cdsLen / 3),
        mod: cdsLen % 3,
    };
}
export function getId(val) {
    return val?.id() ?? '';
}
export function getMatchableIds(val) {
    return val
        ? uniqueDefined([
            val.id(),
            val.get('name'),
            val.get('id'),
            val.get('transcript_id'),
        ])
        : [];
}
export function featureMatchesId(feature, id) {
    return getMatchableIds(feature).includes(id);
}
export function getTranscriptDisplayName(val) {
    return val ? joinDefined(' ', [val.get('name'), val.get('id')]) : '';
}
export function getGeneDisplayName(val) {
    return val
        ? joinDefined(' ', [
            val.get('gene_name') ?? val.get('name'),
            val.get('id') ? `(${val.get('id')})` : undefined,
        ])
        : '';
}
export function getBlastViewTitle(feature, transcript) {
    return `BLAST - ${getGeneDisplayName(feature)} - ${getTranscriptDisplayName(transcript)}`;
}
export function getSortedTranscriptFeatures(feature) {
    const transcripts = getTranscriptFeatures(feature);
    return transcripts.toSorted((a, b) => getTranscriptLength(b).len - getTranscriptLength(a).len);
}
export function cleanProteinSequence(seq) {
    return seq.replaceAll('*', '').replaceAll('&', '');
}
export function getGeneIdentifiers(feature) {
    return uniqueDefined([
        feature.id(),
        feature.get('id'),
        feature.get('name'),
        feature.get('gene_id'),
        feature.get('gene_name'),
    ]);
}
