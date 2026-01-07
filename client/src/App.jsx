import { useState, useEffect } from 'react';
import axios from 'axios';
import GameCard from './components/GameCard';
import Modal from './components/Modal';
import Navbar from './components/Navbar';
import Swal from 'sweetalert2';

function App() {
  const [games, setGames] = useState([]);
  const [form, setForm] = useState({ title: '', platform: 'PC', status: 'Backlog', rating: 0, imageUrl: '', description: '' });
  const [selectedGame, setSelectedGame] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar juegos al iniciar
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    const res = await axios.get('http://localhost:3000/games');
    setGames(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:3000/games', form);
    setForm({ title: '', platform: 'PC', status: 'Backlog', rating: 0, imageUrl: '', description: '' }); // Limpiar
    fetchGames(); // Recargar lista
  };

  const handleDelete = async (id, gameTitle) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar "${gameTitle}" de tu colección?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#1f2937',
      color: '#f9fafb',
      customClass: {
        popup: 'border border-gray-600',
        title: 'text-white',
        content: 'text-gray-300'
      }
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/games/${id}`);
        fetchGames();

        Swal.fire({
          title: '¡Eliminado!',
          text: 'El juego ha sido eliminado de tu colección.',
          icon: 'success',
          confirmButtonColor: '#059669',
          background: '#1f2937',
          color: '#f9fafb',
          customClass: {
            popup: 'border border-gray-600',
            title: 'text-white',
            content: 'text-gray-300'
          }
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el juego. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonColor: '#dc2626',
          background: '#1f2937',
          color: '#f9fafb',
          customClass: {
            popup: 'border border-gray-600',
            title: 'text-white',
            content: 'text-gray-300'
          }
        });
      }
    }
  };

  const handleGameClick = (game) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
  };

  // Calcular estadísticas para el navbar
  const getGameStats = () => {
    const total = games.length;
    const completed = games.filter(game => game.status === 'Completado').length;
    const playing = games.filter(game => game.status === 'Jugando').length;
    const backlog = games.filter(game => game.status === 'Backlog').length;

    return { total, completed, playing, backlog };
  };

  const stats = getGameStats();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <Navbar
        totalGames={stats.total}
        gamesCompleted={stats.completed}
        gamesPlaying={stats.playing}
        gamesBacklog={stats.backlog}
      />

      {/* Contenido principal */}
      <div className="text-white p-6 sm:p-8 lg:p-10 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Título de sección */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-2">🎮 Administrar Colección</h2>
            <p className="text-gray-400 text-center">Agrega nuevos juegos a tu biblioteca personal</p>
          </div>

          {/* Formulario */}
          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Nombre del videojuego"
                  className="p-2 rounded bg-gray-700 text-white w-full"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="URL de la imagen del juego (opcional)"
                  className="p-2 rounded bg-gray-700 text-white w-full"
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                />
                <textarea
                  placeholder="Descripción o resumen del juego (opcional)"
                  className="p-2 rounded bg-gray-700 text-white w-full h-42 resize-none"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
                <div className="flex gap-2">
                  <select
                    className="p-2 rounded bg-gray-700 w-1/3"
                    value={form.platform}
                    onChange={e => setForm({ ...form, platform: e.target.value })}
                  >
                    <option>PC</option>
                    <option>Switch</option>
                    <option>PS5</option>
                    <option>PS4</option>
                    <option>Xbox One</option>
                    <option>Xbox 360</option>
                    <option>Otra plataforma</option>
                  </select>
                  <select
                    className="p-2 rounded bg-gray-700 w-1/3"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option>Backlog</option>
                    <option>Jugando</option>
                    <option>Completado</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Rate (1-10)"
                    className="p-2 rounded bg-gray-700 w-1/3"
                    max="10"
                    min="0"
                    value={form.rating}
                    onChange={e => setForm({ ...form, rating: e.target.value })}
                  />
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold transition">
                  Guardar Juego
                </button>
              </div>
            </form>

          </div>

          {/* Grid de Cards */}
          {games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  onDelete={(id) => handleDelete(id, game.title)}
                  onClick={() => handleGameClick(game)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">Tu colección está vacía</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                ¡Comienza agregando tu primer juego usando el formulario de arriba!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para mostrar detalles del juego */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedGame?.title || 'Detalles del Juego'}
      >
        {selectedGame && (
          <div className="space-y-6">
            {/* Imagen del juego en el modal */}
            {selectedGame.imageUrl && (
              <div className="w-full h-full overflow-hidden rounded-lg bg-gray-700">
                <img
                  src={selectedGame.imageUrl}
                  alt={selectedGame.title}
                  className="w-full h-full object-fit"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}

            {/* Información del juego */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Plataforma:</span>
                <p className="text-white font-semibold">{selectedGame.platform}</p>
              </div>
              <div>
                <span className="text-gray-400">Estado:</span>
                <p className="text-white font-semibold">{selectedGame.status}</p>
              </div>
              <div>
                <span className="text-gray-400">Puntuación:</span>
                <p className="text-white font-semibold">
                  {selectedGame.rating > 0 ? `${selectedGame.rating}/10` : 'Sin puntuar'}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Agregado:</span>
                <p className="text-white font-semibold">
                  {new Date(selectedGame.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">📝 Descripción</h3>
              {selectedGame.description ? (
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedGame.description}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-gray-500 italic">
                    No hay descripción disponible para este juego.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default App;