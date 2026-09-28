function getGenArkConfigUrl(accession) {
    const [base, rest] = accession.split('_');
    if (!rest) {
        return undefined;
    }
    const match = rest.match(/.{1,3}/g);
    if (!match || match.length < 3) {
        return undefined;
    }
    const [b1, b2, b3] = match;
    return `https://jbrowse.org/hubs/genark/${base}/${b1}/${b2}/${b3}/${accession}/config.json`;
}
// Candidate urls for an assembly name, most preferred first. The connection
// probe and the describe lookup each take the first that exists, so a name with
// no hosted config anywhere is still answered by staying quiet.
//
// A UCSC db gets `minimal.json` ahead of `config.json`. Both carry the same
// `assemblies` block (minimal.json is a filtered copy of config.json, tracks
// dropped to NCBI RefSeq / GENCODE / RepeatMasker / gaps), and the assembly is
// the whole reason this connection exists — the tracks are a bonus for the
// panel it opens. The full config is an expensive way to learn a sequence
// adapter: hg38 is 2.1MB against minimal's 300KB, hg19 1.35MB against 57KB,
// hs1 603KB against 12KB, and the parse is followed by MST instantiating every
// track config in it on the main thread (hg38 595 against 33, hs1 624 against
// 7). hg38 alone names 239 distinct mate assemblies across its 239 synteny
// tracks, so a session that opens a few of them pays this several times over.
//
// What minimal.json costs is the mate genome's long tail — conservation,
// expression, the rest of the hub. Those are still one "Add connection" away
// on the full config url, and nothing about this panel implied they were
// coming. GenArk hubs have no minimal.json and don't need one; their whole
// config is ~40KB.
export function getConfigUrls(assemblyName) {
    if (!/^[\w.]+$/.test(assemblyName)) {
        return [];
    }
    if (assemblyName.startsWith('GCA_') || assemblyName.startsWith('GCF_')) {
        const url = getGenArkConfigUrl(assemblyName);
        return url ? [url] : [];
    }
    const base = `https://jbrowse.org/ucsc/${assemblyName}`;
    return [`${base}/minimal.json`, `${base}/config.json`];
}
//# sourceMappingURL=configUrls.js.map