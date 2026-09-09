import type { ApolloSessionModel } from '../session';
export declare function OntologyTermMultiSelect({ includeDeprecated, onChange, ontologyName, ontologyVersion, session, value: initialValue, label, }: {
    session: ApolloSessionModel;
    value: string[];
    ontologyName: string;
    ontologyVersion?: string;
    /** if true, include deprecated/obsolete terms */
    includeDeprecated?: boolean;
    onChange(newValue: string[]): void;
    label?: string;
}): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=OntologyTermMultiSelect.d.ts.map