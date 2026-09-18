import React from 'react';
import { MenuItem } from '@mui/material';
import TextField2 from '../../../components/TextField2';
import { useLocalStorage } from '../../../utils/useLocalStorage';
const ORTHOLOG_SOURCE_STORAGE_KEY = 'msaview-ortholog-source';
export const orthologSourceLabels = {
    ncbi: 'NCBI orthologs',
    panther: 'PANTHER',
    uniref: 'UniRef cluster',
};
const orthologSources = Object.keys(orthologSourceLabels);
// another plugin version on the same origin may have stored a source this one
// lacks, and the tab indexes its hints by it
export function validOrthologSource(stored) {
    return orthologSources.find(s => s === stored) ?? 'ncbi';
}
export function useStoredOrthologSource() {
    const [stored, setStored] = useLocalStorage(ORTHOLOG_SOURCE_STORAGE_KEY, 'ncbi');
    return [
        validOrthologSource(stored),
        (source) => {
            setStored(source);
        },
    ];
}
// Which species a source can answer for, in the words a reader picking one
// needs: NCBI's ortholog sets stop at vertebrates and insects, PANTHER's run
// from human to yeast and Arabidopsis, and a UniRef cluster is every UniProtKB
// entry within 50% identity of the query, whatever it came from.
const hints = {
    ncbi: 'vertebrates and insects',
    panther: 'also yeast, worm, fly and plants',
    uniref: 'all of UniProtKB within 50% identity',
};
export default function OrthologSourceSelect({ value, onChange, className, }) {
    return (React.createElement(TextField2, { variant: "outlined", label: "Source", className: className, select: true, value: value, helperText: hints[value], onChange: event => {
            onChange(event.target.value);
        } }, orthologSources.map(val => (React.createElement(MenuItem, { value: val, key: val }, orthologSourceLabels[val])))));
}
