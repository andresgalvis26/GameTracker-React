import { describe, expect, it } from 'vitest';
import { normalizeText } from '../utils/search';

const applyFilters = (games, filters) => games.filter((game) => {
    if (filters.wishlist === 'true' && !game.wishlist) return false;
    if (filters.wishlist === 'false' && game.wishlist) return false;
    if (filters.genre && !(Array.isArray(game.genres) && game.genres.includes(filters.genre))) return false;
    const search = normalizeText(filters.searchText || '');
    if (!search) return true;
    const haystack = normalizeText([game.title, game.description, ...(game.genres || [])].join(' '));
    return haystack.includes(search);
});

describe('filtros wishlist y géneros', () => {
    const games = [
        { title: 'Hades', wishlist: true, genres: ['Acción'], description: '' },
        { title: 'Celeste', wishlist: false, genres: ['Plataformas'], description: 'Indie' },
        { title: 'Disco Elysium', wishlist: false, genres: ['RPG', 'Narrativo'], description: 'Investigación' }
    ];

    it('filtra solo deseados', () => {
        expect(applyFilters(games, { wishlist: 'true' })).toHaveLength(1);
        expect(applyFilters(games, { wishlist: 'true' })[0].title).toBe('Hades');
    });

    it('filtra por género', () => {
        expect(applyFilters(games, { genre: 'RPG' })[0].title).toBe('Disco Elysium');
    });

    it('busca sin tildes', () => {
        expect(applyFilters([{ title: 'Acción Total', wishlist: false, genres: [] }], { searchText: 'accion' })).toHaveLength(1);
    });
});
