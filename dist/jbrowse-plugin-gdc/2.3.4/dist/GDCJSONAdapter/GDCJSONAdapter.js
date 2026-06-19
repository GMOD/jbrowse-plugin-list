import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import { readConfObject } from '@jbrowse/core/configuration';
import GDCFeature from '../GDCAdapter/GDCFeature';
import AbortablePromiseCache from 'abortable-promise-cache';
import LRU from '@jbrowse/core/util/QuickLRU';
class GDCJSONAdapter extends BaseFeatureDataAdapter {
    async fetchFeatures(query, signal) {
        const response = await fetch('https://api.gdc.cancer.gov/v0/graphql', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(query),
            signal,
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    constructor(config) {
        super(config);
        this.featureCache = new AbortablePromiseCache({
            cache: new LRU({ maxSize: 200 }),
            fill: async (query, abortSignal) => {
                return this.fetchFeatures(query, abortSignal);
            },
        });
        const featureType = readConfObject(config, 'featureType');
        const data = readConfObject(this.config, 'data');
        this.featureType = featureType;
        this.data = data;
        this.totalData = 0;
    }
    /**
     * converts each property of an object from snake case to camel case
     * @param src -- source object with properties
     * @returns property converted to camel case
     */
    convertPropertyCaseToCamel(src) {
        const tgt = src;
        Object.keys(src).forEach(k => {
            const toCamel = (str) => {
                return str.replace(/([-_][a-z])/gi, ($1) => {
                    return $1.toUpperCase().replace('_', '');
                });
            };
            if (!Array.isArray(src[k])) {
                tgt[toCamel(k)] = src[k];
                delete tgt[k];
            }
        });
        return tgt;
    }
    /**
     * constructs a mutation from a JSON object parsed from the given JSON file
     * @param obj the json object to be constructed according to how GDCFeature needs it
     * @returns a gdcObject that can be processed by GDCFeature
     */
    constructMutation(obj) {
        const consequence = obj.consequence;
        const edges = [];
        for (const transcript of consequence) {
            edges.push({
                node: {
                    ...transcript,
                },
            });
        }
        const gdcObject = this.convertPropertyCaseToCamel(obj);
        const genomicDnaChange = gdcObject.genomicDnaChange;
        // properties derived from genomic dna change
        gdcObject.chromosome = genomicDnaChange.split(':')[0];
        gdcObject.referenceAllele = genomicDnaChange
            .split('.')[1]
            .split('>')[0]
            .slice(-1);
        gdcObject.startPosition = parseInt(genomicDnaChange.split('.')[1].split('>')[0].slice(0, -1));
        gdcObject.endPosition = gdcObject.startPosition;
        // constant properties for mutations
        gdcObject.mutationType = 'Simple Somatic Mutation';
        gdcObject.nciBuild = 'GRCh38';
        gdcObject.consequence = {
            hits: {
                edges,
            },
        };
        // cohort, score and percentage properties
        const cohortCount = this.totalData;
        gdcObject.score = 1; // TODO: shouldn't be hardcoded, need to devise a way to get the proper score
        const denom = Math.ceil(Math.log10(cohortCount));
        gdcObject.numOfCasesInCohort = cohortCount;
        gdcObject.percentage = (100 * Math.log10(gdcObject.score)) / denom + 100;
        gdcObject.occurrenceInCohort = `${gdcObject.score} / ${cohortCount}`;
        return gdcObject;
    }
    /**
     * constructs a gene from a JSON object parsed from the given JSON file
     * @param obj the json object to be constructed according to how GDCFeature needs it
     * @param opts base options
     * @returns a gdcObject that can be processed by GDCFeature
     */
    async constructGene(obj, opts) {
        let gdcObject = this.convertPropertyCaseToCamel(obj);
        const query = this.createGeneQueryById(gdcObject.geneId);
        try {
            const result = await this.featureCache.get(JSON.stringify(query), query, opts.signal);
            gdcObject = result.data.viewer.explore.features.hits.edges[0].node;
            gdcObject.geneChromosome = `chr${gdcObject.geneChromosome}`;
            gdcObject.note = gdcObject.symbol;
            gdcObject.strand = gdcObject.geneStrand;
        }
        catch (e) {
            console.error(e);
        }
        return gdcObject;
    }
    /**
     * Create a GraphQL query for GDC genes
     * @param geneId -- the gene id to be queried and returned
     */
    createGeneQueryById(geneId) {
        const geneQuery = `query genesQuery( $filters: FiltersArgument  ) { viewer { explore { features: genes { hits(filters: $filters) { total edges { node { geneId: gene_id id geneStrand: gene_strand synonyms symbol name geneStart: gene_start geneEnd: gene_end geneChromosome: gene_chromosome description canonicalTranscriptId: canonical_transcript_id externalDbIds: external_db_ids { hgnc omimGene: omim_gene uniprotkbSwissprot: uniprotkb_swissprot entrezGene: entrez_gene } biotype isCancerGeneCensus: is_cancer_gene_census } } } } } } }`;
        const combinedFilters = {
            op: 'and',
            content: [
                {
                    op: 'and',
                    content: [
                        {
                            op: 'in',
                            content: { field: 'genes.gene_id', value: geneId },
                        },
                    ],
                },
            ],
        };
        const body = {
            query: geneQuery,
            variables: {
                filters: combinedFilters,
            },
        };
        return body;
    }
    /**
     * processed a list of features from the data parsed from the file
     * @param parsed -- the data parsed from the file, a JSON object
     * @param opts -- the base options
     * @returns a list of features created from the parsed data
     */
    async getConstructedFeatures(parsed, opts) {
        const features = [];
        const idField = this.featureType === 'mutation' ? 'ssmId' : 'geneId';
        for (const entity of parsed) {
            const gdcObject = idField === 'ssmId'
                ? this.constructMutation(entity)
                : await this.constructGene(entity, opts);
            const feature = new GDCFeature({
                gdcObject,
                id: gdcObject[idField],
                featureType: this.featureType,
            });
            features.push(feature);
        }
        return features;
    }
    /**
     * sets up the features to be passed and processed by the observer
     * @param parsed -- the parsed data from the file, a JSON object
     * @param opts -- the base options
     * @returns a promise of the list of GDCFeatures
     */
    async setup(parsed, opts) {
        if (!this.setupP) {
            this.setupP = this.getConstructedFeatures(parsed, opts);
        }
        return this.setupP;
    }
    async getRefNames() {
        return [
            'chr1',
            'chr10',
            'chr11',
            'chr12',
            'chr13',
            'chr14',
            'chr15',
            'chr16',
            'chr17',
            'chr18',
            'chr19',
            'chr2',
            'chr20',
            'chr21',
            'chr22',
            'chr3',
            'chr4',
            'chr5',
            'chr6',
            'chr7',
            'chr8',
            'chr9',
            'chrX',
            'chrY',
        ];
    }
    getFeatures(region, opts = {}) {
        const { refName, start, end } = region;
        return ObservableCreate(async (observer) => {
            try {
                const parsedData = JSON.parse(this.data);
                this.totalData = Object.keys(parsedData).length;
                const features = await this.setup(parsedData, opts);
                features.forEach((feature) => {
                    if (feature.get('refName') === refName &&
                        feature.get('end') > start &&
                        feature.get('start') < end) {
                        observer.next(feature);
                    }
                });
            }
            catch (e) {
                observer.error(e);
            }
            observer.complete();
        }, opts.stopToken);
    }
    freeResources() { }
}
GDCJSONAdapter.capabilities = ['getFeatures', 'getRefNames'];
export default GDCJSONAdapter;
//# sourceMappingURL=GDCJSONAdapter.js.map