import { useState } from 'react'

import {
  DEFAULT_DATABASES,
  predict3Di,
  submitFoldseekSearch,
  waitForFoldseekResults,
} from '../services/foldseekApi'

import type {
  FoldseekDatabaseId,
  FoldseekResult,
} from '../services/foldseekApi'

export default function useFoldseekSearch() {
  const [results, setResults] = useState<FoldseekResult>()
  const [predictData, setPredictData] = useState<{
    aaSequence: string
    di3Sequence: string
  }>()
  const [isLoading, setIsLoading] = useState(false)
  const [isPredicting, setIsPredicting] = useState(false)
  const [error, setError] = useState<unknown>()
  const [statusMessage, setStatusMessage] = useState('')

  const predictStructure = async (aaSequence: string) => {
    setIsPredicting(true)
    setError(undefined)
    setStatusMessage('Predicting 3Di structure...')
    try {
      const result = await predict3Di(aaSequence)
      setPredictData(result)
      return result
    } catch (e) {
      setError(e)
      return undefined
    } finally {
      setIsPredicting(false)
      setStatusMessage('')
    }
  }

  const search = async (
    aaSeq: string,
    di3Seq: string,
    databases: FoldseekDatabaseId[] = DEFAULT_DATABASES,
  ) => {
    setIsLoading(true)
    setError(undefined)
    setStatusMessage('Submitting search...')
    try {
      const ticket = await submitFoldseekSearch(aaSeq, di3Seq, databases)
      const result = await waitForFoldseekResults(ticket.id, setStatusMessage)
      setResults(result)
      return result
    } catch (e) {
      setError(e)
      return undefined
    } finally {
      setIsLoading(false)
      setStatusMessage('')
    }
  }

  const reset = () => {
    setResults(undefined)
    setPredictData(undefined)
    setError(undefined)
    setStatusMessage('')
  }

  return {
    results,
    cleanedAaSequence: predictData?.aaSequence,
    di3Sequence: predictData?.di3Sequence,
    isLoading,
    isPredicting,
    error,
    statusMessage,
    predictStructure,
    search,
    reset,
  }
}
