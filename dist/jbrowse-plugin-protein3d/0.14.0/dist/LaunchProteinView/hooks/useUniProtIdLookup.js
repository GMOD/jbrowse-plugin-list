import { useState } from 'react';
import { getConf } from '@jbrowse/core/configuration';
import { getSession } from '@jbrowse/core/util';
import useDebouncedValue from './useDebouncedValue';
import useUniProtSearch from './useUniProtSearch';
import getSearchDescription from '../utils/getSearchDescription';
import { extractFeatureIdentifiers, extractTaxonId } from '../utils/util';
export function describeOrganism(taxonId, source) {
    return taxonId === undefined
        ? 'Organism: unknown, showing all species; type an NCBI taxon id to narrow'
        : `Organism: ${taxonId} (${source === 'user' ? 'typed above' : 'from assembly'})`;
}
/**
 * Which UniProt entry a feature is, by the dialog's lookup modes: the
 * feature's own attribute, the ID-mapping search over its recognised ids and
 * gene name, or a typed accession. The dialog holds one of these and hands it
 * to every tab, so all of them run one search and agree on what the gene is.
 */
export default function useUniProtIdLookup({ feature, view, }) {
    const [lookupMode, setLookupMode] = useState('auto');
    const [manualUniprotId, setManualUniprotId] = useState('');
    const [taxonIdInput, setTaxonIdInput] = useState('');
    const geneIds = extractFeatureIdentifiers(feature);
    // The gene-name UniProt search is ambiguous across species, so scope it to
    // the assembly's organism where the assembly says what that is. jb2hubs
    // assemblies carry the NCBI taxon in the reference-sequence track metadata
    // (UCSC: metadata.taxId, GenArk: metadata.ucsc.taxId). With none the query
    // runs unscoped and the organism column makes the choice visible; a user
    // override (taxonIdInput) always wins.
    const assemblyName = view.assemblyNames[0];
    const assembly = assemblyName
        ? getSession(view).assemblyManager.get(assemblyName)
        : undefined;
    const assemblyTaxonId = assembly
        ? extractTaxonId(getConf(assembly, ['sequence', 'metadata']))
        : undefined;
    // Debounced for the same reason the accession is: the value keys the SWR
    // search, so typing 10090 unthrottled ran five searches, four of them for a
    // taxon nobody meant.
    const typedTaxon = useDebouncedValue(taxonIdInput.trim(), 400);
    const overrideTaxon = Number(typedTaxon);
    const hasOverride = typedTaxon !== '' && Number.isFinite(overrideTaxon) && overrideTaxon > 0;
    const effectiveTaxonId = hasOverride ? overrideTaxon : assemblyTaxonId;
    // A value that parses to nothing used to fall back in silence while the
    // organism line went on claiming the assembly's taxon was in effect.
    const taxonIdError = typedTaxon !== '' && !hasOverride;
    const [selectedQueryId, setSelectedQueryId] = useState('auto');
    const [selectedUniprotId, setSelectedUniprotId] = useState();
    const featureUniprotId = geneIds.uniprotId;
    const hasSearchableIdentifier = geneIds.recognizedIds.length > 0 || !!geneIds.geneName;
    // Nothing to search and no accession on the feature: the auto mode has no
    // query to run, so the dialog opens on the manual field instead of reporting
    // an empty result for an empty query.
    const effectiveLookupMode = lookupMode === 'auto' && featureUniprotId
        ? 'feature'
        : lookupMode === 'auto' && !hasSearchableIdentifier
            ? 'manual'
            : lookupMode;
    const isAutoMode = effectiveLookupMode === 'auto';
    const { entries: uniprotEntries, isLoading: isLookupLoading, error: lookupError, partialFailure: lookupPartialFailure, } = useUniProtSearch({
        recognizedIds: geneIds.recognizedIds,
        geneId: geneIds.geneId,
        geneName: geneIds.geneName,
        organismId: effectiveTaxonId,
        selectedQueryId,
        enabled: isAutoMode,
    });
    // Debounce manual entry so fetches don't fire on every keystroke and
    // pollute the SWR cache with partial-ID 404s.
    const debouncedManualUniprotId = useDebouncedValue(manualUniprotId, 400);
    // a row picked from an earlier search (another taxon, another identifier)
    // stops counting once the table no longer lists it
    const pickedUniprotId = uniprotEntries.some(e => e.accession === selectedUniprotId)
        ? selectedUniprotId
        : undefined;
    const autoUniprotId = uniprotEntries[0]?.accession;
    const uniprotId = effectiveLookupMode === 'feature'
        ? featureUniprotId
        : isAutoMode
            ? (pickedUniprotId ?? autoUniprotId)
            : debouncedManualUniprotId;
    return {
        lookupMode: effectiveLookupMode,
        setLookupMode,
        manualUniprotId,
        setManualUniprotId,
        taxonId: taxonIdInput,
        setTaxonId: setTaxonIdInput,
        taxonIdError,
        organismDescription: describeOrganism(effectiveTaxonId, hasOverride ? 'user' : 'assembly'),
        selectedQueryId,
        setSelectedQueryId,
        setSelectedUniprotId,
        selectedTableAccession: pickedUniprotId ?? autoUniprotId,
        uniprotEntries,
        isLookupLoading,
        lookupError,
        lookupPartialFailure,
        uniprotId,
        featureUniprotId,
        recognizedIds: geneIds.recognizedIds,
        geneName: geneIds.geneName,
        isAutoMode,
        hasSearchableIdentifier,
        nothingToSearch: !hasSearchableIdentifier && !featureUniprotId,
        showIdentifierSelector: isAutoMode && hasSearchableIdentifier,
        searchDescription: getSearchDescription({
            selectedQueryId,
            recognizedIds: geneIds.recognizedIds,
            geneName: geneIds.geneName,
        }),
        searchDescriptionOr: getSearchDescription({
            selectedQueryId,
            recognizedIds: geneIds.recognizedIds,
            geneName: geneIds.geneName,
            joinWord: 'or',
        }),
    };
}
