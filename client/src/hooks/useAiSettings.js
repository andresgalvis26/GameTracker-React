import { useEffect, useState } from 'react';
import { EMPTY_AI_SETTINGS } from '../constants/aiOptions';

const STORAGE_KEY = 'aiSettings';

const normalizeModels = (models) => {
    if (!Array.isArray(models)) return [];
    return models.map((model) => (typeof model === 'string' ? { id: model, free: model.endsWith(':free') } : model));
};

const readStoredSettings = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return EMPTY_AI_SETTINGS;
        const parsed = JSON.parse(raw);
        return { ...EMPTY_AI_SETTINGS, ...parsed, models: normalizeModels(parsed.models) };
    } catch {
        return EMPTY_AI_SETTINGS;
    }
};

export const useAiSettings = () => {
    const [settings, setSettings] = useState(readStoredSettings);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* La preferencia seguirá activa durante esta sesión. */ }
    }, [settings]);

    const updateSettings = (changes) => {
        setSettings((current) => ({ ...current, ...changes }));
    };

    return { settings, updateSettings };
};
