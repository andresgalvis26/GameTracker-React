import { useCallback, useEffect, useState } from 'react';
import { gamesApi } from '../services/api';

const getErrorMessage = (error, fallback) => error.response?.data?.mensaje || error.response?.data?.message || fallback;

export const useGames = (isAuthenticated) => {
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const reload = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await gamesApi.list();
            setGames(response.data);
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'No se pudo cargar la colección.'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return undefined;
        let cancelled = false;
        setIsLoading(true);
        gamesApi.list()
            .then((response) => { if (!cancelled) setGames(response.data); })
            .catch((requestError) => { if (!cancelled) setError(getErrorMessage(requestError, 'No se pudo cargar la colección.')); })
            .finally(() => { if (!cancelled) setIsLoading(false); });
        return () => { cancelled = true; };
    }, [isAuthenticated]);

    const save = async (request) => {
        setIsSaving(true);
        try { return (await request()).data; } finally { setIsSaving(false); }
    };

    const createGame = async (game, file) => {
        let created = await save(() => gamesApi.create(game));
        if (file) created = await save(() => gamesApi.uploadImage(created.id, file));
        setGames((current) => [created, ...current]);
    };

    const updateGame = async (id, game, file) => {
        let updated = await save(() => gamesApi.update(id, game));
        if (file) updated = await save(() => gamesApi.uploadImage(id, file));
        setGames((current) => current.map((item) => item.id === id ? updated : item));
    };

    const deleteGame = async (id) => {
        await save(() => gamesApi.remove(id));
        setGames((current) => current.filter((item) => item.id !== id));
    };

    return { games, isLoading, isSaving, error, reload, createGame, updateGame, deleteGame };
};
