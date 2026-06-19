import { useState } from 'react';
import { DEFAULT_DATABASES, predict3Di, submitFoldseekSearch, waitForFoldseekResults, } from '../services/foldseekApi';
export default function useFoldseekSearch() {
    const [results, setResults] = useState();
    const [predictData, setPredictData] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [isPredicting, setIsPredicting] = useState(false);
    const [error, setError] = useState();
    const [statusMessage, setStatusMessage] = useState('');
    const predictStructure = async (aaSequence) => {
        setIsPredicting(true);
        setError(undefined);
        setStatusMessage('Predicting 3Di structure...');
        try {
            const result = await predict3Di(aaSequence);
            setPredictData(result);
            return result;
        }
        catch (e) {
            console.error(e);
            setError(e);
            return undefined;
        }
        finally {
            setIsPredicting(false);
            setStatusMessage('');
        }
    };
    const search = async (aaSeq, di3Seq, databases = DEFAULT_DATABASES) => {
        setIsLoading(true);
        setError(undefined);
        setStatusMessage('Submitting search...');
        try {
            const ticket = await submitFoldseekSearch(aaSeq, di3Seq, databases);
            const result = await waitForFoldseekResults(ticket.id, setStatusMessage);
            setResults(result);
            return result;
        }
        catch (e) {
            console.error(e);
            setError(e);
            return undefined;
        }
        finally {
            setIsLoading(false);
            setStatusMessage('');
        }
    };
    const reset = () => {
        setResults(undefined);
        setPredictData(undefined);
        setError(undefined);
        setStatusMessage('');
    };
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
    };
}
