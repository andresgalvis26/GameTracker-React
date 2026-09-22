import { useEffect, useState } from 'react';

const STORAGE_KEY = 'yearGoal';

export const useYearGoal = () => {
    const [yearGoal, setYearGoal] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw === null ? null : Number(raw);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        try {
            if (yearGoal === null) localStorage.removeItem(STORAGE_KEY);
            else localStorage.setItem(STORAGE_KEY, String(yearGoal));
        } catch { /* Preferencia solo en esta sesión. */ }
    }, [yearGoal]);

    return { yearGoal, setYearGoal };
};
