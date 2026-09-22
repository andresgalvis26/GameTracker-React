import PropTypes from 'prop-types';
import { getGameTargetYear } from '../constants/gameOptions';

const RandomGameModal = ({ game = null, onReroll, onPlay, onOpen, onClose }) => {
    if (!game) {
        return <div className="p-8 text-center text-gray-400">
            <p className="text-4xl">🎲</p>
            <p className="mt-3 font-semibold text-white">No hay candidatos</p>
            <p className="mt-1 text-sm">Añade juegos al backlog o a "Jugando" para usar el azar.</p>
            <button type="button" onClick={onClose} className="mt-5 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">Cerrar</button>
        </div>;
    }

    return <div className="p-5 sm:p-7">
        <div className="grid gap-6 sm:grid-cols-[160px_1fr] sm:items-center">
            <div className="mx-auto aspect-[3/4] w-full max-w-[160px] overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-xl">
                <img src={game.imageUrl || '/GameTracker.ico'} alt={`Portada de ${game.title}`} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = '/GameTracker.ico'; }} />
            </div>
            <div className="min-w-0 text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">Tu azar ha dicho...</p>
                <h3 className="mt-2 text-2xl font-black text-white">{game.title}</h3>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-300">{game.platform}</span>
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">{game.status}</span>
                    {getGameTargetYear(game) && <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">{getGameTargetYear(game)}</span>}
                </div>
                {game.description && <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-400">{game.description}</p>}
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-start">
                    <button type="button" onClick={() => onPlay(game)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500">🎮 Lo juego ahora</button>
                    <button type="button" onClick={onReroll} className="rounded-xl border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:border-purple-400/50 hover:text-white">🎲 Otra vuelta</button>
                    <button type="button" onClick={() => onOpen(game)} className="rounded-xl border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-gray-800 hover:text-white">Ver ficha</button>
                </div>
            </div>
        </div>
    </div>;
};

RandomGameModal.propTypes = {
    game: PropTypes.object,
    onReroll: PropTypes.func.isRequired,
    onPlay: PropTypes.func.isRequired,
    onOpen: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

export default RandomGameModal;
