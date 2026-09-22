import PropTypes from 'prop-types';
import DataTools from './DataTools';
import { GENRES, PC_STORES, PLATFORMS, STATUSES } from '../constants/gameOptions';

const GameFilters = ({ filters, games, filteredGames, showFilters, onToggle, onUpdate, onClear, sortBy, sortOrder, onSortBy, onToggleSort, resultCount, totalCount }) => (
    <section className="mb-8 rounded-2xl border border-gray-800 bg-gray-900/70 p-4 shadow-sm sm:p-5" aria-labelledby="filters-title">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
                <h2 id="filters-title" className="text-xl font-bold">Buscar y filtrar</h2>
                <span className="rounded-full bg-gray-800 px-2.5 py-1 text-sm text-gray-400" aria-live="polite">{resultCount} de {totalCount}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                <DataTools games={games} filteredGames={filteredGames} />
                <button onClick={onClear} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 transition hover:border-gray-500 hover:text-white">Limpiar</button>
                <button onClick={onToggle} aria-expanded={showFilters} aria-controls="advanced-filters" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">{showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}</button>
            </div>
        </div>
        <label htmlFor="game-search" className="sr-only">Buscar juegos</label>
        <input id="game-search" type="search" value={filters.searchText} onChange={(event) => onUpdate({ searchText: event.target.value })} placeholder="Buscar por título, descripción o género..." className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3 text-white transition focus:border-blue-500" />
        <div className="mt-3 flex flex-wrap gap-2">
            {['', ...STATUSES, 'wishlist'].map((status) => (
                <button
                    key={status || 'all'}
                    onClick={() => (status === 'wishlist' ? onUpdate({ wishlist: filters.wishlist === 'true' ? '' : 'true', status: '' }) : onUpdate({ status, wishlist: '' }))}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${status === 'wishlist'
                        ? filters.wishlist === 'true' ? 'border-pink-500 bg-pink-600 text-white' : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-pink-400/60 hover:text-white'
                        : filters.status === status && !filters.wishlist ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500 hover:text-white'}`}
                >{status === 'wishlist' ? '🎯 Deseados' : status || 'Todos'}</button>
            ))}
        </div>
        {showFilters && (
            <div id="advanced-filters" className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-gray-800 bg-gray-800/70 p-5 sm:grid-cols-2 lg:grid-cols-3">
                <Filter label="Plataforma" value={filters.platform} options={PLATFORMS} empty="Todas" onChange={(value) => onUpdate({ platform: value, pcStore: value === 'PC' ? filters.pcStore : '' })} />
                {filters.platform === 'PC' && <Filter label="Tienda PC" value={filters.pcStore} options={PC_STORES} empty="Todas" onChange={(value) => onUpdate({ pcStore: value })} />}
                <Filter label="Género" value={filters.genre} options={GENRES} empty="Todos" onChange={(value) => onUpdate({ genre: value })} />
                <Filter label="Mínimo rating" value={filters.minRating} options={['1', '4', '6', '7', '8', '9']} empty="Sin mínimo" onChange={(value) => onUpdate({ minRating: value })} />
                <Filter label="Máximo rating" value={filters.maxRating} options={['4', '6', '7', '8', '9']} empty="Sin máximo" onChange={(value) => onUpdate({ maxRating: value })} />
                <Filter label="Tipo de juego" value={filters.online} options={['true', 'false']} labels={['Solo online', 'No online']} empty="Todos" onChange={(value) => onUpdate({ online: value })} />
                <Filter label="Lista de deseos" value={filters.wishlist} options={['true', 'false']} labels={['Solo deseados', 'Sin deseados']} empty="Todos" onChange={(value) => onUpdate({ wishlist: value })} />
                <div>
                    <label htmlFor="sort-by" className="block text-sm text-gray-300">Ordenar por</label>
                    <div className="mt-1 flex gap-2">
                        <select id="sort-by" value={sortBy} onChange={(event) => onSortBy(event.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-700 p-2 text-white">
                            <option value="createdAt">Fecha añadido</option>
                            <option value="title">Nombre</option>
                            <option value="rating">Rating</option>
                            <option value="platform">Plataforma</option>
                            <option value="status">Estado</option>
                            <option value="targetYear">Año</option>
                        </select>
                        <button onClick={onToggleSort} className="shrink-0 rounded-lg border border-gray-600 bg-gray-700 px-3 text-white transition hover:border-blue-400/50" aria-label="Cambiar orden">{sortOrder === 'asc' ? '↑' : '↓'}</button>
                    </div>
                </div>
            </div>
        )}
    </section>
);

const Filter = ({ label, value, options, labels = options, empty, onChange }) => (
    <div>
        <label htmlFor={`filter-${label}`} className="block text-sm text-gray-300">{label}</label>
        <select id={`filter-${label}`} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-700 p-2 text-white">
            <option value="">{empty}</option>
            {options.map((option, index) => <option key={option} value={option}>{labels[index]}</option>)}
        </select>
    </div>
);
Filter.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string.isRequired, options: PropTypes.arrayOf(PropTypes.string).isRequired, labels: PropTypes.arrayOf(PropTypes.string), empty: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired };
GameFilters.propTypes = { filters: PropTypes.object.isRequired, games: PropTypes.array.isRequired, filteredGames: PropTypes.array.isRequired, showFilters: PropTypes.bool.isRequired, onToggle: PropTypes.func.isRequired, onUpdate: PropTypes.func.isRequired, onClear: PropTypes.func.isRequired, sortBy: PropTypes.string.isRequired, sortOrder: PropTypes.string.isRequired, onSortBy: PropTypes.func.isRequired, onToggleSort: PropTypes.func.isRequired, resultCount: PropTypes.number.isRequired, totalCount: PropTypes.number.isRequired };
export default GameFilters;
