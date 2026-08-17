export const PLATFORMS = ['PC', 'Switch', 'PS5', 'PS4', 'Xbox One', 'Xbox 360', 'Otra plataforma'];
export const STATUSES = ['Backlog', 'Jugando', 'Completado'];
export const PC_STORES = ['Steam', 'Epic Games', 'GOG', 'Origin/EA', 'Ubisoft Connect', 'Battle.net', 'Microsoft Store', 'Game Pass', 'Itch.io', 'Otra'];

export const EMPTY_FILTERS = {
    status: '', platform: '', pcStore: '', minRating: '', maxRating: '', year: '', replayable: '', online: '', searchText: ''
};

export const EMPTY_FORM = {
    title: '', platform: 'PC', pcStore: '', status: 'Backlog', rating: '', imageUrl: '', description: '', targetYear: '', replayable: false, platinated: false, isOnline: false
};

export const getGameTargetYear = (game) => game.targetYear || game.target_year || game.yearTarget || '';

export const gameToForm = (game) => ({
    title: game.title,
    platform: game.platform,
    pcStore: game.pcStore || '',
    status: game.status,
    rating: game.rating ?? '',
    imageUrl: game.imageUrl || '',
    description: game.description || '',
    targetYear: getGameTargetYear(game) ? String(getGameTargetYear(game)) : '',
    replayable: Boolean(game.replayable),
    platinated: Boolean(game.platinated),
    isOnline: Boolean(game.isOnline)
});
