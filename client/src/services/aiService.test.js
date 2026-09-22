import { describe, expect, it } from 'vitest';
import { looksLikeReasoning, sanitizeAiText } from './aiService';
import { normalizeBaseUrl } from '../constants/aiOptions';

describe('sanitizeAiText', () => {
    it('elimina líneas de razonamiento en inglés', () => {
        const raw = 'The user wants a description\nLet me recall facts\nBeyond Two Souls es un juego de acción narrativa de Quantic Dream.';
        const cleaned = sanitizeAiText(raw);
        expect(cleaned).not.toMatch(/the user wants/i);
        expect(cleaned).toMatch(/Beyond Two Souls/);
    });

    it('quita comillas envolventes', () => {
        expect(sanitizeAiText('"Descripción del juego."')).toBe('Descripción del juego.');
    });
});

describe('looksLikeReasoning', () => {
    it('detecta bloque de razonamiento', () => {
        const reasoning = 'The user wants a game description\nLet me think about developer\nFirst I will outline facts\nI need to write in Spanish';
        expect(looksLikeReasoning(reasoning)).toBe(true);
    });

    it('no marca descripción normal en español', () => {
        expect(looksLikeReasoning('Hades es un roguelike de acción donde escapes del inframundo con habilidades divinas.')).toBe(false);
    });
});

describe('normalizeBaseUrl', () => {
    it('añade /v1 si no hay ruta', () => {
        expect(normalizeBaseUrl('https://api.openai.com')).toBe('https://api.openai.com/v1');
    });

    it('respeta rutas existentes', () => {
        expect(normalizeBaseUrl('https://openrouter.ai/api/v1')).toBe('https://openrouter.ai/api/v1');
    });

    it('quita barras finales', () => {
        expect(normalizeBaseUrl('https://api.groq.com/openai/v1/')).toBe('https://api.groq.com/openai/v1');
    });
});
