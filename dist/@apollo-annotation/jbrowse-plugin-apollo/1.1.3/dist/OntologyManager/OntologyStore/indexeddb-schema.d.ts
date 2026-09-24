/** schema types used to strongly-type using the `idb` type system */
import type { DBSchema } from 'idb/with-async-ittr';
import type { Edge as OboGraphEdge, Meta as OboGraphMeta, Node as OboGraphNode } from './obo-graph-json-schema';
import type { OntologyStoreOptions, SourceLocation } from '.';
/** metadata about this IndexedDB ontology database */
export interface Meta {
    /** original OntologyManager record this was loaded from */
    ontologyRecord: {
        name: string;
        version: string;
        sourceLocation: SourceLocation;
    };
    storeOptions: OntologyStoreOptions;
    /** graph metadata in OBO Graph metadata format */
    graphMeta?: OboGraphMeta;
    timestamp: string;
    /** IndexedDB schemaVersion for this ontology */
    schemaVersion: number;
    /** time taken to load this data */
    timings: {
        /** milliseconds to fetch, parse, and load the ontology */
        overall: number;
        /** optional milliseconds to fetch the ontology source file over the network */
        fetch?: number;
        /** optional milliseconds to parse the ontology source file */
        parse?: number;
        /** optional milliseconds to load the ontology into IndexedDB */
        load?: number;
    };
}
export type OntologyDBNode = OboGraphNode & {
    id: string;
    type: 'CLASS' | 'INDIVIDUAL' | 'PROPERTY';
    fullTextWords?: string[];
};
export declare function isOntologyDBNode(node: OboGraphNode): node is OntologyDBNode;
export type OntologyDBEdge = OboGraphEdge & {
    sub: string;
    pred: string;
    obj: string;
};
export declare function isOntologyDBEdge(edge: OboGraphEdge): edge is OntologyDBEdge;
export declare function isDeprecated(thing: OntologyDBNode | OntologyDBEdge): boolean;
/** schema types used to strongly-type using the `idb` type system */
export interface OntologyDB extends DBSchema {
    meta: {
        key: string;
        value: Meta;
    };
    nodes: {
        key: string;
        value: OntologyDBNode;
        indexes: {
            'by-label': string;
            'by-type': string;
            'by-synonym': string;
            /** full-text index for fast searching by words */
            'full-text-words': string;
        };
    };
    edges: {
        key: number;
        value: OntologyDBEdge;
        indexes: {
            'by-subject': string;
            'by-object': string;
            'by-predicate': string;
        };
    };
}
//# sourceMappingURL=indexeddb-schema.d.ts.map