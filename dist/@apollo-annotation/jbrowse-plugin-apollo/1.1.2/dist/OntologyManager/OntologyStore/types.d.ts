import type { OntologyDBNode } from './indexeddb-schema';
export type OntologyTerm = OntologyDBNode;
export type OntologyClass = OntologyTerm & {
    type: 'CLASS';
};
export declare function isOntologyClass(term: OntologyTerm): term is OntologyClass;
export type OntologyProperty = OntologyTerm & {
    type: 'PROPERTY';
};
export declare function isOntologyProperty(term: OntologyTerm): term is OntologyProperty;
export interface TextIndexFieldDefinition {
    /** name to display in the UI for text taken from this field or fields */
    displayName: string;
    /** JSONPath of the field(s) */
    jsonPath: string;
}
export declare const defaultTextIndexFields: TextIndexFieldDefinition[];
//# sourceMappingURL=types.d.ts.map