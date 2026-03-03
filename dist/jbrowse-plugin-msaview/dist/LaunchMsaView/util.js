import { sum } from '@jbrowse/core/util';
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
        ?.filter(f => f.get('type')?.toLowerCase() === 'cds')
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
    if (!val) {
        return [];
    }
    const ids = [
        val.id(),
        val.get('name'),
        val.get('id'),
        val.get('transcript_id'),
    ].filter((id) => !!id);
    return [...new Set(ids)];
}
export function featureMatchesId(feature, id) {
    return getMatchableIds(feature).includes(id);
}
export function getTranscriptDisplayName(val) {
    return val === undefined
        ? ''
        : [val.get('name'), val.get('id')].filter(f => !!f).join(' ');
}
export function getGeneDisplayName(val) {
    return val === undefined
        ? ''
        : [
            val.get('gene_name') ?? val.get('name'),
            val.get('id') ? `(${val.get('id')})` : '',
        ]
            .filter(f => !!f)
            .join(' ');
}
export function getSortedTranscriptFeatures(feature) {
    const transcripts = getTranscriptFeatures(feature);
    return transcripts.toSorted((a, b) => getTranscriptLength(b).len - getTranscriptLength(a).len);
}
export function cleanProteinSequence(seq) {
    return seq.replaceAll('*', '').replaceAll('&', '');
}
//# sourceMappingURL=util.js.map