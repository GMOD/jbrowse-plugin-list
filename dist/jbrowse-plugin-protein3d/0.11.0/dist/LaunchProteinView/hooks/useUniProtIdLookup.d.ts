import type { LookupMode } from '../components/UniProtIdInput';
import type { Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
/**
 * Which UniProt entry a feature is, by the dialog's lookup modes: the
 * feature's own attribute, the ID-mapping search over its recognised ids and
 * gene name, a typed accession, or none (sequence mode, where the structure
 * search itself names the entry). Shared by every tab that starts from an
 * accession so they agree on what the gene is.
 */
export default function useUniProtIdLookup({ feature, view, }: {
    feature: Feature;
    view: LinearGenomeViewModel;
}): {
    lookupMode: LookupMode;
    setLookupMode: import("react").Dispatch<import("react").SetStateAction<LookupMode>>;
    manualUniprotId: string;
    setManualUniprotId: import("react").Dispatch<import("react").SetStateAction<string>>;
    taxonId: string;
    setTaxonId: import("react").Dispatch<import("react").SetStateAction<string>>;
    effectiveTaxonId: number;
    selectedQueryId: string;
    setSelectedQueryId: import("react").Dispatch<import("react").SetStateAction<string>>;
    selectedUniprotId: string | undefined;
    setSelectedUniprotId: import("react").Dispatch<import("react").SetStateAction<string | undefined>>;
    selectedTableAccession: string | undefined;
    uniprotEntries: import("../services/lookupMethods").UniProtEntry[];
    isLookupLoading: boolean;
    lookupError: any;
    uniprotId: string | undefined;
    featureUniprotId: string | undefined;
    recognizedIds: string[];
    geneName: string | undefined;
    isAutoMode: boolean;
    isSequenceMode: boolean;
    showIdentifierSelector: boolean;
    searchDescription: string;
    searchDescriptionOr: string;
};
