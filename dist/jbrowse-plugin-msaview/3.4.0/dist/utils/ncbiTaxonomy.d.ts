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
/**
 * A JBrowse assembly name -> the species it is an assembly of.
 *
 * The dialog's query species used to open on `human` whoever was browsing, and
 * that is the same silent wrong answer the 23-species list gave: `resolveGeneId`
 * searches `SYMBOL[Gene Name] AND <taxid>[taxid]`, so a user right-clicking a
 * mouse gene got the HUMAN gene of that symbol, its orthologs, and mouse twice
 * — once as the query row and once as an ortholog, because the excluded taxon
 * was the wrong one. A symbol with no human counterpart failed outright.
 *
 * db=assembly indexes the names JBrowse configs actually carry: hg38, GRCh38,
 * mm39, danRer11, dm6 and sacCer3 all resolve, and so do RefSeq/GenBank
 * accessions. An assembly NCBI has never heard of resolves to nothing and the
 * caller keeps its own default, so this can only improve on guessing.
 */
export declare function resolveAssemblySpecies(assemblyName: string): Promise<{
    taxId: number;
    speciesName: string;
} | undefined>;
