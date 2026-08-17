import { useMemo, useState } from 'react';
import { EMPTY_FILTERS } from '../constants/gameOptions';
import { getGameTargetYear } from '../constants/gameOptions';

export const useGameFilters = (games) => {
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const filteredGames = useMemo(() => games.filter((game) => {
        const search = filters.searchText.trim().toLowerCase();
        if (filters.status && game.status !== filters.status) return false;
        if (filters.platform && game.platform !== filters.platform) return false;
        if (filters.pcStore && game.pcStore !== filters.pcStore) return false;
        if (filters.minRating && (!game.rating || game.rating < Number(filters.minRating))) return false;
        if (filters.maxRating && (!game.rating || game.rating > Number(filters.maxRating))) return false;
        if (filters.year && String(getGameTargetYear(game)) !== filters.year) return false;
        if (filters.replayable === 'true' && (!game.replayable || game.status !== 'Completado')) return false;
        if (filters.replayable === 'false' && (game.replayable || game.status !== 'Completado')) return false;
        return !search || game.title.toLowerCase().includes(search) || (game.description || '').toLowerCase().includes(search);
    }).sort((a, b) => {
        const values = {
            title: [a.title.toLowerCase(), b.title.toLowerCase()],
            rating: [a.rating || 0, b.rating || 0],
            platform: [a.platform, b.platform],
            status: [a.status, b.status],
            targetYear: [getGameTargetYear(a) || 0, getGameTargetYear(b) || 0],
            createdAt: [new Date(a.createdAt), new Date(b.createdAt)]
        }[sortBy];
        if (values[0] === values[1]) return 0;
        const result = values[0] < values[1] ? -1 : 1;
        return sortOrder === 'asc' ? result : -result;
    }), [games, filters, sortBy, sortOrder]);

    const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
    const page = totalPages ? Math.min(currentPage, totalPages) : 1;
    const currentPageGames = filteredGames.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const updateFilters = (changes) => {
        setFilters((current) => ({ ...current, ...changes }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters(EMPTY_FILTERS); setSortBy('createdAt'); setSortOrder('desc'); setCurrentPage(1);
    };

    return { filters, sortBy, sortOrder, page, totalPages, filteredGames, currentPageGames, updateFilters, clearFilters, setSortBy: (value) => { setSortBy(value); setCurrentPage(1); }, toggleSort: () => { setSortOrder((value) => value === 'asc' ? 'desc' : 'asc'); setCurrentPage(1); }, setCurrentPage };
};
