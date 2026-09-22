import { useCallback, useEffect, useState } from 'react';
import { gamesApi } from '../services/api';

/**
 * Carga la biblioteca de portadas desde R2 (GET /api/games/covers).
 * Se ejecuta cuando `enabled` es true (p. ej. al abrir el formulario).
 */
export const useCovers = (isAuthenticated, enabled) => {
    const [covers, setCovers] = useState([]);
    const [isLoadingCovers, setIsLoadingCovers] = useState(false);
    const [coversError, setCoversError] = useState('');

    const loadCovers = useCallback(async () => {
        setIsLoadingCovers(true);
        setCoversError('');
        try {
            const response = await gamesApi.covers();
            setCovers(response.data);
        } catch (requestError) {
            setCoversError(requestError.response?.data?.message || 'No se pudieron cargar las portadas.');
        } finally {
            setIsLoadingCovers(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !enabled) return undefined;
        let cancelled = false;
        setIsLoadingCovers(true);
        setCoversError('');
        gamesApi.covers()
            .then((response) => { if (!cancelled) setCovers(response.data); })
            .catch((requestError) => { if (!cancelled) setCoversError(requestError.response?.data?.message || 'No se pudieron cargar las portadas.'); })
            .finally(() => { if (!cancelled) setIsLoadingCovers(false); });
        return () => { cancelled = true; };
    }, [isAuthenticated, enabled]);

    return { covers, isLoadingCovers, coversError, loadCovers };
};

export default useCovers;
