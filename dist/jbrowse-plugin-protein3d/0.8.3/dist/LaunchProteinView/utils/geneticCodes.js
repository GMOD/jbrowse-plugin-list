const ncbiGeneticCodes = [
    {
        id: 1,
        name: 'Standard',
        ncbieaa: 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '---M------**--*----M---------------M----------------------------',
    },
    {
        id: 2,
        name: 'Vertebrate Mitochondrial',
        ncbieaa: 'FFLLSSSSYY**CCWWLLLLPPPPHHQQRRRRIIMMTTTTNNKKSS**VVVVAAAADDEEGGGG',
        sncbieaa: '----------**--------------------MMMM----------**---M------------',
    },
    {
        id: 3,
        name: 'Yeast Mitochondrial',
        ncbieaa: 'FFLLSSSSYY**CCWWTTTTPPPPHHQQRRRRIIMMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '----------**----------------------MM---------------M------------',
    },
    {
        id: 4,
        name: 'Mold Mitochondrial; Protozoan Mitochondrial; Coelenterate Mitochondrial; Mycoplasma; Spiroplasma',
        ncbieaa: 'FFLLSSSSYY**CCWWLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '--MM------**-------M------------MMMM---------------M------------',
    },
    {
        id: 5,
        name: 'Invertebrate Mitochondrial',
        ncbieaa: 'FFLLSSSSYY**CCWWLLLLPPPPHHQQRRRRIIMMTTTTNNKKSSSSVVVVAAAADDEEGGGG',
        sncbieaa: '---M------**--------------------MMMM---------------M------------',
    },
    {
        id: 6,
        name: 'Ciliate Nuclear; Dasycladacean Nuclear; Hexamita Nuclear',
        ncbieaa: 'FFLLSSSSYYQQCC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '--------------*--------------------M----------------------------',
    },
    {
        id: 9,
        name: 'Echinoderm Mitochondrial; Flatworm Mitochondrial',
        ncbieaa: 'FFLLSSSSYY**CCWWLLLLPPPPHHQQRRRRIIIMTTTTNNNKSSSSVVVVAAAADDEEGGGG',
        sncbieaa: '----------**-----------------------M---------------M------------',
    },
    {
        id: 10,
        name: 'Euplotid Nuclear',
        ncbieaa: 'FFLLSSSSYY**CCCWLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '----------**-----------------------M----------------------------',
    },
    {
        id: 11,
        name: 'Bacterial, Archaeal and Plant Plastid',
        ncbieaa: 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '---M------**--*----M------------MMMM---------------M------------',
    },
    {
        id: 12,
        name: 'Alternative Yeast Nuclear',
        ncbieaa: 'FFLLSSSSYY**CC*WLLLSPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '----------**--*----M---------------M----------------------------',
    },
    {
        id: 13,
        name: 'Ascidian Mitochondrial',
        ncbieaa: 'FFLLSSSSYY**CCWWLLLLPPPPHHQQRRRRIIMMTTTTNNKKSSGGVVVVAAAADDEEGGGG',
        sncbieaa: '---M------**----------------------MM---------------M------------',
    },
    {
        id: 14,
        name: 'Alternative Flatworm Mitochondrial',
        ncbieaa: 'FFLLSSSSYYY*CCWWLLLLPPPPHHQQRRRRIIIMTTTTNNNKSSSSVVVVAAAADDEEGGGG',
        sncbieaa: '-----------*-----------------------M----------------------------',
    },
    {
        id: 15,
        name: 'Blepharisma Macronuclear',
        ncbieaa: 'FFLLSSSSYY*QCC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '----------*---*--------------------M----------------------------',
    },
    {
        id: 16,
        name: 'Chlorophycean Mitochondrial',
        ncbieaa: 'FFLLSSSSYY*LCC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '----------*---*--------------------M----------------------------',
    },
    {
        id: 21,
        name: 'Trematode Mitochondrial',
        ncbieaa: 'FFLLSSSSYY**CCWWLLLLPPPPHHQQRRRRIIMMTTTTNNNKSSSSVVVVAAAADDEEGGGG',
        sncbieaa: '----------**-----------------------M---------------M------------',
    },
    {
        id: 22,
        name: 'Scenedesmus obliquus Mitochondrial',
        ncbieaa: 'FFLLSS*SYY*LCC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '------*---*---*--------------------M----------------------------',
    },
    {
        id: 23,
        name: 'Thraustochytrium Mitochondrial',
        ncbieaa: 'FF*LSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '--*-------**--*-----------------M--M---------------M------------',
    },
    {
        id: 24,
        name: 'Rhabdopleuridae Mitochondrial',
        ncbieaa: 'FFLLSSSSYY**CCWWLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSSKVVVVAAAADDEEGGGG',
        sncbieaa: '---M------**-------M---------------M---------------M------------',
    },
    {
        id: 25,
        name: 'Candidate Division SR1 and Gracilibacteria',
        ncbieaa: 'FFLLSSSSYY**CCGWLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '---M------**-----------------------M---------------M------------',
    },
    {
        id: 26,
        name: 'Pachysolen tannophilus Nuclear',
        ncbieaa: 'FFLLSSSSYY**CC*WLLLAPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '----------**--*----M---------------M----------------------------',
    },
    {
        id: 27,
        name: 'Karyorelict Nuclear',
        ncbieaa: 'FFLLSSSSYYQQCCWWLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '--------------*--------------------M----------------------------',
    },
    {
        id: 28,
        name: 'Condylostoma Nuclear',
        ncbieaa: 'FFLLSSSSYYQQCCWWLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '----------**--*--------------------M----------------------------',
    },
    {
        id: 29,
        name: 'Mesodinium Nuclear',
        ncbieaa: 'FFLLSSSSYYYYCC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '--------------*--------------------M----------------------------',
    },
    {
        id: 30,
        name: 'Peritrich Nuclear',
        ncbieaa: 'FFLLSSSSYYEECC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '--------------*--------------------M----------------------------',
    },
    {
        id: 31,
        name: 'Blastocrithidia Nuclear',
        ncbieaa: 'FFLLSSSSYYEECCWWLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '----------**-----------------------M----------------------------',
    },
    {
        id: 32,
        name: 'Balanophoraceae Plastid',
        ncbieaa: 'FFLLSSSSYY*WCC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
        sncbieaa: '---M------*---*----M------------MMMM---------------M------------',
    },
    {
        id: 33,
        name: 'Cephalodiscidae Mitochondrial',
        ncbieaa: 'FFLLSSSSYYY*CCWWLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSSKVVVVAAAADDEEGGGG',
        sncbieaa: '---M-------*-------M---------------M---------------M------------',
    },
];
// The codon order shared by every NCBI table -- the Base1/Base2/Base3 comment
// rows in gc.prt. codon i = BASE1[i] + BASE2[i] + BASE3[i].
const BASE1 = 'TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG';
const BASE2 = 'TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG';
const BASE3 = 'TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG';
const CODONS = Array.from({ length: 64 }, (_, i) => BASE1[i] + BASE2[i] + BASE3[i]);
const ncbiCodeById = new Map(ncbiGeneticCodes.map(t => [t.id, t]));
// Expand an uppercase codon map so every case combination of a triplet resolves,
// which is what callers reading raw sequence need.
function caseExpand(table) {
    const out = {};
    for (const [codon, aa] of Object.entries(table)) {
        const cases = (i) => {
            const n = codon.charAt(i);
            return [n.toUpperCase(), n.toLowerCase()];
        };
        for (const n0 of cases(0)) {
            for (const n1 of cases(1)) {
                for (const n2 of cases(2)) {
                    out[n0 + n1 + n2] = aa;
                }
            }
        }
    }
    return out;
}
function buildGeneticCode(id) {
    const def = ncbiCodeById.get(id);
    if (!def && id !== 1) {
        console.warn(`Unknown genetic code (transl_table=${id}); using standard code`);
    }
    const { id: resolvedId, name, ncbieaa, sncbieaa, } = def ?? ncbiCodeById.get(1);
    const table = {};
    const starts = [];
    for (const [i, codon] of CODONS.entries()) {
        table[codon] = ncbieaa[i];
        if (sncbieaa[i] === 'M') {
            starts.push(codon);
        }
    }
    return { id: resolvedId, name, codonTable: caseExpand(table), starts };
}
const geneticCodeCache = new Map();
// Resolves the codon map + start set for an NCBI translation-table id, falling
// back to the standard code (1) for an unrecognized id. Memoized: there are only
// ~27 tables and each result is immutable.
export function getGeneticCode(id = 1) {
    let code = geneticCodeCache.get(id);
    if (!code) {
        code = buildGeneticCode(id);
        geneticCodeCache.set(id, code);
    }
    return code;
}
// Parses a GFF/GenBank `transl_table` attribute value into an NCBI table id. The
// GFF adapter yields a string (or an array if the attribute repeated), so this
// normalizes both; returns undefined for a missing or non-positive-integer value
// so callers fall back to their default code.
export function parseTranslTable(value) {
    const raw = Array.isArray(value) ? value[0] : value;
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : undefined;
}
