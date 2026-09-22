export const PLATFORMS = ['PC', 'Switch', 'PS5', 'PS4', 'Xbox One', 'Xbox 360', 'Otra plataforma'];
export const STATUSES = ['Backlog', 'Jugando', 'Completado'];
export const PC_STORES = ['Steam', 'Epic Games', 'GOG', 'Origin/EA', 'Ubisoft Connect', 'Battle.net', 'Microsoft Store', 'Game Pass', 'Itch.io', 'Otra'];
export const GENRES = ['Acción', 'Aventura', 'RPG', 'Shooter', 'Estrategia', 'Indie', 'Terror', 'Deportes', 'Carreras', 'Simulación', 'Puzzle', 'Plataformas', 'Mundo abierto', 'Narrativo', 'Otro'];

export const EMPTY_FILTERS = {
    status: '', platform: '', pcStore: '', minRating: '', maxRating: '', year: '', replayable: '', online: '', searchText: '', wishlist: '', genre: ''
};

export const EMPTY_FORM = {
    title: '', platform: 'PC', pcStore: '', status: 'Backlog', rating: '', imageUrl: '', imageKey: '', coverFile: null, description: '', targetYear: '', replayable: false, platinated: false, isOnline: false, wishlist: false, hoursPlayed: '', genres: [], progress: ''
};

export const getGameTargetYear = (game) => game.targetYear || game.target_year || game.yearTarget || '';

// El backend envía `progress` como entero 0–100. Devuelve null si no hay dato.
export const getGameProgress = (game) => {
    const raw = game?.progress ?? game?.Progress;
    if (raw === null || raw === undefined || raw === '') return null;
    const value = Number(raw);
    if (!Number.isFinite(value)) return null;
    return Math.max(0, Math.min(100, Math.round(value)));
};

export const gameToForm = (game) => ({
    title: game.title,
    platform: game.platform,
    pcStore: game.pcStore || '',
    status: game.status,
    rating: game.rating ?? '',
    imageUrl: game.imageUrl || '',
    imageKey: game.imageKey || '',
    coverFile: null,
    description: game.description || '',
    targetYear: getGameTargetYear(game) ? String(getGameTargetYear(game)) : '',
    replayable: Boolean(game.replayable),
    platinated: Boolean(game.platinated),
    isOnline: Boolean(game.isOnline),
    wishlist: Boolean(game.wishlist),
    hoursPlayed: game.hoursPlayed === null || game.hoursPlayed === undefined || game.hoursPlayed === '' ? '' : String(game.hoursPlayed),
    genres: Array.isArray(game.genres) ? game.genres.filter(Boolean) : [],
    progress: getGameProgress(game) === null ? '' : String(getGameProgress(game))
});

export const pickRandomGame = (games, excludeId = null) => {
    const pool = (Array.isArray(games) ? games : []).filter((game) => game && game.id !== excludeId);
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
};

export const completedInYear = (game, year) => {
    if (game.status !== 'Completado') return false;
    const target = getGameTargetYear(game);
    if (target) return Number(target) === year;
    if (game.createdAt) return new Date(game.createdAt).getFullYear() === year;
    return false;
};
