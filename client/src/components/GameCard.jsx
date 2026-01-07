import PropTypes from 'prop-types';

const GameCard = ({ game, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Jugando': return 'bg-green-500';
      case 'Completado': return 'bg-blue-500';
      case 'Backlog': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformEmoji = (platform) => {
    switch (platform) {
      case 'PC': return '🖥️';
      case 'Switch': return '🎮';
      case 'PS5': return '🎯';
      case 'PS4': return '🎪';
      case 'Xbox One': return '🟢';
      case 'Xbox 360': return '⚪';
      default: return '🎲';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    if (rating >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
      {/* Imagen del juego */}
      <div className="relative h-48 overflow-hidden bg-gray-700">
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

        {/* Rating */}
        {game.rating > 0 && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-70 px-2 py-1 rounded-lg">
            <span className={`font-bold ${getRatingColor(game.rating)}`}>
              ⭐ {game.rating}/10
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
          <button
            onClick={() => onDelete(game.id)}
            className="text-red-400 hover:text-red-300 transition-colors text-xl"
            title="Eliminar juego"
          >
            🗑️
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-lg">{getPlatformEmoji(game.platform)}</span>
            <span>{game.platform}</span>
          </div>
          
          <div className="text-gray-400 text-xs">
            {new Date(game.createdAt).toLocaleDateString('es-ES')}
          </div>
        </div>

        {/* Barra de progreso visual si está jugando */}
        {game.status === 'Jugando' && (
          <div className="mt-3">
            <div className="bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(game.rating || 0) * 10}%` }}
              ></div>
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
    status: PropTypes.string.isRequired,
    rating: PropTypes.number,
    imageUrl: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default GameCard;