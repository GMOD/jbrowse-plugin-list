import Plugin from '@jbrowse/core/Plugin';
import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import SimpleFeature from '@jbrowse/core/util/simpleFeature';
import AbortablePromiseCache from 'abortable-promise-cache';
import QuickLRU from '@jbrowse/core/util/QuickLRU';
import { ConfigurationSchema, readConfObject } from '@jbrowse/core/configuration';
import format from 'string-template';

var version = "1.1.1";

const configSchema$1 = ConfigurationSchema('MyGeneV3Adapter', {
    baseUrl: {
        type: 'string',
        defaultValue: '',
    },
}, { explicitlyTyped: true });
// translate thickStart/thickEnd to utr's
// adapted from BigBedAdapter for ucsc thickStart/thickEnd
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cdsStartEndProcessor(feature) {
    // split the blocks into UTR, CDS, and exons
    const { thickStart, thickEnd, refName, strand, subfeatures } = feature;
    if (!thickStart && !thickEnd) {
        return feature;
    }
    const blocks = subfeatures
        ? subfeatures.sort((a, b) => a.start - b.start)
        : [];
    const newChildren = blocks
        .map(({ start, end }) => {
        if (thickStart >= end) {
            // left-side UTR
            const prime = strand > 0 ? 'five' : 'three';
            return {
                type: `${prime}_prime_UTR`,
                start,
                end,
            };
        }
        else if (thickStart > start && thickStart < end && thickEnd >= end) {
            // UTR | CDS
            const prime = strand > 0 ? 'five' : 'three';
            return [
                {
                    type: `${prime}_prime_UTR`,
                    start,
                    end: thickStart,
                },
                {
                    type: 'CDS',
                    start: thickStart,
                    end,
                    refName,
                },
            ];
        }
        else if (thickStart <= start && thickEnd >= end) {
            // CDS
            return {
                type: 'CDS',
                start,
                end,
            };
        }
        else if (thickStart > start && thickStart < end && thickEnd < end) {
            // UTR | CDS | UTR
            const leftPrime = strand > 0 ? 'five' : 'three';
            const rightPrime = strand > 0 ? 'three' : 'five';
            return [
                {
                    type: `${leftPrime}_prime_UTR`,
                    start,
                    end: thickStart,
                },
                {
                    type: `CDS`,
                    start: thickStart,
                    end: thickEnd,
                },
                {
                    type: `${rightPrime}_prime_UTR`,
                    start: thickEnd,
                    end,
                },
            ];
        }
        else if (thickStart <= start && thickEnd > start && thickEnd < end) {
            // CDS | UTR
            const prime = strand > 0 ? 'three' : 'five';
            return [
                {
                    type: `CDS`,
                    start,
                    end: thickEnd,
                },
                {
                    type: `${prime}_prime_UTR`,
                    start: thickEnd,
                    end,
                },
            ];
        }
        else if (thickEnd <= start) {
            // right-side UTR
            const prime = strand > 0 ? 'three' : 'five';
            return {
                type: `${prime}_prime_UTR`,
                start,
                end,
            };
        }
        return undefined;
    })
        .filter(f => !!f)
        .flat();
    return {
        ...feature,
        subfeatures: newChildren.map(r => ({ ...r, refName })),
        type: 'mRNA',
    };
}
let AdapterClass$1 = class AdapterClass extends BaseFeatureDataAdapter {
    featureCache = new AbortablePromiseCache({
        cache: new QuickLRU({ maxSize: 100 }),
        fill: args => this.readChunk(args),
    });
    async getRefNames(_ = {}) {
        return [];
    }
    getFeatures(query, opts = {}) {
        const baseUrl = readConfObject(this.config, 'baseUrl');
        return ObservableCreate(async (observer) => {
            const chunkSize = 100000;
            const s = query.start - (query.start % chunkSize);
            const e = query.end + (chunkSize - (query.end % chunkSize));
            const chunks = [];
            for (let start = s; start < e; start += chunkSize) {
                chunks.push({
                    refName: query.refName,
                    start,
                    end: start + chunkSize,
                    assemblyName: query.assemblyName,
                    baseUrl,
                });
            }
            await Promise.all(chunks.map(async (chunk) => {
                const key = `${chunk.assemblyName},${chunk.refName},${chunk.start},${chunk.end}`;
                const signal = opts.signal;
                const features = await this.featureCache.get(key, chunk, signal);
                features.forEach(feature => {
                    if (feature &&
                        !(feature.get('start') > query.end) &&
                        feature.get('end') >= query.start) {
                        observer.next(feature);
                    }
                });
            }));
            observer.complete();
        }, opts.signal);
    }
    async readChunk(chunk) {
        const { start, end, refName, baseUrl } = chunk;
        const ref = refName.startsWith('chr') ? refName : `chr${refName}`;
        const url = format(baseUrl, { ref, start, end });
        const hg19 = Number(baseUrl.includes('hg19'));
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${response.status} ${response.statusText}`);
        }
        const featureData = await response.json();
        // @ts-expect-error
        return featureData.hits.map(feature => {
            const { genomic_pos, genomic_pos_hg19, exons, exons_hg19, _id, _score, _license, ...rest } = feature;
            let genomicPos = [genomic_pos, genomic_pos_hg19][hg19];
            if (Array.isArray(genomicPos)) {
                genomicPos = genomicPos.find(pos => {
                    return refName.replace('chr', '') === pos.chr;
                });
            }
            let transcriptData = [exons, exons_hg19][hg19];
            if (!transcriptData) {
                return new SimpleFeature({
                    id: _id,
                    data: {
                        ...rest,
                        refName: genomicPos.chr,
                        start: genomicPos.start,
                        end: genomicPos.end,
                        strand: genomicPos.strand,
                        name: feature.symbol,
                        description: feature.name,
                        type: 'gene',
                    },
                });
            }
            // this is a weird hack because mygene.info returns features on other
            // chromosomes that are close homologues, and the homologues aren't even
            // clear on whether they are located on the chromosome you are querying
            // on because it returns a set of locations of all the other homologues,
            // so this tries to filter those out
            if (feature.map_location &&
                !feature.map_location.match(`^${genomicPos.chr}(p|q)`)) {
                return null;
            }
            if (transcriptData) {
                // @ts-expect-error
                transcriptData = transcriptData.filter(transcript => {
                    return feature.map_location?.startsWith(transcript.chr);
                });
            }
            if (transcriptData && transcriptData.length) {
                const transcripts = transcriptData
                    // @ts-expect-error
                    .map((transcript, index) => {
                    return {
                        start: transcript.txstart,
                        end: transcript.txend,
                        name: transcript.transcript,
                        strand: transcript.strand,
                        thickStart: transcript.cdsstart,
                        thickEnd: transcript.cdsend,
                        refName: genomicPos.chr,
                        // @ts-expect-error
                        subfeatures: transcript.position.map(pos => ({
                            start: pos[0],
                            end: pos[1],
                            strand: transcript.strand,
                            type: 'exon',
                        })),
                    };
                })
                    // @ts-expect-error
                    .filter(t => {
                    // another weird filter to avoid transcripts that are outside the
                    // range of the genomic pos. the +/-1000 added for ATAD3C, SKI2, MEGF6
                    return (t.start >= genomicPos.start - 2000 &&
                        t.end <= genomicPos.end + 2000);
                })
                    // @ts-expect-error
                    .map(feat => {
                    return feature.type_of_gene === 'protein-coding'
                        ? cdsStartEndProcessor(feat)
                        : feat;
                });
                // maybe worth reviewing but SvgFeatureRenderer has very bad behavior
                // if subfeatures go outside of the bounds of the parent feature so
                // this is needed
                const [min, max] = [
                    // @ts-expect-error
                    Math.min(...[genomicPos.start, ...transcripts.map(t => t.start)]),
                    // @ts-expect-error
                    Math.max(...[genomicPos.end, ...transcripts.map(t => t.end)]),
                ];
                return new SimpleFeature({
                    id: _id,
                    data: {
                        ...rest,
                        refName: genomicPos.chr,
                        start: min,
                        end: max,
                        strand: genomicPos.strand,
                        name: feature.symbol,
                        description: feature.name,
                        type: 'gene',
                        subfeatures: transcripts,
                    },
                });
            }
            return null;
        });
    }
    freeResources( /* { region } */) { }
};
function MyGeneAdapterF(pluginManager) {
    pluginManager.addAdapterType(() => {
        return new AdapterType({
            name: 'MyGeneV3Adapter',
            configSchema: configSchema$1,
            AdapterClass: AdapterClass$1,
        });
    });
}

async function myfetch(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${response.status} ${response.statusText}`);
    }
    return response.json();
}
function processFeat(f, refName) {
    const start = +f._id.match(/chr.*:g.([0-9]+)/)[1];
    const feature = new SimpleFeature({
        uniqueId: f._id,
        start: start - 1,
        end: start,
        name: f._id,
        refName,
    });
    function process(str, data, plus) {
        if (!data)
            return;
        if (str.match(/snpeff/)) {
            if (Array.isArray(data.ann)) {
                data.ann.forEach((fm, i) => {
                    process(str + '_' + i, fm, i);
                });
                return;
            }
            else if (data.ann) {
                delete data.ann.cds;
                delete data.ann.cdna;
                delete data.ann.protein;
            }
            else {
                delete data.cds; // sub-sub-objects, not super informative
                delete data.cdna;
                delete data.protein;
            }
        }
        if (str.match(/cadd/)) {
            if (data.encode) {
                process(str + '_encode', data.encode);
            }
            delete data.encode;
        }
        if (str.match(/clinvar/)) {
            process(str + '_hgvs', data.hgvs);
            delete data.hgvs;
            if (Array.isArray(data.rcv))
                data.rcv.forEach((elt, i) => {
                    process(str + '_rcv' + i, elt);
                });
            else
                process(str + '_rcv', data.rcv);
            delete data.rcv;
        }
        if (str.match(/grasp/)) {
            if (Array.isArray(data.publication)) {
                data.publication.forEach((fm, iter) => {
                    process(str + '_publication' + iter, fm);
                });
            }
            delete data.publication;
        }
        // @ts-ignore
        feature.data[str + '_attrs' + (plus || '')] = {};
        const valkeys = Object.keys(data).filter(key => {
            return typeof data[key] !== 'object';
        });
        const objkeys = Object.keys(data).filter(key => {
            return typeof data[key] === 'object' && key !== 'gene';
        });
        valkeys.forEach(key => {
            // @ts-ignore
            feature.data[str + '_attrs' + (plus || '')][key] = data[key];
        });
        objkeys.forEach(key => {
            // @ts-ignore
            feature.data[str + '_' + key + (plus || '')] = data[key];
        });
    }
    process('cadd', f.cadd);
    process('cosmic', f.cosmic);
    process('dbnsfp', f.dbnsfp);
    process('dbsnp', f.dbsnp);
    process('evs', f.evs);
    process('exac', f.exac);
    process('mutdb', f.mutdb);
    process('wellderly', f.wellderly);
    process('snpedia', f.snpedia);
    process('snpeff', f.snpeff);
    process('vcf', f.vcf);
    process('grasp', f.grasp);
    process('gwassnps', f.gwassnps);
    process('docm', f.docm);
    process('emv', f.emv);
    process('clinvar', f.clinvar);
    process('uniprot', f.uniprot);
    return feature;
}
const configSchema = ConfigurationSchema('MyVariantV1Adapter', {
    baseUrl: {
        type: 'string',
        defaultValue: '',
    },
    query: {
        type: 'string',
        defaultValue: '',
    },
}, { explicitlyTyped: true });
class AdapterClass extends BaseFeatureDataAdapter {
    async getRefNames(_ = {}) {
        return [];
    }
    getFeatures(query, opts = {}) {
        const baseUrl = this.getConf('baseUrl');
        const queryQ = this.getConf('query');
        const { start: qs, end: qe, refName } = query;
        return ObservableCreate(async (observer) => {
            const features = (await this.readChunk({
                start: qs,
                end: qe,
                refName,
                baseUrl,
                query: queryQ,
            }));
            // console.log(JSON.stringify(features))
            features.forEach(f => observer.next(f));
            observer.complete();
        }, opts.signal);
    }
    async readChunk(chunk) {
        const { start, end, refName, baseUrl, query } = chunk;
        const ref = refName.startsWith('chr') ? refName : `chr${refName}`;
        const newBase = format(baseUrl + query, { ref, start, end });
        const featureData = await myfetch(newBase);
        const { hits = [] } = featureData;
        const returnFeatures = [];
        const iter = async (scrollId, scroll) => {
            const scrollurl = format(baseUrl + 'query?scroll_id={scrollId}&size={size}&from={from}', { scrollId: scrollId, size: 1000, from: scroll });
            const featureResults = await myfetch(scrollurl);
            const { hits = [] } = featureResults;
            returnFeatures.push(...hits.map(f => processFeat(f, refName)));
            if (hits.length >= 1000) {
                await iter(scrollId, scroll + 1000);
            }
        };
        if (hits.length >= 1000) {
            // setup scroll query
            const fetchAllResult = await myfetch(newBase + '&fetch_all=true');
            await iter(fetchAllResult._scroll_id, 0);
        }
        else if (hits) {
            returnFeatures.push(...hits.map(f => processFeat(f, refName)));
        }
        return returnFeatures;
    }
    freeResources( /* { region } */) { }
}
function MyVariantAdapterF(pluginManager) {
    pluginManager.addAdapterType(() => {
        return new AdapterType({
            name: 'MyVariantV1Adapter',
            configSchema,
            AdapterClass,
        });
    });
}

class index extends Plugin {
    name = 'Biothings';
    version = version;
    install(pluginManager) {
        MyGeneAdapterF(pluginManager);
        MyVariantAdapterF(pluginManager);
    }
}

export { index as default };
//# sourceMappingURL=index.esm.js.map
