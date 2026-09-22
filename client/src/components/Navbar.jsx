import { useState } from 'react';
import PropTypes from 'prop-types';

const Navbar = ({ totalGames, trackedTotal, gamesCompleted, gamesPlaying, gamesBacklog, theme, onToggleTheme, onOpenSettings, onLogout, yearGoal = null, completedThisYear, onSetYearGoal }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [goalDraft, setGoalDraft] = useState('');
    const [isGoalOpen, setIsGoalOpen] = useState(false);

    const getCompletionPercentage = () => {
        if (trackedTotal === 0) return 0;
        return Math.round((gamesCompleted / trackedTotal) * 100);
    };

    const goalPercent = yearGoal ? Math.min(100, Math.round((completedThisYear / yearGoal) * 100)) : 0;

    const saveGoal = (event) => {
        event.preventDefault();
        const value = Number(goalDraft);
        onSetYearGoal(Number.isFinite(value) && value > 0 ? Math.floor(value) : null);
        setIsGoalOpen(false);
    };

    return (
        <nav className="relative bg-gray-800 shadow-lg border-b border-gray-700 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo y título */}
                    <div className="flex items-center">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-600 rounded-lg p-2">
                                <span className="text-2xl">🎮</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Game Tracker</h1>
                                <p className="text-xs text-gray-400">Tu colección personal</p>
                            </div>
                        </div>
                    </div>

                    {/* Estadísticas del centro (solo desktop) */}
                    <div className="hidden md:flex items-center space-x-6">
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{totalGames}</div>
                                <div className="text-gray-400">Total</div>
                            </div>

                            <div className="h-8 w-px bg-gray-600"></div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{gamesCompleted}</div>
                                <div className="text-gray-400">Completados</div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400">{gamesPlaying}</div>
                                <div className="text-gray-400">Jugando</div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-400">{gamesBacklog}</div>
                                    <div className="text-gray-400">Backlog</div>
                            </div>

                            <div className="h-8 w-px bg-gray-600"></div>

                            <div className="text-center">
                                <button type="button" onClick={() => { setGoalDraft(yearGoal ? String(yearGoal) : ''); setIsGoalOpen((open) => !open); }} className="rounded-lg px-1 hover:bg-gray-700/50" title="Editar meta del año" aria-expanded={isGoalOpen}>
                                    <div className="text-2xl font-bold text-purple-300">{completedThisYear}{yearGoal ? `/${yearGoal}` : ''}</div>
                                    <div className="text-gray-400">Meta {new Date().getFullYear()}</div>
                                </button>
                            </div>
                        </div>

                        {/* Barra de progreso */}
                        <div className="flex flex-col items-center">
                            <div className="text-xs text-gray-400 mb-1">Progreso jugable</div>
                            <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${getCompletionPercentage()}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-semibold text-white">
                                    {getCompletionPercentage()}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {isGoalOpen && (
                        <form onSubmit={saveGoal} className="absolute right-4 top-16 z-50 w-64 rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-2xl">
                            <label htmlFor="year-goal" className="block text-xs font-bold uppercase tracking-wider text-purple-300">Meta de juegos {new Date().getFullYear()}</label>
                            <input id="year-goal" type="number" min="1" max="999" value={goalDraft} onChange={(event) => setGoalDraft(event.target.value)} placeholder="Ej. 12" className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white" autoFocus />
                            {yearGoal > 0 && <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-800"><div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: `${goalPercent}%` }} /></div>}
                            <div className="mt-3 flex gap-2">
                                <button type="submit" className="flex-1 rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-500">Guardar</button>
                                <button type="button" onClick={() => { onSetYearGoal(null); setIsGoalOpen(false); }} className="rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white">Quitar</button>
                            </div>
                        </form>
                    )}

                    {/* Botón de menú móvil */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-400 hover:text-white focus:outline-none focus:text-white p-2"
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-menu"
                            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Acciones del lado derecho (solo desktop) */}
                    <div className="hidden md:flex items-center space-x-3">
                        <button type="button" onClick={onOpenSettings} className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-300 hover:border-blue-400 hover:text-white" aria-label="Configuración de IA" title="Configuración de IA">⚙️</button>
                        <button type="button" onClick={onToggleTheme} className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-300 hover:border-blue-400 hover:text-white" aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>{theme === 'dark' ? '☀️' : '🌙'}</button>
                        <div className="hidden text-right lg:block">
                            <div className="text-sm text-gray-400">¡Sigue jugando!</div>
                            <div className="text-xs text-gray-500">
                                {new Date().toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                        
                        {/* Botón de logout */}
                        <button
                            onClick={onLogout}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            title="Cerrar sesión"
                        >
                            <span>🚪</span>
                            Salir
                        </button>
                    </div>
                </div>

                {/* Menú móvil expandible */}
                {isMenuOpen && (
                    <div id="mobile-menu" className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900 rounded-lg mt-2">
                            {/* Estadísticas móviles */}
                            <div className="grid grid-cols-2 gap-4 p-3">
                                <div className="text-center bg-gray-800 rounded-lg p-3">
                                    <div className="text-xl font-bold text-white">{totalGames}</div>
                                    <div className="text-xs text-gray-400">Total de juegos</div>
                                </div>
                                <div className="text-center bg-gray-800 rounded-lg p-3">
                                    <div className="text-xl font-bold text-green-400">{gamesCompleted}</div>
                                    <div className="text-xs text-gray-400">Completados</div>
                                </div>
                                <div className="text-center bg-gray-800 rounded-lg p-3">
                                    <div className="text-xl font-bold text-yellow-400">{gamesPlaying}</div>
                                    <div className="text-xs text-gray-400">Jugando</div>
                                </div>
                                <div className="text-center bg-gray-800 rounded-lg p-3">
                                    <div className="text-xl font-bold text-orange-400">{gamesBacklog}</div>
                                    <div className="text-xs text-gray-400">En espera</div>
                                </div>
                                <div className="text-center bg-gray-800 rounded-lg p-3">
                                    <div className="text-xl font-bold text-purple-300">{completedThisYear}{yearGoal ? `/${yearGoal}` : ''}</div>
                                    <div className="text-xs text-gray-400">Meta {new Date().getFullYear()}</div>
                                </div>
                            </div>

                            {/* Progreso móvil */}
                            <div className="p-3 bg-gray-800 rounded-lg mx-3">
                                <div className="text-center">
                                    <div className="text-sm text-gray-400 mb-2">Progreso jugable</div>
                                    <div className="flex items-center justify-center space-x-3">
                                        <div className="flex-1 bg-gray-700 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${getCompletionPercentage()}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-lg font-bold text-white">
                                            {getCompletionPercentage()}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Botón de logout móvil */}
                            <div className="p-3">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onOpenSettings();
                                    }}
                                    className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300 transition hover:border-blue-400/50 hover:text-white"
                                >
                                    ⚙️ Configuración de IA
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onToggleTheme();
                                    }}
                                    className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300 transition hover:border-blue-400/50 hover:text-white"
                                >
                                    {theme === 'dark' ? '☀️ Activar modo claro' : '🌙 Activar modo oscuro'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onLogout();
                                    }}
                                    className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>🚪</span>
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

Navbar.propTypes = {
    totalGames: PropTypes.number.isRequired,
    trackedTotal: PropTypes.number.isRequired,
    gamesCompleted: PropTypes.number.isRequired,
    gamesPlaying: PropTypes.number.isRequired,
    gamesBacklog: PropTypes.number.isRequired,
    theme: PropTypes.oneOf(['dark', 'light']).isRequired,
    onToggleTheme: PropTypes.func.isRequired,
    onOpenSettings: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    yearGoal: PropTypes.number,
    completedThisYear: PropTypes.number.isRequired,
    onSetYearGoal: PropTypes.func.isRequired,
};

export default Navbar;
