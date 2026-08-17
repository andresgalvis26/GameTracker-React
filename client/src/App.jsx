import { lazy, Suspense, useState } from 'react';
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
import { EMPTY_FORM, gameToForm, getGameTargetYear } from './constants/gameOptions';
import { useGameFilters } from './hooks/useGameFilters';
import { useGames } from './hooks/useGames';
import { useTheme } from './hooks/useTheme';

const Statistics = lazy(() => import('./components/Statistics'));
const alertBase = { background: '#1f2937', color: '#f9fafb', confirmButtonColor: '#2563eb' };

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
    const { theme, toggleTheme } = useTheme();

    if (!isAuthenticated) return <Login onLogin={(token) => { localStorage.setItem('authToken', token); setIsAuthenticated(true); }} />;

    const stats = { total: games.length, completed: games.filter((game) => game.status === 'Completado').length, playing: games.filter((game) => game.status === 'Jugando').length, backlog: games.filter((game) => game.status === 'Backlog').length };
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
        const payload = { ...form, rating: form.rating === '' ? null : Number(form.rating), targetYear: form.targetYear === '' ? null : Number(form.targetYear) };
        try {
            if (editingId) await updateGame(editingId, payload); else await createGame(payload);
            await resetForm(true);
            await Swal.fire({ ...alertBase, title: editingId ? 'Juego actualizado' : 'Juego agregado', icon: 'success', timer: 1400, showConfirmButton: false });
        } catch (requestError) {
            await Swal.fire({ ...alertBase, title: 'No se pudo guardar', text: requestError.response?.data?.message || 'Comprueba la conexión con la API.', icon: 'error' });
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

    return <div className="min-h-screen bg-gray-950 text-white"><Navbar {...{ totalGames: stats.total, gamesCompleted: stats.completed, gamesPlaying: stats.playing, gamesBacklog: stats.backlog }} theme={theme} onToggleTheme={toggleTheme} onLogout={logout} /><nav className="sticky top-16 z-30 border-b border-gray-800 bg-gray-900" role="tablist" aria-label="Vistas"><div className="mx-auto flex max-w-7xl"><Tab active={view === 'collection'} label="Mi colección" onClick={() => changeView('collection')} /><Tab active={view === 'statistics'} label="Estadísticas" onClick={() => changeView('statistics')} /></div></nav><main className="mx-auto max-w-7xl p-4 sm:p-8">
        {view === 'collection' ? <><div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm uppercase tracking-widest text-blue-400">Tu biblioteca</p><h1 className="text-3xl font-black sm:text-4xl">Juega a tu manera.</h1></div><button onClick={() => { setForm(EMPTY_FORM); setFormDirty(false); setEditingId(null); setFormOpen(true); }} className="rounded-xl bg-blue-600 px-5 py-3 font-bold shadow-lg shadow-blue-900/30 hover:bg-blue-500">＋ Añadir juego</button></div><Modal isOpen={formOpen} onClose={resetForm} title={editingId ? `Editar: ${form.title}` : 'Añadir juego'} size="wide" showFooter={false}><GameForm form={form} isEditing={Boolean(editingId)} isSaving={isSaving} onChange={handleFormChange} onSubmit={submitForm} onCancel={resetForm} /></Modal><GameFilters {...filters} showFilters={showFilters} onToggle={() => setShowFilters((value) => !value)} onUpdate={filters.updateFilters} onClear={filters.clearFilters} onSortBy={filters.setSortBy} onToggleSort={filters.toggleSort} resultCount={filters.filteredGames.length} totalCount={games.length} />{isLoading ? <Loading /> : error ? <EmptyState icon="⚠️" title="No se pudo cargar" message={error} actionLabel="Reintentar" onAction={reload} /> : games.length === 0 ? <EmptyState icon="🎮" title="Tu colección está vacía" message="Añade tu primer videojuego para empezar a construirla." actionLabel="Añadir juego" onAction={() => setFormOpen(true)} /> : filters.filteredGames.length === 0 ? <EmptyState icon="🔎" title="Sin resultados" message="Prueba a cambiar o limpiar los filtros." actionLabel="Limpiar filtros" onAction={filters.clearFilters} /> : <><div className="mb-4 flex justify-end gap-2"><button onClick={() => setLayout('cards')} aria-pressed={layout === 'cards'} className={`rounded px-3 py-2 text-sm ${layout === 'cards' ? 'bg-blue-600' : 'bg-gray-800'}`}>Tarjetas</button><button onClick={() => setLayout('list')} aria-pressed={layout === 'list'} className={`rounded px-3 py-2 text-sm ${layout === 'list' ? 'bg-blue-600' : 'bg-gray-800'}`}>Lista</button></div>{layout === 'cards' ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filters.currentPageGames.map((game) => <GameCard key={game.id} game={game} onClick={openDetails} onEdit={openEdit} onDelete={removeGame} />)}</div> : <GameList games={filters.currentPageGames} onClick={openDetails} onEdit={openEdit} onDelete={removeGame} />}<Pagination page={filters.page} totalPages={filters.totalPages} count={filters.filteredGames.length} onPage={filters.setCurrentPage} /></>}</> : <section aria-labelledby="stats-title"><div className="mb-8 text-center"><h1 id="stats-title" className="text-3xl font-black">Tu colección en datos</h1><p className="text-gray-400">Descubre tus hábitos y patrones de juego.</p></div>{games.length ? <Suspense fallback={<Loading />}><Statistics games={games} /></Suspense> : <EmptyState icon="📊" title="Sin estadísticas todavía" message="Añade juegos para empezar a ver datos." actionLabel="Ir a la colección" onAction={() => changeView('collection')} />}</section>}
    </main><Modal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} title="Detalle del juego" size="wide" showFooter={false}>{selectedGame && <GameDetails game={selectedGame} onEdit={editFromDetails} onClose={() => setDetailsOpen(false)} />}</Modal></div>;
}

const Tab = ({ active, label, onClick }) => <button role="tab" aria-selected={active} onClick={onClick} className={`border-b-2 px-5 py-4 text-sm font-bold ${active ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'}`}>{label}</button>;
const Loading = () => <div className="py-20 text-center text-gray-400" role="status"><span className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /><p>Cargando...</p></div>;
const Pagination = ({ page, totalPages, count, onPage }) => totalPages > 1 && <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Paginación"><button disabled={page === 1} onClick={() => onPage(page - 1)} className="rounded bg-gray-800 px-4 py-2 disabled:opacity-40">Anterior</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} onClick={() => onPage(number)} aria-current={page === number ? 'page' : undefined} className={`rounded px-3 py-2 ${page === number ? 'bg-blue-600' : 'bg-gray-800'}`}>{number}</button>)}<button disabled={page === totalPages} onClick={() => onPage(page + 1)} className="rounded bg-gray-800 px-4 py-2 disabled:opacity-40">Siguiente</button><span className="w-full text-center text-sm text-gray-500">{count} juegos · página {page} de {totalPages}</span></nav>;
const GameList = ({ games, onClick, onEdit, onDelete }) => <div className="overflow-x-auto rounded-xl border border-gray-800"><table className="w-full text-left text-sm"><caption className="sr-only">Lista de juegos</caption><thead className="bg-gray-900 text-gray-400"><tr><th className="p-4">Juego</th><th className="p-4">Plataforma</th><th className="p-4">Estado</th><th className="p-4">Año</th><th className="p-4">Rating</th><th className="p-4">Acciones</th></tr></thead><tbody>{games.map((game) => <tr key={game.id} className="border-t border-gray-800 bg-gray-950"><th scope="row" className="p-4 text-white"><button onClick={() => onClick(game)} className="hover:text-blue-400">{game.title}</button></th><td className="p-4 text-gray-300">{game.platform}</td><td className="p-4 text-gray-300">{game.status}</td><td className="p-4 text-blue-300">{getGameTargetYear(game) || '—'}</td><td className="p-4 text-yellow-300">{game.rating ? `${Number(game.rating).toFixed(1)}/10` : '—'}</td><td className="p-4"><button onClick={() => onEdit(game)} className="mr-3 text-blue-300">Editar</button><button onClick={() => onDelete(game)} className="text-red-300">Eliminar</button></td></tr>)}</tbody></table></div>;
Tab.propTypes = { active: PropTypes.bool.isRequired, label: PropTypes.string.isRequired, onClick: PropTypes.func.isRequired };
Pagination.propTypes = { page: PropTypes.number.isRequired, totalPages: PropTypes.number.isRequired, count: PropTypes.number.isRequired, onPage: PropTypes.func.isRequired };
GameList.propTypes = { games: PropTypes.array.isRequired, onClick: PropTypes.func.isRequired, onEdit: PropTypes.func.isRequired, onDelete: PropTypes.func.isRequired };

export default App;
