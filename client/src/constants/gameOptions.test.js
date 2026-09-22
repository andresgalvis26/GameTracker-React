import { describe, expect, it } from 'vitest';
import { EMPTY_FORM, completedInYear, gameToForm, pickRandomGame } from './gameOptions';

describe('EMPTY_FORM', () => {
    it('incluye campos nuevos con valores por defecto', () => {
        expect(EMPTY_FORM.wishlist).toBe(false);
        expect(EMPTY_FORM.hoursPlayed).toBe('');
        expect(EMPTY_FORM.genres).toEqual([]);
    });
});

describe('gameToForm', () => {
    it('mapea wishlist, horas y géneros', () => {
        const form = gameToForm({
            title: 'Hades',
            platform: 'PC',
            status: 'Backlog',
            wishlist: true,
            hoursPlayed: 12.5,
            genres: ['Acción', 'RPG']
        });
        expect(form.wishlist).toBe(true);
        expect(form.hoursPlayed).toBe('12.5');
        expect(form.genres).toEqual(['Acción', 'RPG']);
    });

    it('tolera juegos antiguos sin campos nuevos', () => {
        const form = gameToForm({ title: 'Old', platform: 'PC', status: 'Backlog' });
        expect(form.wishlist).toBe(false);
        expect(form.hoursPlayed).toBe('');
        expect(form.genres).toEqual([]);
    });
});

describe('pickRandomGame', () => {
    it('devuelve null con lista vacía', () => {
        expect(pickRandomGame([])).toBeNull();
    });

    it('excluye el id pasado', () => {
        const games = [{ id: 1 }, { id: 2 }];
        expect(pickRandomGame(games, 1)?.id).toBe(2);
        expect(pickRandomGame(games, 2)?.id).toBe(1);
    });

    it('elige de la pool', () => {
        const game = pickRandomGame([{ id: 7 }]);
        expect(game?.id).toBe(7);
    });
});

describe('completedInYear', () => {
    it('cuenta por targetYear si existe', () => {
        expect(completedInYear({ status: 'Completado', targetYear: 2026 }, 2026)).toBe(true);
        expect(completedInYear({ status: 'Completado', targetYear: 2025 }, 2026)).toBe(false);
    });

    it('usa createdAt de fallback', () => {
        expect(completedInYear({ status: 'Completado', createdAt: '2026-03-01T10:00:00Z' }, 2026)).toBe(true);
    });

    it('ignora no completados', () => {
        expect(completedInYear({ status: 'Backlog', targetYear: 2026 }, 2026)).toBe(false);
    });
});
