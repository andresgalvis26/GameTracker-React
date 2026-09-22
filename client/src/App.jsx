import { lazy, Suspense, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import GameCard from './components/GameCard';
import GameFilters from './components/GameFilters';
import GameForm from './components/GameForm';
import GameDetails from './components/GameDetails';
import EmptyState from './components/EmptyState';
import Modal from './components/Modal';
import Navbar from './components/Navbar';
import Login from './components/Login';
import AiSettings from './components/AiSettings';
import RandomGameModal from './components/RandomGameModal';
import { EMPTY_FORM, gameToForm, getGameTargetYear, pickRandomGame, completedInYear } from './constants/gameOptions';
import { useGameFilters } from './hooks/useGameFilters';
import { useGames } from './hooks/useGames';
import { useCovers } from './hooks/useCovers';
import { useTheme } from './hooks/useTheme';
import { useAiSettings } from './hooks/useAiSettings';
import { useYearGoal } from './hooks/useYearGoal';

const Statistics = lazy(() => import('./components/Statistics'));

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('authToken')));
    const { games, isLoading, isSaving, error, reload, createGame, updateGame, deleteGame } = useGames(isAuthenticated);
    const filters = useGameFilters(games);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formDirty, setFormDirty] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [view, setView] = useState('collection');
    const [layout, setLayout] = useState('cards');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [randomOpen, setRandomOpen] = useState(false);
    const [randomGame, setRandomGame] = useState(null);
    const { covers, isLoadingCovers, coversError, loadCovers } = useCovers(isAuthenticated, formOpen);
    const { theme, toggleTheme } = useTheme();
    const { settings: aiSettings, updateSettings: updateAiSettings } = useAiSettings();
    const { yearGoal, setYearGoal } = useYearGoal();
    const openSettings = () => setSettingsOpen(true);
    const alertBase = theme === 'light'
        ? { background: '#ffffff', color: '#0f172a', confirmButtonColor: '#2563eb' }
        : { background: '#1f2937', color: '#f9fafb', confirmButtonColor: '#2563eb' };

    const anyModalOpen = formOpen || detailsOpen || settingsOpen || randomOpen;

    useEffect(() => {
        if (!isAuthenticated) return undefined;
        const onKeyDown = (event) => {
            const tag = event.target?.tagName;
            const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target?.isContentEditable;
            if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
            if (anyModalOpen) return;
            if (event.key === '/') {
                event.preventDefault();
                setView('collection');
                requestAnimationFrame(() => document.getElementById('game-search')?.focus());
            }
            if (event.key === 'n' || event.key === 'N') {
                event.preventDefault();
                setForm(EMPTY_FORM); setFormDirty(false); setEditingId(null); setFormOpen(true);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isAuthenticated, anyModalOpen]);

    if (!isAuthenticated) return <Login onLogin={(token) => { localStorage.setItem('authToken', token); setIsAuthenticated(true); }} />;

    const trackableGames = games.filter((game) => !game.isOnline);
    const currentYear = new Date().getFullYear();
    const completedThisYear = games.filter((game) => completedInYear(game, currentYear)).length;
    const randomPool = games.filter((game) => game.status === 'Backlog' || game.status === 'Jugando');
    const stats = { total: games.length, trackedTotal: trackableGames.length, completed: trackableGames.filter((game) => game.status === 'Completado').length, playing: trackableGames.filter((game) => game.status === 'Jugando').length, backlog: trackableGames.filter((game) => game.status === 'Backlog').length };
    const openRandom = () => {
        setRandomGame(pickRandomGame(randomPool));
        setRandomOpen(true);
    };
    const rerollRandom = () => setRandomGame(pickRandomGame(randomPool, randomGame?.id));
    const resetForm = async (force = false) => {
        if (!force && formDirty) {
            const result = await Swal.fire({ ...alertBase, title: '¿Descartar cambios?', text: 'Los datos introducidos se perderán.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Descartar', cancelButtonText: 'Seguir editando' });
            if (!result.isConfirmed) return;
        }
        setForm(EMPTY_FORM); setFormDirty(false); setEditingId(null); setFormOpen(false);
    };
    const openEdit = (game) => { setForm(gameToForm(game)); setFormDirty(false); setEditingId(game.id); setFormOpen(true); };
    const openDetails = (game) => { setSelectedGame(game); setDetailsOpen(true); };
    const editFromDetails = (game) => { setDetailsOpen(false); openEdit(game); };

    const submitForm = async (event) => {
        event.preventDefault();
        const { coverFile, ...rest } = form;
        // Si hay key de R2, no persistimos la URL (previsualización/prefirmada).
        const payload = {
            ...rest,
            imageUrl: form.imageKey ? '' : form.imageUrl,
            rating: form.rating === '' ? null : Number(form.rating),
            targetYear: form.targetYear === '' ? null : Number(form.targetYear),
            hoursPlayed: form.hoursPlayed === '' ? null : Number(form.hoursPlayed),
            wishlist: Boolean(form.wishlist),
            genres: Array.isArray(form.genres) ? form.genres : []
        };
        try {
            if (editingId) await updateGame(editingId, payload, coverFile); else await createGame(payload, coverFile);
            await resetForm(true);
            await Swal.fire({ ...alertBase, title: editingId ? 'Juego actualizado' : 'Juego agregado', icon: 'success', timer: 1400, showConfirmButton: false });
        } catch (requestError) {
            await Swal.fire({ ...alertBase, title: 'No se pudo guardar', text: requestError.response?.data?.mensaje || requestError.response?.data?.message || 'Comprueba la conexión con la API.', icon: 'error' });
        }
    };

    const playRandomGame = async (game) => {
        try {
            await updateGame(game.id, { ...game, status: 'Jugando' });
            setRandomOpen(false);
            await Swal.fire({ ...alertBase, title: '¡A jugar!', text: `"${game.title}" pasa a Jugando.`, icon: 'success', timer: 1400, showConfirmButton: false });
            await reload();
        } catch {
            await Swal.fire({ ...alertBase, title: 'No se pudo actualizar', icon: 'error' });
        }
    };

    const removeGame = async (game) => {
        const result = await Swal.fire({ ...alertBase, title: '¿Eliminar juego?', text: `Se eliminará "${game.title}" de tu colección.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' });
        if (!result.isConfirmed) return;
        try { await deleteGame(game.id); await Swal.fire({ ...alertBase, title: 'Juego eliminado', icon: 'success', timer: 1200, showConfirmButton: false }); } catch { await Swal.fire({ ...alertBase, title: 'No se pudo eliminar', icon: 'error' }); }
    };

    const handleFormChange = (updater) => { setForm(updater); setFormDirty(true); };
    const logout = () => { localStorage.removeItem('authToken'); setIsAuthenticated(false); };
    const changeView = (nextView) => setView(nextView);

    return <div className="min-h-screen bg-gray-950 text-white"><Navbar {...{ totalGames: stats.total, trackedTotal: stats.trackedTotal, gamesCompleted: stats.completed, gamesPlaying: stats.playing, gamesBacklog: stats.backlog }} theme={theme} onToggleTheme={toggleTheme} onOpenSettings={openSettings} onLogout={logout} yearGoal={yearGoal} completedThisYear={completedThisYear} onSetYearGoal={setYearGoal} /><nav className="sticky top-16 z-30 border-b border-gray-800 bg-gray-900" role="tablist" aria-label="Vistas"><div className="mx-auto flex max-w-7xl"><Tab active={view === 'collection'} label="Mi colección" onClick={() => changeView('collection')} /><Tab active={view === 'statistics'} label="Estadísticas" onClick={() => changeView('statistics')} /></div></nav><main className="mx-auto max-w-7xl p-4 sm:p-8">
        {view === 'collection' ? <><div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm uppercase tracking-widest text-blue-400">Tu biblioteca</p><h1 className="text-3xl font-black sm:text-4xl">Juega a tu manera.</h1></div><div className="flex flex-wrap gap-2"><button onClick={openRandom} className="rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-3 font-bold text-purple-200 transition hover:bg-purple-500/20">🎲 Sorpresa</button><button onClick={() => { setForm(EMPTY_FORM); setFormDirty(false); setEditingId(null); setFormOpen(true); }} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500">＋ Añadir juego</button></div></div><Modal isOpen={formOpen} onClose={resetForm} title={editingId ? `Editar: ${form.title}` : 'Añadir juego'} size="wide" showFooter={false}><GameForm form={form} isEditing={Boolean(editingId)} isSaving={isSaving} onChange={handleFormChange} onSubmit={submitForm} onCancel={resetForm} aiSettings={aiSettings} onOpenSettings={openSettings} covers={covers} coversLoading={isLoadingCovers} coversError={coversError} onReloadCovers={loadCovers} /></Modal><GameFilters {...filters} showFilters={showFilters} onToggle={() => setShowFilters((value) => !value)} onUpdate={filters.updateFilters} onClear={filters.clearFilters} onSortBy={filters.setSortBy} onToggleSort={filters.toggleSort} resultCount={filters.filteredGames.length} totalCount={games.length} />{isLoading ? <Loading /> : error ? <EmptyState icon="⚠️" title="No se pudo cargar" message={error} actionLabel="Reintentar" onAction={reload} /> : games.length === 0 ? <EmptyState icon="🎮" title="Tu colección está vacía" message="Añade tu primer videojuego para empezar a construirla." actionLabel="Añadir juego" onAction={() => setFormOpen(true)} /> : filters.filteredGames.length === 0 ? <EmptyState icon="🔎" title="Sin resultados" message="Prueba a cambiar o limpiar los filtros." actionLabel="Limpiar filtros" onAction={filters.clearFilters} /> : <><div className="mb-4 flex justify-end gap-2"><button onClick={() => setLayout('cards')} aria-pressed={layout === 'cards'} className={`rounded px-3 py-2 text-sm ${layout === 'cards' ? 'bg-blue-600' : 'bg-gray-800'}`}>Tarjetas</button><button onClick={() => setLayout('list')} aria-pressed={layout === 'list'} className={`rounded px-3 py-2 text-sm ${layout === 'list' ? 'bg-blue-600' : 'bg-gray-800'}`}>Lista</button></div>{layout === 'cards' ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filters.currentPageGames.map((game) => <GameCard key={game.id} game={game} onClick={openDetails} onEdit={openEdit} onDelete={removeGame} />)}</div> : <GameList games={filters.currentPageGames} onClick={openDetails} onEdit={openEdit} onDelete={removeGame} />}<Pagination page={filters.page} totalPages={filters.totalPages} count={filters.filteredGames.length} onPage={filters.setCurrentPage} /></>}</> : <section aria-labelledby="stats-title"><div className="mb-8 text-center"><h1 id="stats-title" className="text-3xl font-black">Tu colección en datos</h1><p className="text-gray-400">Descubre tus hábitos y patrones de juego.</p></div>{games.length ? <Suspense fallback={<Loading />}><Statistics games={games} /></Suspense> : <EmptyState icon="📊" title="Sin estadísticas todavía" message="Añade juegos para empezar a ver datos." actionLabel="Ir a la colección" onAction={() => changeView('collection')} />}</section>}
    </main><Modal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} title="Detalle del juego" size="wide" showFooter={false}>{selectedGame && <GameDetails game={selectedGame} onEdit={editFromDetails} onClose={() => setDetailsOpen(false)} />}</Modal><Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} title="Configuración de IA" showFooter={false}><AiSettings settings={aiSettings} onChange={updateAiSettings} /></Modal><Modal isOpen={randomOpen} onClose={() => setRandomOpen(false)} title="🎲 Sorpresa" showFooter={false}><RandomGameModal game={randomGame} onReroll={rerollRandom} onPlay={playRandomGame} onOpen={(game) => { setRandomOpen(false); openDetails(game); }} onClose={() => setRandomOpen(false)} /></Modal></div>;
}

const Tab = ({ active, label, onClick }) => <button role="tab" aria-selected={active} onClick={onClick} className={`border-b-2 px-5 py-4 text-sm font-bold ${active ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'}`}>{label}</button>;
const Loading = () => <div className="py-20 text-center text-gray-400" role="status"><span className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /><p>Cargando...</p></div>;
const Pagination = ({ page, totalPages, count, onPage }) => totalPages > 1 && <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Paginación"><button disabled={page === 1} onClick={() => onPage(page - 1)} className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-300 transition hover:border-gray-500 disabled:opacity-40">Anterior</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} onClick={() => onPage(number)} aria-current={page === number ? 'page' : undefined} className={`rounded-lg px-3.5 py-2 font-medium transition ${page === number ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40' : 'border border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'}`}>{number}</button>)}<button disabled={page === totalPages} onClick={() => onPage(page + 1)} className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-300 transition hover:border-gray-500 disabled:opacity-40">Siguiente</button><span className="w-full text-center text-sm text-gray-500">{count} juegos · página {page} de {totalPages}</span></nav>;
const GameList = ({ games, onClick, onEdit, onDelete }) => <div className="overflow-x-auto rounded-xl border border-gray-800"><table className="w-full text-left text-sm"><caption className="sr-only">Lista de juegos</caption><thead className="bg-gray-900 text-gray-400"><tr><th className="p-4">Juego</th><th className="p-4">Plataforma</th><th className="p-4">Estado</th><th className="p-4">Año</th><th className="p-4">Rating</th><th className="p-4">Acciones</th></tr></thead><tbody>{games.map((game) => <tr key={game.id} className="border-t border-gray-800 bg-gray-950 transition hover:bg-gray-800/60"><th scope="row" className="p-4 text-white"><button onClick={() => onClick(game)} className="hover:text-blue-400">{game.title}</button></th><td className="p-4 text-gray-300">{game.platform}</td><td className="p-4 text-gray-300">{game.status}</td><td className="p-4 text-blue-300">{getGameTargetYear(game) || '—'}</td><td className="p-4 text-yellow-300">{game.rating ? `${Number(game.rating).toFixed(1)}/10` : '—'}</td><td className="p-4"><button onClick={() => onEdit(game)} className="mr-3 text-blue-300 hover:text-blue-200">Editar</button><button onClick={() => onDelete(game)} className="text-red-300 hover:text-red-200">Eliminar</button></td></tr>)}</tbody></table></div>;
Tab.propTypes = { active: PropTypes.bool.isRequired, label: PropTypes.string.isRequired, onClick: PropTypes.func.isRequired };
Pagination.propTypes = { page: PropTypes.number.isRequired, totalPages: PropTypes.number.isRequired, count: PropTypes.number.isRequired, onPage: PropTypes.func.isRequired };
GameList.propTypes = { games: PropTypes.array.isRequired, onClick: PropTypes.func.isRequired, onEdit: PropTypes.func.isRequired, onDelete: PropTypes.func.isRequired };

export default App;
