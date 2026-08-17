import PropTypes from 'prop-types';
import { getGameTargetYear } from '../constants/gameOptions';

const statusStyles = {
    Backlog: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    Jugando: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    Completado: 'border-blue-400/30 bg-blue-400/10 text-blue-200'
};

const GameDetails = ({ game, onEdit, onClose }) => {
    const hasRating = game.rating !== null && game.rating !== undefined && Number(game.rating) > 0;
    const targetYear = getGameTargetYear(game);
    const statusClass = statusStyles[game.status] || 'border-gray-600 bg-gray-700 text-gray-200';

    return <div className="bg-gray-900">
        <div className="relative overflow-hidden border-b border-gray-800 bg-gradient-to-br from-blue-950 via-gray-900 to-gray-950 p-5 sm:p-8">
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="relative grid gap-7 md:grid-cols-[220px_1fr] md:items-center">
                <div className="mx-auto aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-gray-800 shadow-2xl shadow-black/40 md:mx-0">
                    <img src={game.imageUrl || '/GameTracker.ico'} alt={`Portada de ${game.title}`} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = '/GameTracker.ico'; }} />
                </div>
                <div className="min-w-0">
                    <div className="mb-4 flex flex-wrap gap-2"><span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}>{game.status}</span>{game.isOnline && <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">🌐 Online · No cuenta para progreso</span>}<span className="rounded-full border border-gray-600 bg-gray-800/80 px-3 py-1 text-xs font-semibold text-gray-300">{game.platform}</span>{game.pcStore && <span className="rounded-full border border-gray-600 bg-gray-800/80 px-3 py-1 text-xs text-gray-300">🛒 {game.pcStore}</span>}</div>
                    <h1 className="max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">{game.title}</h1>
                    <p className="mt-3 text-sm text-gray-400">Añadido el {new Date(game.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <div className="mt-6 flex flex-wrap items-end gap-6">
                        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Tu puntuación</p><p className="mt-1 text-4xl font-black text-yellow-300">{hasRating ? Number(game.rating).toFixed(1) : '—'}<span className="ml-1 text-base font-medium text-gray-500">/10</span></p></div>
                        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">{game.isOnline ? 'Tipo' : game.status === 'Completado' ? 'Completado' : 'Objetivo'}</p><p className={`mt-1 text-2xl font-bold ${game.isOnline ? 'text-cyan-300' : targetYear ? 'text-white' : 'text-gray-500'}`}>{game.isOnline ? 'Online' : targetYear || 'Sin definir'}</p></div>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-6 p-5 sm:p-8">
            {(game.status === 'Completado' && (game.platinated || game.replayable)) && <section><SectionTitle eyebrow="Logros personales" title="Tu experiencia" /><div className="grid gap-3 sm:grid-cols-2">{game.platinated && <Highlight icon="🏆" title="Juego platinado" text="Conseguiste el 100% de los logros o trofeos." tone="yellow" />}{game.replayable && <Highlight icon="🔄" title="Vale la pena rejugar" text="Lo volverías a jugar en el futuro." tone="purple" />}</div></section>}
            <section><SectionTitle eyebrow="Notas" title="Sobre este juego" />{game.description ? <p className="rounded-xl border border-gray-700 bg-gray-800/70 p-5 text-sm leading-7 text-gray-300 whitespace-pre-wrap">{game.description}</p> : <div className="rounded-xl border border-dashed border-gray-700 bg-gray-800/40 p-6 text-center text-sm italic text-gray-500">Todavía no has añadido una descripción.</div>}</section>
            <section><SectionTitle eyebrow="Resumen" title="Información del juego" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Info label="Estado" value={game.status} /><Info label="Tipo" value={game.isOnline ? 'Online' : 'Local / campaña'} /><Info label="Rating" value={hasRating ? `${Number(game.rating).toFixed(1)} / 10` : 'Sin puntuar'} /><Info label={game.isOnline ? 'Seguimiento' : game.status === 'Completado' ? 'Año completado' : 'Año objetivo'} value={game.isOnline ? 'Excluido del progreso' : targetYear ? String(targetYear) : 'Sin definir'} /></div></section>
            <div className="flex flex-col-reverse gap-3 border-t border-gray-800 pt-6 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-lg px-5 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800">Cerrar</button><button type="button" onClick={() => onEdit(game)} className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500">Editar juego</button></div>
        </div>
    </div>;
};

const SectionTitle = ({ eyebrow, title }) => <div className="mb-3"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400">{eyebrow}</p><h2 className="mt-1 text-lg font-bold text-white">{title}</h2></div>;
const Info = ({ label, value }) => <div className="rounded-xl border border-gray-700 bg-gray-800/70 p-4"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 truncate text-sm font-bold text-gray-200">{value}</p></div>;
const Highlight = ({ icon, title, text, tone }) => <div className={`rounded-xl border p-4 ${tone === 'yellow' ? 'border-yellow-400/20 bg-yellow-400/10' : 'border-purple-400/20 bg-purple-400/10'}`}><span className="text-2xl" aria-hidden="true">{icon}</span><h3 className="mt-2 text-sm font-bold text-white">{title}</h3><p className="mt-1 text-xs leading-5 text-gray-400">{text}</p></div>;

GameDetails.propTypes = { game: PropTypes.object.isRequired, onEdit: PropTypes.func.isRequired, onClose: PropTypes.func.isRequired };
SectionTitle.propTypes = { eyebrow: PropTypes.string.isRequired, title: PropTypes.string.isRequired };
Info.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string.isRequired };
Highlight.propTypes = { icon: PropTypes.string.isRequired, title: PropTypes.string.isRequired, text: PropTypes.string.isRequired, tone: PropTypes.oneOf(['yellow', 'purple']).isRequired };

export default GameDetails;
