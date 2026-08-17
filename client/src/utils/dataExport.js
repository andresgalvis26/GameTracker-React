import { getGameTargetYear } from '../constants/gameOptions';

const EXPORT_FIELDS = ['title', 'platform', 'pcStore', 'status', 'rating', 'imageUrl', 'description', 'targetYear', 'replayable', 'platinated', 'isOnline', 'createdAt'];

const timestamp = () => new Date().toISOString().slice(0, 10);

const download = (content, fileName, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
};

const exportableGame = (game) => ({ ...Object.fromEntries(EXPORT_FIELDS.map((field) => [field, game[field] ?? null])), targetYear: getGameTargetYear(game) || null });

export const exportJson = (games) => {
    const payload = { version: 1, exportedAt: new Date().toISOString(), games: games.map(exportableGame) };
    download(JSON.stringify(payload, null, 2), `game-tracker-${timestamp()}.json`, 'application/json');
};

const escapeCsv = (value) => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export const exportCsv = (games) => {
    const headers = EXPORT_FIELDS.join(',');
    const rows = games.map((game) => { const normalized = exportableGame(game); return EXPORT_FIELDS.map((field) => escapeCsv(normalized[field])).join(','); });
    download(`\ufeff${[headers, ...rows].join('\n')}`, `game-tracker-${timestamp()}.csv`, 'text/csv;charset=utf-8');
};

export const parseImportFile = async (file) => {
    const parsed = JSON.parse(await file.text());
    const games = Array.isArray(parsed) ? parsed : parsed?.games;
    if (!Array.isArray(games)) throw new Error('El JSON no contiene una colección de juegos válida.');
    const validGames = games.filter((game) => game && typeof game === 'object' && String(game.title || '').trim() && String(game.platform || '').trim() && String(game.status || '').trim());
    if (!validGames.length) throw new Error('No se encontraron juegos válidos. Cada juego necesita título, plataforma y estado.');
    return validGames.map((game) => ({
        title: String(game.title).trim(),
        platform: String(game.platform),
        pcStore: game.pcStore || '',
        status: String(game.status),
        rating: game.rating === null || game.rating === '' ? null : Number(game.rating),
        imageUrl: game.imageUrl || '',
        description: game.description || '',
        targetYear: (game.targetYear ?? game.target_year) === null || (game.targetYear ?? game.target_year) === '' ? null : Number(game.targetYear ?? game.target_year),
        replayable: Boolean(game.replayable),
        platinated: Boolean(game.platinated),
        isOnline: Boolean(game.isOnline ?? game.is_online ?? game.online)
    }));
};
