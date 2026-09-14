import { useState } from 'react'

import { getConf } from '@jbrowse/core/configuration'
import { getSession } from '@jbrowse/core/util'

import useDebouncedValue from './useDebouncedValue'
import useUniProtSearch from './useUniProtSearch'
import getSearchDescription from '../utils/getSearchDescription'
import { extractFeatureIdentifiers, extractTaxonId } from '../utils/util'

import type { LookupMode } from '../components/UniProtIdInput'
import type { Feature } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

/**
 * Which UniProt entry a feature is, by the dialog's lookup modes: the
 * feature's own attribute, the ID-mapping search over its recognised ids and
 * gene name, or a typed accession. Shared by every tab that starts from an
 * accession so they agree on what the gene is.
 */
export default function useUniProtIdLookup({
  feature,
  view,
}: {
  feature: Feature
  view: LinearGenomeViewModel
}) {
  const [lookupMode, setLookupMode] = useState<LookupMode>('auto')
  const [manualUniprotId, setManualUniprotId] = useState('')
  const [taxonIdInput, setTaxonIdInput] = useState('')
  const geneIds = extractFeatureIdentifiers(feature)

  // The gene-name UniProt search is ambiguous across species, so scope it to
  // the assembly's organism. jb2hubs assemblies carry the NCBI taxon in the
  // reference-sequence track metadata (UCSC: metadata.taxId, GenArk:
  // metadata.ucsc.taxId). Falls back to human via searchUniProtEntries when
  // absent; a user override (taxonIdInput) always wins.
  const assemblyName = view.assemblyNames[0]
  const assembly = assemblyName
    ? getSession(view).assemblyManager.get(assemblyName)
    : undefined
  const assemblyTaxonId = assembly
    ? extractTaxonId(getConf(assembly, ['sequence', 'metadata']))
    : undefined

  const overrideTaxon = Number(taxonIdInput.trim())
  const effectiveTaxonId =
    taxonIdInput.trim() !== '' &&
    Number.isFinite(overrideTaxon) &&
    overrideTaxon > 0
      ? overrideTaxon
      : assemblyTaxonId
  const [selectedQueryId, setSelectedQueryId] = useState('auto')
  const [selectedUniprotId, setSelectedUniprotId] = useState<string>()

  const featureUniprotId = geneIds.uniprotId

  const effectiveLookupMode =
    lookupMode === 'auto' && featureUniprotId ? 'feature' : lookupMode
  const isAutoMode = effectiveLookupMode === 'auto'

  const {
    entries: uniprotEntries,
    isLoading: isLookupLoading,
    error: lookupError,
  } = useUniProtSearch({
    recognizedIds: geneIds.recognizedIds,
    geneId: geneIds.geneId,
    geneName: geneIds.geneName,
    organismId: effectiveTaxonId,
    selectedQueryId,
    enabled: isAutoMode,
  })

  // Debounce manual entry so fetches don't fire on every keystroke and
  // pollute the SWR cache with partial-ID 404s.
  const debouncedManualUniprotId = useDebouncedValue(manualUniprotId, 400)

  // a row picked from an earlier search (another taxon, another identifier)
  // stops counting once the table no longer lists it
  const pickedUniprotId = uniprotEntries.some(
    e => e.accession === selectedUniprotId,
  )
    ? selectedUniprotId
    : undefined
  const autoUniprotId = uniprotEntries[0]?.accession
  const uniprotId =
    effectiveLookupMode === 'feature'
      ? featureUniprotId
      : isAutoMode
        ? (pickedUniprotId ?? autoUniprotId)
        : debouncedManualUniprotId

  return {
    lookupMode: effectiveLookupMode,
    setLookupMode,
    manualUniprotId,
    setManualUniprotId,
    taxonId: taxonIdInput,
    setTaxonId: setTaxonIdInput,
    // shown as the field placeholder so the user sees the organism in effect
    effectiveTaxonId: effectiveTaxonId ?? 9606,
    selectedQueryId,
    setSelectedQueryId,
    setSelectedUniprotId,
    selectedTableAccession: pickedUniprotId ?? autoUniprotId,
    uniprotEntries,
    isLookupLoading,
    lookupError,
    uniprotId,
    featureUniprotId,
    recognizedIds: geneIds.recognizedIds,
    geneName: geneIds.geneName,
    isAutoMode,
    showIdentifierSelector:
      isAutoMode && (geneIds.recognizedIds.length > 0 || !!geneIds.geneName),
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
  }
}
