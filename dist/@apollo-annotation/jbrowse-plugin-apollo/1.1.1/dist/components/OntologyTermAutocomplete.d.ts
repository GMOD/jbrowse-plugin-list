import { type AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';
import { type OntologyTerm } from '../OntologyManager';
import type OntologyStore from '../OntologyManager/OntologyStore';
import type { ApolloSessionModel } from '../session';
interface OntologyTermAutocompleteProps {
    session: ApolloSessionModel;
    ontologyName: string;
    ontologyVersion?: string;
    value: string;
    error?: boolean;
    filterTerms?: (term: OntologyTerm) => boolean;
    fetchValidTerms?: (ontologyStore: OntologyStore, signal: AbortSignal) => Promise<OntologyTerm[] | undefined>;
    style?: React.CSSProperties;
    renderInput?: (params: AutocompleteRenderInputParams & {
        error?: boolean;
        errorMessage?: string;
    }) => React.ReactNode;
    onChange: (oldValue: string, newValue: string | null | undefined) => void;
    /** if true, include deprecated/obsolete terms */
    includeDeprecated?: boolean;
}
export declare function OntologyTermAutocomplete({ fetchValidTerms, filterTerms: filterTermsProp, includeDeprecated, onChange, ontologyName, ontologyVersion, renderInput, session, style, value: valueString, }: OntologyTermAutocompleteProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=OntologyTermAutocomplete.d.ts.map