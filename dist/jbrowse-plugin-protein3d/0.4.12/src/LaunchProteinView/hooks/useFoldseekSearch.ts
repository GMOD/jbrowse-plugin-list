import { useEffect, useRef, useState } from 'react'

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

  // Aborts the in-flight request (3Di prediction or the up-to-3-minute Foldseek
  // poll) when the dialog closes/unmounts, so it stops hitting the external API
  // and stops updating dead state.
  const abortRef = useRef<AbortController | null>(null)
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const startOperation = () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    return controller.signal
  }

  const predictStructure = async (aaSequence: string) => {
    const signal = startOperation()
    setIsPredicting(true)
    setError(undefined)
    setStatusMessage('Predicting 3Di structure...')
    try {
      const result = await predict3Di({ aaSequence, signal })
      setPredictData(result)
      return result
    } catch (e) {
      if (!signal.aborted) {
        console.error(e)
        setError(e)
      }
      return undefined
    } finally {
      if (!signal.aborted) {
        setIsPredicting(false)
        setStatusMessage('')
      }
    }
  }

  const search = async (
    aaSeq: string,
    di3Seq: string,
    databases: FoldseekDatabaseId[] = DEFAULT_DATABASES,
  ) => {
    const signal = startOperation()
    setIsLoading(true)
    setError(undefined)
    setStatusMessage('Submitting search...')
    try {
      const ticket = await submitFoldseekSearch({
        aaSequence: aaSeq,
        di3Sequence: di3Seq,
        databases,
        signal,
      })
      const result = await waitForFoldseekResults({
        ticketId: ticket.id,
        onStatusChange: setStatusMessage,
        signal,
      })
      setResults(result)
      return result
    } catch (e) {
      if (!signal.aborted) {
        console.error(e)
        setError(e)
      }
      return undefined
    } finally {
      if (!signal.aborted) {
        setIsLoading(false)
        setStatusMessage('')
      }
    }
  }

  const reset = () => {
    abortRef.current?.abort()
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
