import type { OntologyDBNode } from './indexeddb-schema';
import type { TextIndexFieldDefinition } from './types';
import type OntologyStore from '.';
import type { Transaction } from '.';
/** special value of jsonPath that gets the IRI (that is, ID) of the node with the configured prefixes applied */
export declare const PREFIXED_ID_PATH = "$PREFIXED_ID";
/**
 * recursively get the indexable words from an iterator
 * of any objects
 **/
export declare function extractWords(strings: Iterable<string>): Generator<string, void, undefined>;
export declare function extractStrings(things: Iterable<unknown>): Generator<string, void, undefined>;
/** @returns generator of tuples of [jsonpath, word] */
export declare function getWords(node: OntologyDBNode, jsonPaths: Iterable<string>, prefixes: Map<string, string>): Generator<[string, string], void, undefined>;
export interface Match {
    term: OntologyDBNode;
    field: TextIndexFieldDefinition;
    str: string;
    score: number;
}
export declare function isMatch(thing: object): thing is Match;
/**
 *
 **/
export declare function textSearch(this: OntologyStore, text: string, tx?: Transaction<['nodes']>, signal?: AbortSignal): Promise<Match[]>;
export declare function elaborateMatch(textIndexPaths: TextIndexFieldDefinition[], term: OntologyDBNode, queryWordIndexes: Set<number>, queryWords: string[], prefixes: Map<string, string>): Match[];
//# sourceMappingURL=fulltext.d.ts.map