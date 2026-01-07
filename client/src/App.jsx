import { useState, useEffect } from 'react';
import axios from 'axios';
import GameCard from './components/GameCard';
import Modal from './components/Modal';
import Navbar from './components/Navbar';
import Swal from 'sweetalert2';

function App() {
    const [games, setGames] = useState([]);
    const [form, setForm] = useState({ title: '', platform: 'PC', pcStore: '', status: 'Backlog', rating: 0, imageUrl: '', description: '', targetYear: '' });
    const [selectedGame, setSelectedGame] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchGames = async () => {
        const res = await axios.get('http://localhost:3000/games');
        setGames(res.data);
    };

    // Cargar juegos al iniciar
    useEffect(() => {
        fetchGames();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (isEditing) {
                // Actualizar juego existente
                await axios.put(`http://localhost:3000/games/${editingId}`, form);
                
                Swal.fire({
                    title: '¡Actualizado!',
                    text: 'El juego ha sido actualizado exitosamente.',
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
            } else {
                // Crear nuevo juego
                await axios.post('http://localhost:3000/games', form);
                
                Swal.fire({
                    title: '¡Agregado!',
                    text: 'El juego ha sido agregado a tu colección.',
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
            }
            
            // Limpiar formulario y estados
            setForm({ title: '', platform: 'PC', pcStore: '', status: 'Backlog', rating: 0, imageUrl: '', description: '', targetYear: '' });
            setIsEditing(false);
            setEditingId(null);
            fetchGames();
            
        } catch {
            Swal.fire({
                title: 'Error',
                text: `No se pudo ${isEditing ? 'actualizar' : 'agregar'} el juego. Inténtalo de nuevo.`,
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
            } catch {
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

    const handleEditGame = (game) => {
        setForm({
            title: game.title,
            platform: game.platform,
            pcStore: game.pcStore || '',
            status: game.status,
            rating: game.rating || 0,
            imageUrl: game.imageUrl || '',
            description: game.description || '',
            targetYear: game.targetYear || ''
        });
        setIsEditing(true);
        setEditingId(game.id);
        
        // Scroll hacia el formulario
        document.querySelector('form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleCancelEdit = () => {
        setForm({ title: '', platform: 'PC', pcStore: '', status: 'Backlog', rating: 0, imageUrl: '', description: '', targetYear: '' });
        setIsEditing(false);
        setEditingId(null);
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

    // Generar años para el selector
    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear - 10; year <= currentYear + 10; year++) {
            years.push(year);
        }
        return years;
    };

    // Obtener label dinámico según el estado
    const getYearLabel = (status) => {
        switch (status) {
            case 'Completado': return 'Año de completado';
            case 'Backlog': return 'Año objetivo para jugar';
            case 'Jugando': return 'Año de inicio';
            default: return 'Año';
        }
    };

    // Verificar si el campo año debe estar deshabilitado
    const isYearDisabled = (status) => {
        return status === 'Jugando';
    };

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
                        {/* Header del formulario con modo */}
                        {isEditing && (
                            <div className="bg-blue-900 border border-blue-600 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-blue-300 text-xl">✏️</span>
                                        <div>
                                            <h3 className="text-lg font-bold text-blue-100">Modo Edición</h3>
                                            <p className="text-sm text-blue-300">Modificando: {form.title}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

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
                                        onChange={e => {
                                            setForm({ 
                                                ...form, 
                                                platform: e.target.value,
                                                // Limpiar pcStore si no es PC
                                                pcStore: e.target.value === 'PC' ? form.pcStore : ''
                                            });
                                        }}
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
                                    <div className="flex flex-col w-1/3">
                                        <label className="text-xs text-gray-400 mb-1">Calificación</label>
                                        <input
                                            type="number"
                                            placeholder="Ej: 8.5"
                                            className="p-2 rounded bg-gray-700 text-white"
                                            max="10"
                                            min="0"
                                            step="0.1"
                                            value={form.rating}
                                            onChange={e => {
                                                const value = e.target.value;
                                                // Validar que no exceda 10 y tenga máximo 1 decimal
                                                if (value === '' || (parseFloat(value) <= 10 && /^\d+\.?\d{0,1}$/.test(value))) {
                                                    setForm({ ...form, rating: value });
                                                }
                                            }}
                                        />
                                        {form.rating && (
                                            <div className="text-xs mt-1 text-center">
                                                <span className={`${
                                                    form.rating >= 8 ? 'text-green-400' :
                                                    form.rating >= 6 ? 'text-yellow-400' :
                                                    form.rating >= 4 ? 'text-orange-400' :
                                                    'text-red-400'
                                                }`}>
                                                    {form.rating >= 9 ? '🌟 Excelente' :
                                                     form.rating >= 8 ? '✨ Muy Bueno' :
                                                     form.rating >= 7 ? '👍 Bueno' :
                                                     form.rating >= 6 ? '👌 Aceptable' :
                                                     form.rating >= 4 ? '😐 Regular' : '👎 Malo'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Selector de tienda PC - solo si la plataforma es PC */}
                                {form.platform === 'PC' && (
                                    <div className="flex flex-col">
                                        <label className="text-sm text-gray-400 mb-1">
                                            🛒 Tienda o Plataforma de PC
                                        </label>
                                        <select
                                            className="p-2 rounded bg-gray-700 text-white w-full"
                                            value={form.pcStore}
                                            onChange={e => setForm({ ...form, pcStore: e.target.value })}
                                        >
                                            <option value="">Selecciona la tienda</option>
                                            <option value="Steam">🔥 Steam</option>
                                            <option value="Epic Games">🎮 Epic Games Store</option>
                                            <option value="GOG">🌟 GOG</option>
                                            <option value="Origin/EA">🎯 Origin / EA App</option>
                                            <option value="Ubisoft Connect">🏛️ Ubisoft Connect</option>
                                            <option value="Battle.net">⚔️ Battle.net</option>
                                            <option value="Microsoft Store">🏪 Microsoft Store</option>
                                            <option value="Game Pass">🎮 Xbox Game Pass</option>
                                            <option value="Itch.io">🎨 Itch.io</option>
                                            <option value="Otra">🔧 Otra</option>
                                        </select>
                                    </div>
                                )}

                                {/* Selector de año dinámico */}
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-400 mb-1">
                                        {getYearLabel(form.status)}
                                        {form.status === 'Jugando' && (
                                            <span className="ml-2 text-xs text-yellow-400">(Automático: {new Date().getFullYear()})</span>
                                        )}
                                    </label>
                                    <select
                                        className={`p-2 rounded w-full ${isYearDisabled(form.status)
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-700 text-white'
                                            }`}
                                        value={isYearDisabled(form.status) ? new Date().getFullYear() : form.targetYear}
                                        onChange={e => !isYearDisabled(form.status) && setForm({ ...form, targetYear: e.target.value })}
                                        disabled={isYearDisabled(form.status)}
                                    >
                                        <option value="">
                                            {form.status === 'Completado' ? 'Selecciona año de completado' : 'Selecciona año objetivo'}
                                        </option>
                                        {generateYearOptions().map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        type="submit" 
                                        className={`flex-1 py-3 rounded font-bold transition ${
                                            isEditing 
                                                ? 'bg-green-600 hover:bg-green-500' 
                                                : 'bg-blue-600 hover:bg-blue-500'
                                        }`}
                                    >
                                        {isEditing ? '✏️ Actualizar Juego' : '➕ Agregar Juego'}
                                    </button>
                                    
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded font-bold transition"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
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
                                    onEdit={handleEditGame}
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
                            {selectedGame.platform === 'PC' && selectedGame.pcStore && (
                                <div>
                                    <span className="text-gray-400">Tienda:</span>
                                    <p className="text-white font-semibold flex items-center gap-2">
                                        <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                                            🛒 {selectedGame.pcStore}
                                        </span>
                                    </p>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-400">Estado:</span>
                                <p className="text-white font-semibold">{selectedGame.status}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Puntuación:</span>
                                <p className="text-white font-semibold flex items-center gap-2">
                                    {selectedGame.rating > 0 ? (
                                        <>
                                            <span className="text-yellow-400">⭐</span>
                                            <span>{Number(selectedGame.rating).toFixed(1)}/10</span>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                selectedGame.rating >= 8 ? 'bg-green-600 text-white' :
                                                selectedGame.rating >= 6 ? 'bg-yellow-600 text-white' :
                                                selectedGame.rating >= 4 ? 'bg-orange-600 text-white' :
                                                'bg-red-600 text-white'
                                            }`}>
                                                {selectedGame.rating >= 9 ? 'Excelente' :
                                                 selectedGame.rating >= 8 ? 'Muy Bueno' :
                                                 selectedGame.rating >= 7 ? 'Bueno' :
                                                 selectedGame.rating >= 6 ? 'Aceptable' :
                                                 selectedGame.rating >= 4 ? 'Regular' : 'Malo'}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-gray-500">Sin puntuar</span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-400">Agregado:</span>
                                <p className="text-white font-semibold">
                                    {new Date(selectedGame.createdAt).toLocaleDateString('es-ES')}
                                </p>
                            </div>
                            {selectedGame.targetYear && (
                                <div className="col-span-2">
                                    <span className="text-gray-400">
                                        {selectedGame.status === 'Completado' ? 'Año de completado:' : 'Año objetivo:'}
                                    </span>
                                    <p className="text-white font-semibold flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm ${selectedGame.status === 'Completado'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-blue-600 text-white'
                                            }`}>
                                            {selectedGame.status === 'Completado' ? '✅' : '🎯'} {selectedGame.targetYear}
                                        </span>
                                    </p>
                                </div>
                            )}
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