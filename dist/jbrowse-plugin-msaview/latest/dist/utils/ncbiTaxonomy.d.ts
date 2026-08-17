/**
 * Free text -> NCBI taxon id. A bare number is taken as the id itself; anything
 * else is searched against db=taxonomy, which resolves a scientific name
 * (`Danio rerio`), a common name (`zebrafish`) and a genus alike.
 *
 * This replaces a fixed list of species the dialog used to offer. The query
 * taxon has to match the assembly the user is browsing -- `resolveGeneId`
 * searches `SYMBOL[Gene Name] AND <taxid>[taxid]` -- so a list that stops at 23
 * species silently resolves the wrong organism's gene for anyone outside it.
 */
export declare function resolveTaxId(query: string): Promise<number | undefined>;
