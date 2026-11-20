import { TabixIndexedFile } from '@gmod/tabix';
import { getGeneticCode } from '@jbrowse/core/util/geneticCodes';
import { transcriptGeneticCodeId } from '@jbrowse/core/util/translateTranscript';
import { clinVarRefName, clinVarVcfUrl, isPathogenic, isWrongBuild, parseClinVarMissense, placeMissenseOnTranscript, substitutionCountByResidue, } from './clinVar';
import { VariantEffectRefusal } from './variantEffects';
import { fetchRegionSequence } from '../LaunchProteinView/utils/translateTranscripts';
import { genomeToTranscriptSeqMapping } from '../mappings';
const files = new Map();
function clinVarVcf(build) {
    let file = files.get(build);
    if (!file) {
        const url = clinVarVcfUrl(build);
        file = new TabixIndexedFile({ url, tbiUrl: `${url}.tbi` });
        files.set(build, file);
    }
    return file;
}
async function readMissense(build, refNames, start, end, signal) {
    const file = clinVarVcf(build);
    const names = await file.getReferenceSequenceNames({ signal });
    const refName = refNames
        .map(n => clinVarRefName(n, build))
        .find(n => n !== undefined && names.includes(n));
    if (!refName) {
        throw new Error(`ClinVar's ${build} VCF has no sequence ${refNames[0]}`);
    }
    const variants = [];
    await file.getLines(refName, start, end, {
        signal,
        lineCallback: line => {
            const variant = parseClinVarMissense(line);
            if (variant) {
                variants.push(variant);
            }
        },
    });
    return variants;
}
/**
 * Every missense substitution ClinVar classifies on a transcript, read from
 * NCBI's VCF by range over the transcript's coding span and translated on
 * the genome under it. Refuses when the genome is plainly another build.
 */
export async function placeClinVarOnTranscript({ build, feature, assemblyName, session, signal, }) {
    const { p2gCodon, strand, refName } = genomeToTranscriptSeqMapping(feature);
    const positions = Object.values(p2gCodon).flat();
    if (positions.length === 0) {
        throw new Error('the transcript has no coding sequence');
    }
    // reduced, not spread: TTN's 100k coding bases pass JavaScriptCore's
    // argument limit
    const start = positions.reduce((a, b) => Math.min(a, b));
    const end = positions.reduce((a, b) => Math.max(a, b)) + 1;
    const assembly = await session.assemblyManager.waitForAssembly(assemblyName);
    const [variants, genome] = await Promise.all([
        readMissense(build, [refName, ...(assembly?.getAliasesForRefName(refName) ?? [])], start, end, signal),
        fetchRegionSequence({ session, assemblyName, refName, start, end, signal }),
    ]);
    const { seq, assemblyGeneticCodeId } = genome;
    if (!seq) {
        throw new Error('no genome sequence under the transcript');
    }
    const placement = placeMissenseOnTranscript({
        variants,
        p2gCodon,
        strand,
        genomeBase: position => seq[position - start],
        codonTable: getGeneticCode(transcriptGeneticCodeId(feature, assemblyGeneticCodeId)).codonTable,
    });
    if (isWrongBuild(placement)) {
        throw new VariantEffectRefusal(`ClinVar's REF disagrees with this assembly's sequence at ${placement.disagreeing} of ${placement.checked} variants; is the assembly ${build}?`);
    }
    return placement;
}
/**
 * The pathogenic missense count at each residue of a transcript, zero
 * included for every residue with a whole codon; two codon changes to one
 * amino acid count once.
 */
export async function fetchClinVarCounts(args) {
    const { placed, residues } = await placeClinVarOnTranscript(args);
    return substitutionCountByResidue(placed.filter(p => isPathogenic(p.variant.significance)), residues);
}
