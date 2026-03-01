import { useState } from 'react';
import PropTypes from 'prop-types';

const Navbar = ({ totalGames, gamesCompleted, gamesPlaying, gamesBacklog, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getCompletionPercentage = () => {
        if (totalGames === 0) return 0;
        return Math.round((gamesCompleted / totalGames) * 100);
    };

    return (
        <nav className="bg-gray-800 shadow-lg border-b border-gray-700 sticky top-0 z-40">
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
                        </div>

                        {/* Barra de progreso */}
                        <div className="flex flex-col items-center">
                            <div className="text-xs text-gray-400 mb-1">Progreso</div>
                            <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-700 rounded-full h-2">
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

                    {/* Botón de menú móvil */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-400 hover:text-white focus:outline-none focus:text-white p-2"
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
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="text-right">
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
                    <div className="md:hidden">
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
                            </div>

                            {/* Progreso móvil */}
                            <div className="p-3 bg-gray-800 rounded-lg mx-3">
                                <div className="text-center">
                                    <div className="text-sm text-gray-400 mb-2">Progreso de completación</div>
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
    gamesCompleted: PropTypes.number.isRequired,
    gamesPlaying: PropTypes.number.isRequired,
    gamesBacklog: PropTypes.number.isRequired,
    onLogout: PropTypes.func.isRequired,
};

export default Navbar;