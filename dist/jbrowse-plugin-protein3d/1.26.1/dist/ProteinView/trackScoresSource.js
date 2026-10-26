import { readConfObject } from '@jbrowse/core/configuration';
import { scoreByBase, scoreByResidue } from './trackScores';
import { VariantEffectRefusal } from './variantEffects';
import { codingSpans, genomeToTranscriptSeqMapping } from '../mappings';
function number(value) {
    return typeof value === 'number' ? value : Number.NaN;
}
/**
 * The scores of a genome track under each residue of a transcript, reduced
 * over the three bases of its codon. Reads only the transcript's coding
 * spans, in one request, at the track's full resolution. A wiggle track gives
 * its `score`; any feature track works if its features carry one.
 */
export async function fetchTrackScores({ session, trackId, stat, feature, assemblyName, signal, }) {
    const conf = session.getTrackById(trackId);
    if (!conf) {
        throw new VariantEffectRefusal(`This session has no track "${trackId}"`);
    }
    const assembly = await session.assemblyManager.waitForAssembly(assemblyName);
    if (!assembly) {
        throw new Error(`assembly ${assemblyName} not found`);
    }
    const trackAssemblies = readConfObject(conf, 'assemblyNames');
    const names = new Set([assembly.name, ...assembly.aliases]);
    if (Array.isArray(trackAssemblies) &&
        !trackAssemblies.some(n => typeof n === 'string' && names.has(n))) {
        throw new VariantEffectRefusal(`Track "${trackId}" is on ${trackAssemblies.join(', ')}, not ${assembly.name}`);
    }
    const { p2gCodon, refName } = genomeToTranscriptSeqMapping(feature);
    const positions = Object.keys(p2gCodon).map(Number);
    const spans = codingSpans(p2gCodon, positions);
    const canonical = assembly.getCanonicalRefName(refName) ?? refName;
    const features = await session.rpcManager.call('residueValues', 'CoreGetFeatures', {
        adapterConfig: readConfObject(conf, 'adapter'),
        regions: spans.map(([start, end]) => ({
            assemblyName: assembly.name,
            refName: canonical,
            start,
            end,
        })),
        signal,
    });
    const baseScores = scoreByBase(features.map(f => ({
        start: number(f.get('start')),
        end: number(f.get('end')),
        score: number(f.get('score')),
    })), Object.values(p2gCodon).flat());
    return scoreByResidue(p2gCodon, baseScores, stat);
}
