import { describe, expect, it } from 'vitest';
import { normalizeText } from './search';

describe('normalizeText', () => {
    it('quita tildes y pasa a minúsculas', () => {
        expect(normalizeText('Acción Aventura')).toBe('accion aventura');
    });

    it('maneja null y undefined', () => {
        expect(normalizeText(null)).toBe('');
        expect(normalizeText(undefined)).toBe('');
    });

    it('normaliza ñ', () => {
        expect(normalizeText('Muellón')).toBe('muellon');
    });
});
