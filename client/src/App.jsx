import { useState, useEffect } from 'react';
import axios from 'axios';
import GameCard from './components/GameCard';

function App() {
  const [games, setGames] = useState([]);
  const [form, setForm] = useState({ title: '', platform: 'PC', status: 'Backlog', rating: 0, imageUrl: '' });

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
    setForm({ title: '', platform: 'PC', status: 'Backlog', rating: 0, imageUrl: '' }); // Limpiar
    fetchGames(); // Recargar lista
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/games/${id}`);
    fetchGames();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🎮 Game Tracker</h1>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg">
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

        {/* Grid de Cards */}
        {games.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map(game => (
              <GameCard 
                key={game.id} 
                game={game} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">No tienes juegos aún</h3>
            <p className="text-gray-500">¡Agrega tu primer juego arriba!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;