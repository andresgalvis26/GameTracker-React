import { useEffect, useState } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        try { return localStorage.getItem('theme') || 'dark'; } catch { return 'dark'; }
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try { localStorage.setItem('theme', theme); } catch { /* La preferencia seguirá activa durante esta sesión. */ }
    }, [theme]);

    return { theme, toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark') };
};
