// Etiquetas amigables por nombre de archivo.
// Las portadas viven en R2 bajo el prefijo game-covers/ y se listan
// desde la API (GET /api/games/covers). Si un archivo no tiene etiqueta,
// se deriva del nombre quitando extensión y separadores.
const COVER_LABELS = {
    'AB-PS5.jpg': 'Astro Bot',
    'APR-PS5.jpg': 'A Plague Tale',
    'CODWWII-PS4.jpg': 'Call of Duty WWII',
    'DBH-PC.jpg': 'Detroit: Become Human',
    'F123-PS5.jpg': 'F1 23',
    'F125-PS5.jpg': 'F1 25',
    'FC3-XB360.jpg': 'Far Cry 3',
    'FC4-PS4.jpg': 'Far Cry 4',
    'FC5-PC.jpg': 'Far Cry 5',
    'FCP-PS4.jpg': 'Far Cry Primal',
    'FORT-PC.jpg': 'Fortnite',
    'GT7-PS5.jpg': 'Gran Turismo 7',
    'HFW-PS4.jpg': 'Horizon Forbidden West',
    'HZD-PS4.jpg': 'Horizon Zero Dawn',
    'ITT-PS4.jpg': 'It Takes Two',
    'MDE-PC.jpg': 'Metro Exodus',
    'MDEII-PC.jpg': 'Metro Exodus II',
    'MDEIII-PC.jpg': 'Metro Exodus III',
    'MK8-SW.jpg': 'Mario Kart 8',
    'MK11-PC.jpg': 'Mortal Kombat 11',
    'MP1-PC.jpg': 'Max Payne',
    'MP2-PS2.jpg': 'Max Payne 2',
    'MP3-XB360.jpg': 'Max Payne 3',
    'NSMBU-Switch.jpg': 'New Super Mario Bros. U',
    'OVCK-PC.jpg': 'Overcooked',
    'OVCK2-PC.jpg': 'Overcooked 2',
    'RDR1-PS5.jpg': 'Red Dead Redemption',
    'RDR2-PS4.jpg': 'Red Dead Redemption 2',
    'SE5-PC.jpg': 'Sniper Elite 5',
    'SMBW-Switch.jpg': 'Super Mario Bros. Wonder',
    'SPIDER-PS5.jpg': 'Marvel Spider-Man',
    'SPIDER2-PS5.jpg': 'Spider-Man 2',
    'SPIDERMM-PS5.jpg': 'Spider-Man: Miles Morales',
    'TC2-PC.jpg': 'The Crew 2',
    'TLOU-PS4.jpg': 'The Last of Us',
    'TLOULB-PS4.jpg': 'The Last of Us: Left Behind',
    'UD-PS4.jpg': 'Until Dawn',
    'UFC5-PS5.jpg': 'UFC 5',
    'UNRONE-PC.jpg': 'Unravel',
    'UNRTWO-PC.jpg': 'Unravel Two',
    'WD.jpg': 'Watch Dogs',
    'WD2-PC.jpg': 'Watch Dogs 2'
};

export const coverLabel = (file) => {
    if (!file) return '';
    return COVER_LABELS[file] || file.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
};

export default COVER_LABELS;
