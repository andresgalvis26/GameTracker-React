import PropTypes from 'prop-types';

const GameCard = ({ game, onDelete, onClick, onEdit }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Jugando': return 'bg-green-500';
            case 'Completado': return 'bg-blue-500';
            case 'Backlog': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const getPlatformChip = (platform) => {
        switch (platform) {
            case 'PC':
                return {
                    bg: 'bg-slate-600',
                    text: 'text-slate-100',
                    border: 'border-slate-500'
                };
            case 'Switch':
                return {
                    bg: 'bg-red-600',
                    text: 'text-red-100',
                    border: 'border-red-500'
                };
            case 'PS5':
                return {
                    bg: 'bg-blue-700',
                    text: 'text-blue-100',
                    border: 'border-blue-600'
                };
            case 'PS4':
                return {
                    bg: 'bg-blue-800',
                    text: 'text-blue-200',
                    border: 'border-blue-700'
                };
            case 'Xbox One':
                return {
                    bg: 'bg-green-700',
                    text: 'text-green-100',
                    border: 'border-green-600'
                };
            case 'Xbox 360':
                return {
                    bg: 'bg-green-800',
                    text: 'text-green-200',
                    border: 'border-green-700'
                };
            default:
                return {
                    bg: 'bg-purple-600',
                    text: 'text-purple-100',
                    border: 'border-purple-500'
                };
        }
    };

    const getRatingColor = (rating) => {
        if (rating >= 8) return 'text-green-400';
        if (rating >= 6) return 'text-yellow-400';
        if (rating >= 4) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div
            className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => onClick(game)}
        >
            {/* Imagen del juego */}
            <div className="relative h-96 overflow-hidden bg-gray-700">
                {game.imageUrl ? (
                    <img
                        src={game.imageUrl}
                        alt={game.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}

                {/* Fallback si no hay imagen o falla al cargar */}
                <div
                    className={`absolute inset-0 flex items-center justify-center text-6xl ${!game.imageUrl ? 'flex' : 'hidden'}`}
                    style={{ display: !game.imageUrl ? 'flex' : 'none' }}
                >
                    🎮
                </div>

                {/* Badge de estado */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(game.status)}`}>
                    {game.status}
                </div>

                {/* Badge de platinado - solo para juegos completados */}
                {game.status === 'Completado' && game.platinated && (
                    <div className="absolute top-12 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 px-2 py-1 rounded-full text-xs font-bold text-gray-900 shadow-lg border border-yellow-300">
                        🏆 Platino
                    </div>
                )}

                {/* Badge de rejugable - solo para juegos completados */}
                {game.status === 'Completado' && game.replayable && (
                    <div className={`absolute left-3 bg-purple-600 px-2 py-1 rounded-full text-xs font-bold text-white`}
                         style={{ top: game.platinated ? '5.25rem' : '3rem' }}>
                        🔄 Rejugable
                    </div>
                )}

                {/* Rating */}
                {game.rating > 0 && (
                    <div className="absolute top-3 right-3 bg-black bg-opacity-70 px-2 py-1 rounded-lg">
                        <span className={`font-bold ${getRatingColor(game.rating)}`}>
                            ⭐ {Number(game.rating).toFixed(1)}/10
                        </span>
                    </div>
                )}
            </div>

            {/* Contenido de la card */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-white leading-tight flex-1 mr-2">
                        {game.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(game);
                            }}
                            className="text-blue-400 hover:text-blue-300 transition-colors text-lg"
                            title="Editar juego"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(game.id);
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors text-lg"
                            title="Eliminar juego"
                        >
                            🗑️
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Chip de plataforma con color específico */}
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPlatformChip(game.platform).bg} ${getPlatformChip(game.platform).text} ${getPlatformChip(game.platform).border}`}
                        >
                            {game.platform}
                        </span>
                        
                        {/* Chip de tienda PC si aplica */}
                        {game.platform === 'PC' && game.pcStore && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-200 border border-gray-600">
                                🛒 {game.pcStore}
                            </span>
                        )}
                    </div>

                    <div className="text-gray-400 text-xs">
                        {new Date(game.createdAt).toLocaleDateString('es-ES')}
                    </div>
                </div>

                {/* Información del año según el estado */}
                {game.targetYear && (
                    <div className="flex items-center justify-center mb-3">
                        <div className={`px-3 py-1 rounded-lg text-xs font-medium ${game.status === 'Completado'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                            {game.status === 'Completado'
                                ? `✅ Completado en ${game.targetYear}`
                                : `🎯 Objetivo: ${game.targetYear}`
                            }
                        </div>
                    </div>
                )}

                {/* Barra de progreso visual si está jugando */}
                {game.status === 'Jugando' && game.rating && (
                    <div className="mt-3">
                        <div className="bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(Number(game.rating) || 0) * 10}%` }}
                            ></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 text-center">
                            Progreso: {Number(game.rating).toFixed(1)}/10
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

GameCard.propTypes = {
    game: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        platform: PropTypes.string.isRequired,
        pcStore: PropTypes.string,
        status: PropTypes.string.isRequired,
        rating: PropTypes.number,
        imageUrl: PropTypes.string,
        description: PropTypes.string,
        targetYear: PropTypes.number,
        replayable: PropTypes.bool,
        createdAt: PropTypes.string.isRequired,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
};

export default GameCard;