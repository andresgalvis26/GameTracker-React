import PropTypes from 'prop-types';
import { getGameTargetYear } from '../constants/gameOptions';

const statusStyles = { Jugando: 'bg-emerald-500', Completado: 'bg-blue-500', Backlog: 'bg-amber-500' };
const statusIcons = { Jugando: '▶', Completado: '✓', Backlog: '◷' };

const GameCard = ({ game, onDelete, onClick, onEdit }) => {
    const targetYear = getGameTargetYear(game);
    return <article className="game-card group overflow-hidden rounded-2xl border border-gray-700/80 bg-gray-800 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-2xl hover:shadow-blue-950/30" aria-labelledby={`game-${game.id}`}>
    <button type="button" onClick={() => onClick(game)} className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400">
        <div className="relative h-72 overflow-hidden bg-gray-700 sm:h-80">
            <img src={game.imageUrl || '/GameTracker.ico'} alt={`Portada de ${game.title}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = '/GameTracker.ico'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
            <span className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-lg ${statusStyles[game.status] || 'bg-gray-500'}`}><span aria-hidden="true">{statusIcons[game.status] || '•'} </span>{game.status}</span>
            <div className="absolute right-3 top-3 flex flex-col items-end gap-2">{game.isOnline && <span className="rounded-full border border-cyan-200/20 bg-cyan-500/90 px-3 py-1.5 text-xs font-bold text-white">🌐 Online</span>}{game.platinated && <span className="rounded-full border border-yellow-200/30 bg-yellow-400 px-3 py-1.5 text-xs font-bold text-gray-900">🏆 Platino</span>}{game.replayable && <span className="rounded-full border border-purple-200/20 bg-purple-500/90 px-3 py-1.5 text-xs font-bold text-white">↻ Rejugable</span>}</div>
            {game.rating > 0 && <span className="absolute bottom-3 right-3 rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm font-black text-yellow-300 backdrop-blur-sm">★ {Number(game.rating).toFixed(1)}<span className="font-normal text-yellow-100/60">/10</span></span>}
        </div>
        <div className="p-4"><div className="flex items-start justify-between gap-3"><h2 id={`game-${game.id}`} className="line-clamp-2 min-h-12 font-bold text-lg leading-6 text-white">{game.title}</h2><span className="shrink-0 rounded-md bg-gray-700 px-2 py-1 text-xs font-semibold text-gray-300">{game.platform}</span></div><div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-700/70 pt-3 text-xs"><div><span className="block text-gray-500">{game.isOnline ? 'Tipo' : game.status === 'Completado' ? 'Completado' : 'Año objetivo'}</span><span className={`mt-1 block font-bold ${game.isOnline ? 'text-cyan-300' : targetYear ? 'text-blue-300' : 'text-gray-500'}`}>{game.isOnline ? 'Online' : targetYear || 'Sin definir'}</span></div><div className="text-right"><span className="block text-gray-500">Añadido</span><time className="mt-1 block text-gray-400" dateTime={game.createdAt}>{new Date(game.createdAt).toLocaleDateString('es-ES')}</time></div></div></div>
    </button>
    <div className="px-4 pb-4 flex gap-2"><button type="button" onClick={() => onEdit(game)} className="flex-1 py-2 rounded bg-gray-700 text-blue-300 hover:bg-gray-600" aria-label={`Editar ${game.title}`}>Editar</button><button type="button" onClick={() => onDelete(game)} className="flex-1 py-2 rounded bg-gray-700 text-red-300 hover:bg-gray-600" aria-label={`Eliminar ${game.title}`}>Eliminar</button></div>
</article>;
};

GameCard.propTypes = { game: PropTypes.object.isRequired, onDelete: PropTypes.func.isRequired, onClick: PropTypes.func.isRequired, onEdit: PropTypes.func.isRequired };
export default GameCard;
