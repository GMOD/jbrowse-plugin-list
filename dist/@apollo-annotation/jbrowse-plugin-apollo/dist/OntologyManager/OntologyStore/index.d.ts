import { type BlobLocation, type LocalPathLocation, type UriLocation } from '@jbrowse/core/util';
import { type IDBPTransaction, type StoreNames } from 'idb/with-async-ittr';
import { type OntologyClass, type OntologyProperty, type OntologyTerm } from '..';
import { textSearch } from './fulltext';
import { type OntologyDB } from './indexeddb-schema';
import { isDatabaseCurrent, loadOboGraphJson, openDatabase } from './indexeddb-storage';
export type SourceLocation = UriLocation | LocalPathLocation | BlobLocation;
/** type alias for a Transaction on this particular DB schema */
export type Transaction<TxStores extends ArrayLike<StoreNames<OntologyDB>> = ArrayLike<StoreNames<OntologyDB>>, Mode extends IDBTransactionMode = 'readonly'> = IDBPTransaction<OntologyDB, TxStores, Mode>;
/** the format of the loading data source */
type SourceType = 'obo-graph-json' | 'obo' | 'owl';
export interface OntologyStoreOptions {
    prefixes?: Map<string, string>;
    textIndexing?: {
        /** json paths of paths in the nodes to index as full text */
        indexFields?: {
            displayName: string;
            jsonPath: string;
        }[];
    };
    maxSearchResults?: number;
    update?(message: string, progress: number): void;
}
export interface PropertiesOptions {
    /** default true */
    includeSubProperties: boolean;
}
/** query interface for a specific ontology */
export default class OntologyStore {
    ontologyName: string;
    ontologyVersion: string;
    sourceLocation: SourceLocation;
    db: ReturnType<OntologyStore['prepareDatabase']>;
    options: OntologyStoreOptions;
    loadOboGraphJson: typeof loadOboGraphJson;
    getTermsByFulltext: typeof textSearch;
    openDatabase: typeof openDatabase;
    isDatabaseCurrent: typeof isDatabaseCurrent;
    get textIndexFields(): import("..").TextIndexFieldDefinition[];
    get prefixes(): Map<string, string>;
    readonly DEFAULT_MAX_SEARCH_RESULTS = 100;
    constructor(name: string, version: string, source: SourceLocation, options?: OntologyStoreOptions);
    /**
     * check that the configuration of this ontology appears valid. Does not
     * try to do any fetches, however.
     */
    validate(): Error[];
    get sourceType(): SourceType | undefined;
    /** base name of the IndexedDB database for this ontology */
    get dbName(): string;
    prepareDatabase(): Promise<import("idb/with-async-ittr").IDBPDatabase<OntologyDB>>;
    termCount(tx?: Transaction<['nodes']>): Promise<number>;
    private unique;
    getTermsWithLabelOrSynonym(termLabelOrSynonym: string, options?: {
        includeSubclasses?: boolean;
    }, tx?: Transaction<['nodes', 'edges']>): Promise<OntologyTerm[]>;
    /**
     * Get the ontology term for the property with the given label,
     * plus all the terms for the properties that are "subPropertyOf"
     * that property.
     *
     * If there is more than one property with that label, treats it as
     * equivalent and just returns all the properties and their subproperties.
     *
     * options.includeSubProperties default is true
     */
    getPropertiesByLabel(propertyLabel: string, options?: PropertiesOptions, tx?: Transaction<['nodes', 'edges']>): Promise<OntologyProperty[]>;
    /** private helper for traversing the edges of the ontology graph. Does a breadth-first search of the graph */
    private recurseEdges;
    /**
     * given an array of node IDs, augment it with all of their subclasses or
     * superclasses, and return the augmented array
     **/
    private expandNodeSet;
    /**
     * given an iterator of node IDs, return a new iterator of those nodes plus all of their subclasses
     */
    expandSubclasses(startingNodeIds: Iterable<string>, subclassRelation?: string, tx?: Transaction<['edges']>): AsyncGenerator<string, void, unknown>;
    /**
     * given an iterator of node IDs, return a new iterator of those nodes plus all of their superclasses
     */
    expandSuperclasses(startingNodeIds: Iterable<string>, subclassRelation?: string, tx?: Transaction<['edges']>): AsyncGenerator<string, void, unknown>;
    /**
     * example: for the Sequence Ontology, store.getTermsThat('part_of', [geneTerm])
     * would return all terms that are part_of, member_of, or integral_part_of a gene
     */
    getClassesThat(propertyLabel: string, targetTerms: OntologyClass[], tx?: Transaction<['nodes', 'edges']>): Promise<OntologyClass[]>;
    getClassesWithoutPropertyLabeled(propertyLabel: string, options: PropertiesOptions, tx?: Transaction<['nodes', 'edges']>): Promise<OntologyClass[]>;
    getAllClasses(tx?: Transaction<['nodes']>): Promise<OntologyClass[]>;
    getAllTerms(tx?: Transaction<['nodes']>): Promise<OntologyTerm[]>;
}
export {};
//# sourceMappingURL=index.d.ts.map