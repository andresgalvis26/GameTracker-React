import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GameCard from './components/GameCard';
import Modal from './components/Modal';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Statistics from './components/Statistics';
import Swal from 'sweetalert2';

function App() {
    // Estado de autenticación
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    const [games, setGames] = useState([]);
    const [form, setForm] = useState({ title: '', platform: '', pcStore: '', status: '', rating: '', imageUrl: '', description: '', targetYear: '', replayable: false });
    const [selectedGame, setSelectedGame] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // Estados para filtros
    const [filters, setFilters] = useState({
        status: '',
        platform: '',
        pcStore: '',
        minRating: '',
        maxRating: '',
        year: '',
        replayable: '',
        searchText: ''
    });
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [activeView, setActiveView] = useState('collection'); // 'collection' or 'statistics'

    const fetchGames = async () => {
        // const res = await axios.get('http://localhost:3000/games');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/games`);
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
                await axios.put(`${import.meta.env.VITE_API_URL}/games/${editingId}`, form);

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
                await axios.post(`${import.meta.env.VITE_API_URL}/games`, form);

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
            setIsFormModalOpen(false);
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
                await axios.delete(`${import.meta.env.VITE_API_URL}/games/${id}`);
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
            targetYear: game.targetYear || '',
            replayable: game.replayable || false
        });
        setIsEditing(true);
        setEditingId(game.id);
        setIsFormModalOpen(true);
    };

    const handleCancelEdit = () => {
        setForm({ title: '', platform: 'PC', pcStore: '', status: 'Backlog', rating: 0, imageUrl: '', description: '', targetYear: '', replayable: false });
        setIsEditing(false);
        setEditingId(null);
        setIsFormModalOpen(false);
    };

    const handleOpenFormModal = () => {
        setForm({ title: '', platform: 'PC', pcStore: '', status: 'Backlog', rating: 0, imageUrl: '', description: '', targetYear: '', replayable: false });
        setIsEditing(false);
        setEditingId(null);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setForm({ title: '', platform: 'PC', pcStore: '', status: 'Backlog', rating: 0, imageUrl: '', description: '', targetYear: '', replayable: false });
        setIsEditing(false);
        setEditingId(null);
        setIsFormModalOpen(false);
    };

    // Función para filtrar y ordenar juegos
    const getFilteredAndSortedGames = () => {
        let filteredGames = games.filter(game => {
            // Filtro por estado
            if (filters.status && game.status !== filters.status) return false;
            
            // Filtro por plataforma
            if (filters.platform && game.platform !== filters.platform) return false;
            
            // Filtro por tienda PC
            if (filters.pcStore && game.pcStore !== filters.pcStore) return false;
            
            // Filtro por rating mínimo
            if (filters.minRating && (!game.rating || game.rating < parseFloat(filters.minRating))) return false;
            
            // Filtro por rating máximo
            if (filters.maxRating && (!game.rating || game.rating > parseFloat(filters.maxRating))) return false;
            
            // Filtro por año
            if (filters.year && (!game.targetYear || game.targetYear.toString() !== filters.year)) return false;
            
            // Filtro por rejugabilidad (solo para juegos completados)
            if (filters.replayable === 'true' && (!game.replayable || game.status !== 'Completado')) return false;
            if (filters.replayable === 'false' && (game.replayable || game.status !== 'Completado')) return false;
            
            // Filtro por texto (título y descripción)
            if (filters.searchText) {
                const searchLower = filters.searchText.toLowerCase();
                const titleMatch = game.title.toLowerCase().includes(searchLower);
                const descMatch = game.description ? game.description.toLowerCase().includes(searchLower) : false;
                if (!titleMatch && !descMatch) return false;
            }
            
            return true;
        });

        // Ordenamiento
        filteredGames.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'rating':
                    aValue = a.rating || 0;
                    bValue = b.rating || 0;
                    break;
                case 'platform':
                    aValue = a.platform;
                    bValue = b.platform;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'targetYear':
                    aValue = a.targetYear || 0;
                    bValue = b.targetYear || 0;
                    break;
                default: // 'createdAt'
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filteredGames;
    };

    const filteredGames = getFilteredAndSortedGames();

    // Función para obtener juegos de la página actual
    const getCurrentPageGames = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredGames.slice(startIndex, endIndex);
    };

    const currentPageGames = getCurrentPageGames();
    const totalPages = Math.ceil(filteredGames.length / itemsPerPage);

    // Reset página cuando cambian los filtros
    const resetToFirstPage = () => {
        setCurrentPage(1);
    };

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, sortBy, sortOrder]);

    // Funciones de autenticación
    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        // Limpiar datos al cerrar sesión
        setGames([]);
        setForm({ title: '', platform: '', pcStore: '', status: '', rating: '', imageUrl: '', description: '', targetYear: '', replayable: false });
        setSelectedGame(null);
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingId(null);
        setIsFormModalOpen(false);
        setFilters({
            status: '',
            platform: '',
            pcStore: '',
            minRating: '',
            maxRating: '',
            year: '',
            replayable: '',
            searchText: ''
        });
        setCurrentPage(1);
        setActiveView('collection');
    };

    // Función para limpiar todos los filtros
    const clearAllFilters = () => {
        setFilters({
            status: '',
            platform: '',
            pcStore: '',
            minRating: '',
            maxRating: '',
            year: '',
            replayable: '',
            searchText: ''
        });
        setSortBy('createdAt');
        setSortOrder('desc');
        setCurrentPage(1);
        setActiveView('collection');
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

    // Si no está autenticado, mostrar login
    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Navbar */}
            <Navbar
                totalGames={stats.total}
                gamesCompleted={stats.completed}
                gamesPlaying={stats.playing}
                gamesBacklog={stats.backlog}
                onLogout={handleLogout}
            />

            {/* Navegación por tabs */}
            <div className="bg-gray-800 border-b border-gray-700 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto">
                    <div className="flex">
                        <button
                            onClick={() => {
                                setActiveView('collection');
                                setCurrentPage(1);
                            }}
                            className={`px-6 py-4 font-semibold text-sm transition-colors relative ${
                                activeView === 'collection'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            🎮 Mi Colección
                        </button>
                        <button
                            onClick={() => setActiveView('statistics')}
                            className={`px-6 py-4 font-semibold text-sm transition-colors relative ${
                                activeView === 'statistics'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            📊 Estadísticas
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="text-white p-6 sm:p-8 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    {activeView === 'collection' ? (
                        <>
                            {/* Vista de Colección */}
                            {/* Botón para abrir formulario */}
                            <div className="flex justify-center mb-10">
                        <button
                            onClick={handleOpenFormModal}
                            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 flex items-center gap-3"
                        >
                            <span className="text-2xl">➕</span>
                            <span>Agregar Nuevo Juego</span>
                        </button>
                    </div>

                    {/* Modal del formulario */}
                    <Modal
                        isOpen={isFormModalOpen}
                        onClose={handleCloseFormModal}
                        title={isEditing ? `✏️ Editando: ${form.title}` : '🎮 Agregar Nuevo Juego'}
                        showFooter={false}
                    >
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    className="p-2 rounded bg-gray-700 text-white w-full h-32 resize-none"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <select
                                        className={`p-2 rounded w-1/2 ${!form.platform ? 'text-gray-400' : 'text-white'} bg-gray-700`}
                                        value={form.platform}
                                        onChange={e => {
                                            setForm({
                                                ...form,
                                                platform: e.target.value,
                                                // Limpiar pcStore si no es PC
                                                pcStore: e.target.value === 'PC' ? form.pcStore : ''
                                            });
                                        }}
                                        required
                                    >
                                        <option value="" disabled className="text-gray-400">
                                            Selecciona plataforma
                                        </option>
                                        <option value="PC" className="text-white">PC</option>
                                        <option value="Switch" className="text-white">Switch</option>
                                        <option value="PS5" className="text-white">PS5</option>
                                        <option value="PS4" className="text-white">PS4</option>
                                        <option value="Xbox One" className="text-white">Xbox One</option>
                                        <option value="Xbox 360" className="text-white">Xbox 360</option>
                                        <option value="Otra plataforma" className="text-white">Otra plataforma</option>
                                    </select>
                                    <select
                                        className={`p-2 rounded w-1/2 ${!form.status ? 'text-gray-400' : 'text-white'} bg-gray-700`}
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled className="text-gray-400">
                                            Selecciona estado
                                        </option>
                                        <option value="Backlog" className="text-white">Backlog</option>
                                        <option value="Jugando" className="text-white">Jugando</option>
                                        <option value="Completado" className="text-white">Completado</option>
                                    </select>
                                </div>
                                <div className="flex flex-col w-1/2">
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
                                            <span className={`${form.rating >= 8 ? 'text-green-400' :
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

                                {/* Checkbox Rejugable - Solo aparece cuando está Completado */}
                                {form.status === 'Completado' && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id="replayable"
                                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-gray-900"
                                            checked={form.replayable}
                                            onChange={(e) => setForm({ ...form, replayable: e.target.checked })}
                                        />
                                        <label htmlFor="replayable" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                            🔄 Lo volvería a jugar
                                            <span className="text-xs text-gray-400">(Marca si vale la pena rejugarlo)</span>
                                        </label>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className={`flex-1 py-3 rounded font-bold transition ${isEditing
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
                        </form>
                    </Modal>

                    {/* Sección de Filtros y Búsqueda */}
                    <div className="max-w-7xl mx-auto mb-8">
                        {/* Header de filtros */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-white">🔍 Filtros y Búsqueda</h2>
                                <span className="text-sm text-gray-400">
                                    {filteredGames.length} de {games.length} juegos
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={clearAllFilters}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors"
                                >
                                    🗑️ Limpiar
                                </button>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
                                >
                                    {showFilters ? '👆 Ocultar' : '👇 Mostrar'} Filtros
                                </button>
                            </div>
                        </div>

                        {/* Barra de búsqueda - Siempre visible */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="🔍 Buscar juegos por título o descripción..."
                                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                                value={filters.searchText}
                                onChange={(e) => {
                                    setFilters({ ...filters, searchText: e.target.value });
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* Panel de filtros expandible */}
                        {showFilters && (
                            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                                {/* Primera fila: Estado, Plataforma, Ordenar */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">📊 Estado</label>
                                        <select
                                            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                                            value={filters.status}
                                            onChange={(e) => {
                                                setFilters({ ...filters, status: e.target.value });
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">Todos los estados</option>
                                            <option value="Backlog">📚 Backlog</option>
                                            <option value="Jugando">🎮 Jugando</option>
                                            <option value="Completado">✅ Completado</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">🖥️ Plataforma</label>
                                        <select
                                            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                                            value={filters.platform}
                                            onChange={(e) => {
                                                setFilters({ ...filters, platform: e.target.value, pcStore: e.target.value === 'PC' ? filters.pcStore : '' });
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">Todas las plataformas</option>
                                            <option value="PC">💻 PC</option>
                                            <option value="Switch">🎮 Switch</option>
                                            <option value="PS5">🎯 PS5</option>
                                            <option value="PS4">🎯 PS4</option>
                                            <option value="Xbox One">🟢 Xbox One</option>
                                            <option value="Xbox 360">🟢 Xbox 360</option>
                                            <option value="Otra plataforma">🔧 Otra plataforma</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">🔄 Ordenar por</label>
                                        <div className="flex gap-2">
                                            <select
                                                className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                            >
                                                <option value="createdAt">📅 Fecha agregado</option>
                                                <option value="title">🔤 Nombre</option>
                                                <option value="rating">⭐ Puntuación</option>
                                                <option value="platform">🖥️ Plataforma</option>
                                                <option value="status">📊 Estado</option>
                                                <option value="targetYear">📅 Año</option>
                                            </select>
                                            <button
                                                onClick={() => {
                                                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                                    setCurrentPage(1);
                                                }}
                                                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded border border-gray-600 transition-colors"
                                                title={sortOrder === 'asc' ? 'Cambiar a descendente' : 'Cambiar a ascendente'}
                                            >
                                                {sortOrder === 'asc' ? '⬆️' : '⬇️'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Segunda fila: Tienda PC (condicional), Puntuación */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {filters.platform === 'PC' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">🛒 Tienda PC</label>
                                            <select
                                                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                                                value={filters.pcStore}
                                                onChange={(e) => {
                                                    setFilters({ ...filters, pcStore: e.target.value });
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                <option value="">Todas las tiendas</option>
                                                <option value="Steam">🔥 Steam</option>
                                                <option value="Epic Games">🎮 Epic Games</option>
                                                <option value="GOG">🌟 GOG</option>
                                                <option value="Origin/EA">🎯 Origin/EA</option>
                                                <option value="Ubisoft Connect">🏛️ Ubisoft Connect</option>
                                                <option value="Battle.net">⚔️ Battle.net</option>
                                                <option value="Microsoft Store">🏪 Microsoft Store</option>
                                                <option value="Game Pass">🎮 Game Pass</option>
                                                <option value="Itch.io">🎨 Itch.io</option>
                                                <option value="Otra">🔧 Otra</option>
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">⭐ Puntuación mínima</label>
                                        <select
                                            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                                            value={filters.minRating}
                                            onChange={(e) => {
                                                setFilters({ ...filters, minRating: e.target.value });
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">Sin mínimo</option>
                                            <option value="1">⭐ 1+ (Cualquiera)</option>
                                            <option value="4">🟡 4+ (Regular+)</option>
                                            <option value="6">🟢 6+ (Aceptable+)</option>
                                            <option value="7">💚 7+ (Bueno+)</option>
                                            <option value="8">✨ 8+ (Muy Bueno+)</option>
                                            <option value="9">🌟 9+ (Excelente)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">⭐ Puntuación máxima</label>
                                        <select
                                            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                                            value={filters.maxRating}
                                            onChange={(e) => {
                                                setFilters({ ...filters, maxRating: e.target.value });
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">Sin máximo</option>
                                            <option value="4">🔴 4- (Regular-)</option>
                                            <option value="6">🟡 6- (Aceptable-)</option>
                                            <option value="7">🟢 7- (Bueno-)</option>
                                            <option value="8">💚 8- (Muy Bueno-)</option>
                                            <option value="9">✨ 9- (Casi perfecto)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Tercera fila: Año, Rejugabilidad */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">📅 Año</label>
                                        <select
                                            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                                            value={filters.year}
                                            onChange={(e) => {
                                                setFilters({ ...filters, year: e.target.value });
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">Todos los años</option>
                                            {generateYearOptions().reverse().map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">🔄 Rejugabilidad</label>
                                        <select
                                            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                                            value={filters.replayable}
                                            onChange={(e) => {
                                                setFilters({ ...filters, replayable: e.target.value });
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">Todos</option>
                                            <option value="true">✅ Vale la pena rejugar</option>
                                            <option value="false">❌ No rejugable</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Grid de Cards */}
                    {games.length > 0 ? (
                        filteredGames.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {currentPageGames.map(game => (
                                        <GameCard
                                            key={game.id}
                                            game={game}
                                            onDelete={(id) => handleDelete(id, game.title)}
                                            onClick={() => handleGameClick(game)}
                                            onEdit={handleEditGame}
                                        />
                                    ))}
                                </div>

                                {/* Paginación */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center mt-12 space-x-2">
                                        {/* Botón Anterior */}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                currentPage === 1
                                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-700 text-white hover:bg-gray-600'
                                            }`}
                                        >
                                            ← Anterior
                                        </button>

                                        {/* Números de página */}
                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(pageNum => {
                                                    // Mostrar siempre la primera, última y 2 alrededor de la actual
                                                    return pageNum === 1 || 
                                                           pageNum === totalPages || 
                                                           Math.abs(pageNum - currentPage) <= 1;
                                                })
                                                .map((pageNum, index, array) => {
                                                    // Verificar si necesita puntos suspensivos
                                                    const prevPageNum = array[index - 1];
                                                    const needsEllipsis = prevPageNum && pageNum - prevPageNum > 1;
                                                    
                                                    return (
                                                        <React.Fragment key={pageNum}>
                                                            {needsEllipsis && (
                                                                <span className="px-3 py-2 text-gray-400">…</span>
                                                            )}
                                                            <button
                                                                onClick={() => setCurrentPage(pageNum)}
                                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                                    currentPage === pageNum
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                                                                }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        </React.Fragment>
                                                    );
                                                })
                                            }
                                        </div>

                                        {/* Botón Siguiente */}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                currentPage === totalPages
                                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-700 text-white hover:bg-gray-600'
                                            }`}
                                        >
                                            Siguiente →
                                        </button>
                                    </div>
                                )}

                                {/* Info de página */}
                                <div className="text-center mt-6 text-sm text-gray-400">
                                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredGames.length)} de {filteredGames.length} juegos
                                    {totalPages > 1 && ` (Página ${currentPage} de ${totalPages})`}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <div className="text-4xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-400 mb-2">No se encontraron juegos</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-4">
                                    No hay juegos que coincidan con los filtros aplicados.
                                </p>
                                <button
                                    onClick={clearAllFilters}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                                >
                                    🗑️ Limpiar filtros
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🎮</div>
                            <h3 className="text-2xl font-bold text-gray-400 mb-2">Tu colección está vacía</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                ¡Comienza agregando tu primer juego usando el botón de arriba!
                            </p>
                        </div>
                    )}
                        </>
                    ) : (
                        /* Vista de Estadísticas */
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">📊 Estadísticas de tu Colección</h2>
                                <p className="text-gray-400">Analiza tus patrones de juego y progreso</p>
                            </div>
                            
                            {games.length > 0 ? (
                                <Statistics games={games} />
                            ) : (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">📊</div>
                                    <h3 className="text-2xl font-bold text-gray-400 mb-2">No hay datos para mostrar</h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        Agrega algunos juegos a tu colección para ver estadísticas detalladas.
                                    </p>
                                    <button
                                        onClick={() => setActiveView('collection')}
                                        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                                    >
                                        🎮 Ir a Mi Colección
                                    </button>
                                </div>
                            )}
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
                                            <span className={`px-2 py-1 rounded text-xs ${selectedGame.rating >= 8 ? 'bg-green-600 text-white' :
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