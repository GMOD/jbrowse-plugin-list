import React from 'react';
/**
 * The species the query gene came from, as free text resolved against NCBI's
 * taxonomy rather than picked from a fixed list.
 *
 * The resolved taxon is shown back as helper text, which is the whole point of
 * resolving on a debounce instead of on submit: a typo resolves to some other
 * organism rather than to nothing, and the only place that surfaces is the gene
 * lookup, as "could not resolve NLRP1 in taxon 9986".
 */
export default function QuerySpeciesSelect({ value, onChange, className, }: {
    value: number;
    onChange: (taxId: number) => void;
    className?: string;
}): React.JSX.Element;
