import { SimpleFeature } from '@jbrowse/core/util';
import { clinVarBuild, isUnnumberedMitochondrion } from './clinVar';
import { VARIANT_EFFECT_SOURCE_NAMES, meanScoreByPosition, } from './variantEffects';
import { parseAlphaMissense } from '../AlphaMissensePathogenicityAdapter/parseAlphaMissense';
/**
 * AlphaMissense scores a UniProt entry, so a PDB entry waits for SIFTS to name
 * one. An isoform model is numbered for the isoform while the scores number
 * the entry, so it asks nothing.
 */
export function alphaMissenseAsk({ uniprotId, isoformAccession, isLoading, }) {
    const source = VARIANT_EFFECT_SOURCE_NAMES.alphamissense;
    return isLoading
        ? { status: 'waiting' }
        : isoformAccession
            ? {
                status: 'unavailable',
                reason: `${source} are numbered for the canonical entry, not isoform ${isoformAccession}`,
            }
            : uniprotId
                ? {
                    status: 'ready',
                    request: {
                        scheme: 'alphamissense',
                        key: `alphamissense:${uniprotId}`,
                        label: uniprotId,
                        accession: uniprotId,
                    },
                }
                : {
                    status: 'unavailable',
                    reason: `No UniProt entry to place ${source} on`,
                };
}
/**
 * ClinVar is read off the genome under the structure's transcript, so it needs
 * the transcript and the assembly the genome view shows it on, which NCBI has
 * to publish a VCF for. `assemblyNames` are that assembly's names and aliases.
 */
export function clinVarAsk({ feature, assemblyName, assemblyNames, }) {
    const source = VARIANT_EFFECT_SOURCE_NAMES.clinvar;
    const build = clinVarBuild(assemblyNames);
    if (!feature) {
        return {
            status: 'unavailable',
            reason: `No transcript to place ${source} on`,
        };
    }
    if (!assemblyName) {
        return {
            status: 'unavailable',
            reason: `No genome view to read ${source} on`,
        };
    }
    if (!build) {
        return {
            status: 'unavailable',
            reason: `NCBI publishes ${source} on GRCh38 and GRCh37, not ${assemblyName}`,
        };
    }
    const { refName, start, end, uniqueId } = feature;
    if (isUnnumberedMitochondrion(refName, build)) {
        return {
            status: 'unavailable',
            reason: `${assemblyName}'s ${refName} is NC_001807, not the rCRS mitochondrion ClinVar's GRCh37 VCF numbers`,
        };
    }
    const name = [feature.name, feature.id].find(n => typeof n === 'string');
    return {
        status: 'ready',
        request: {
            scheme: 'clinvar',
            key: `clinvar:${build}:${assemblyName}:${refName}:${start}-${end}:${uniqueId}`,
            label: name ?? `${refName}:${start + 1}-${end}`,
            build,
            assemblyName,
            feature,
        },
    };
}
// TP53's ClinVar slice is under 1 MB, but a stalled host should not leave a
// structure waiting on it for good
const DOWNLOAD_TIMEOUT_MS = 60_000;
/**
 * Runs `task` against a timeout. The signal reaches the fetches, but not an
 * assembly load or the genome sequence RPC, so the whole task races it too.
 */
export function withTimeout(task, timeoutMs) {
    const signal = AbortSignal.timeout(timeoutMs);
    return Promise.race([
        task(signal),
        new Promise((_, reject) => {
            signal.addEventListener('abort', () => {
                reject(new Error(`no answer in ${timeoutMs / 1000} s`));
            });
        }),
    ]);
}
async function load(request, session, signal) {
    if (request.scheme === 'alphamissense') {
        const response = await fetch(`https://alphafold.ebi.ac.uk/files/AF-${request.accession}-F1-aa-substitutions.csv`, { signal });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return meanScoreByPosition(parseAlphaMissense(await response.text()));
    }
    const { fetchClinVarCounts } = await import('./clinVarSource');
    return {
        numbering: 'transcript',
        byPosition: await fetchClinVarCounts({
            build: request.build,
            feature: new SimpleFeature(request.feature),
            assemblyName: request.assemblyName,
            session,
            signal,
        }),
    };
}
const cache = new Map();
/**
 * A request's values, fetched once per key for every structure and view of
 * the page. A failure is forgotten, so the next request tries again.
 */
export function fetchVariantEffects(request, session) {
    let values = cache.get(request.key);
    if (!values) {
        values = withTimeout(signal => load(request, session, signal), DOWNLOAD_TIMEOUT_MS);
        values.catch(() => {
            cache.delete(request.key);
        });
        cache.set(request.key, values);
    }
    return values;
}
