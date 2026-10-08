import { getConf } from '@jbrowse/core/configuration';
import { fetchAlphaFoldModels, getAlphaFoldStructureUrl, pickAlphaFoldModel, searchUniProtEntries, } from 'p2s_mapper';
import { codingTranscripts } from './codingFeature';
import { rankIsoforms } from '../AlignTranscriptRpc';
import { fetchTranscriptProteinSeqs } from './utils/translateTranscripts';
import { extractFeatureIdentifiers, extractTaxonId } from './utils/util';
import { alignOffThread } from '../ProteinView/alignOffThread';
/** Why a resolved gene has no structure to open. */
export function describeMissingStructure(geneName, { uniprotId, lookupError }) {
    return uniprotId
        ? `AlphaFold DB has no model for ${uniprotId}`
        : lookupError === undefined
            ? `No single UniProt entry found for ${geneName}`
            : `UniProt lookup failed for ${geneName}: ${errorText(lookupError)}`;
}
function errorText(e) {
    return e instanceof Error ? e.message : `${e}`;
}
/**
 * The entry a search names without a person choosing: the only hit, or the
 * only reviewed one. A gene-name search answers with the Swiss-Prot entry and
 * a tail of TrEMBL fragments, so the first row alone would also be right for
 * most human genes, and wrong in silence for the rest.
 */
export function unambiguousEntry(entries) {
    const reviewed = entries.filter(e => e.isReviewed);
    return entries.length === 1
        ? entries[0]
        : reviewed.length === 1
            ? reviewed[0]
            : undefined;
}
export function sessionGeneLaunchHost(session, assemblyName) {
    return {
        translate: transcripts => fetchTranscriptProteinSeqs({ transcripts, session, assemblyName }),
        taxonId: async () => {
            const assembly = await session.assemblyManager.waitForAssembly(assemblyName);
            return assembly
                ? extractTaxonId(getConf(assembly, ['sequence', 'metadata']))
                : undefined;
        },
        rankIsoforms: (isoforms, structureSequences) => alignOffThread({
            rpcManager: session.rpcManager,
            name: 'ProteinRankIsoforms',
            args: { isoforms, structureSequences },
            inPlace: () => rankIsoforms(isoforms, structureSequences),
        }),
        searchUniProtEntries,
        fetchAlphaFoldModels,
    };
}
/**
 * The accession a feature's identifiers name, or undefined where a person has
 * to choose. A gene symbol means a different protein in every species, so
 * without the assembly's taxon only the database ids are searched. An
 * unreachable UniProt resolves rather than throws, because the dialog takes a
 * typed accession and a spec can name one, and carries the error so a caller
 * does not report an outage as a gene with no entry.
 */
async function searchForEntry(host, ids) {
    try {
        const organismId = await host.taxonId();
        const geneName = organismId === undefined ? undefined : ids.geneName;
        if (ids.recognizedIds.length === 0 && !geneName) {
            return {};
        }
        const { entries } = await host.searchUniProtEntries({
            recognizedIds: ids.recognizedIds,
            geneId: ids.geneId,
            geneName,
            organismId,
        });
        return { uniprotId: unambiguousEntry(entries)?.accession };
    }
    catch (e) {
        return { lookupError: e };
    }
}
/**
 * Everything the launch dialog works out from a gene, without the dialog: the
 * UniProt entry from the feature's identifiers, the AlphaFold model of that
 * entry, and the isoform to map — the preferred one when it translates, else
 * the one the model was folded from, else the longest.
 */
export async function resolveGeneLaunch({ host, feature, preferredTranscriptId, uniprotId: givenUniprotId, findStructure = true, }) {
    const ids = extractFeatureIdentifiers(feature, preferredTranscriptId);
    const namedUniprotId = givenUniprotId ?? (findStructure ? ids.uniprotId : undefined);
    const lookup = namedUniprotId !== undefined || !findStructure
        ? { uniprotId: namedUniprotId }
        : searchForEntry(host, ids);
    const [translations, { uniprotId, lookupError }] = await Promise.all([
        host.translate(codingTranscripts(feature)),
        lookup,
    ]);
    const translated = translations.flatMap(({ feature: transcript, seq }) => seq ? [{ transcript, seq }] : []);
    if (translated.length === 0) {
        throw new Error('none of the transcripts could be translated');
    }
    const isoforms = translated.map(t => ({
        id: t.transcript.id(),
        seq: t.seq,
    }));
    // An unreachable API says nothing about the accession, so the spelled
    // canonical filename is worth a try; an API answering with no models has
    // said there is nothing to open. The structure loader draws the same line.
    const models = uniprotId
        ? await host.fetchAlphaFoldModels(uniprotId).catch(() => undefined)
        : [];
    const model = models
        ? pickAlphaFoldModel(models, Object.fromEntries(isoforms.map(i => [i.id, { seq: i.seq ?? '' }])))
        : undefined;
    const url = uniprotId && models === undefined
        ? getAlphaFoldStructureUrl(uniprotId)
        : model?.url;
    const structureSequences = model ? [model.sequence] : [];
    const preferred = translated.find(t => t.transcript.id() === preferredTranscriptId);
    const ranking = preferred
        ? undefined
        : structureSequences.length > 0
            ? (await host.rankIsoforms(isoforms, structureSequences)).ranking
            : rankIsoforms(isoforms).ranking;
    const bestId = ranking && (ranking.matches[0] ?? ranking.nonMatches[0])?.id;
    const chosen = preferred ??
        translated.find(t => t.transcript.id() === bestId) ??
        translated[0];
    return {
        transcript: chosen.transcript,
        userProvidedTranscriptSequence: chosen.seq,
        uniprotId,
        lookupError,
        url,
    };
}
