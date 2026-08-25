import React from 'react';
import { MenuItem } from '@mui/material';
import TextField2 from '../../../components/TextField2';
export const ORTHOLOG_SOURCE_STORAGE_KEY = 'msaview-ortholog-source';
export const orthologSourceLabels = {
    ncbi: 'NCBI orthologs',
    panther: 'PANTHER',
};
// Which species a source can answer for, in the words a reader picking one
// needs: NCBI's ortholog sets stop at vertebrates and insects, PANTHER's run
// from human to yeast and Arabidopsis.
const hints = {
    ncbi: 'vertebrates and insects',
    panther: 'also yeast, worm, fly and plants',
};
export default function OrthologSourceSelect({ value, onChange, className, }) {
    return (React.createElement(TextField2, { variant: "outlined", label: "Source", className: className, select: true, value: value, helperText: hints[value], onChange: event => {
            onChange(event.target.value);
        } }, Object.keys(orthologSourceLabels).map(val => (React.createElement(MenuItem, { value: val, key: val }, orthologSourceLabels[val])))));
}
