import React from 'react';
import PropTypes from 'prop-types';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart,
    RadialBarChart, RadialBar
} from 'recharts';

// Tooltip personalizado
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
                <p className="text-white font-medium">{`${label}`}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }}>
                        {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'rating' ? '/10' : ''}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Componente para estadística destacada
const StatCard = ({ title, value, subtitle, icon, gradient, trend }) => (
    <div className={`${gradient} rounded-xl p-6 text-white relative overflow-hidden`}>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-white/80 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                    {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
                </div>
                <div className="text-4xl opacity-80">{icon}</div>
            </div>
            {trend && (
                <div className="mt-3">
                    <p className="text-white/80 text-xs">{trend}</p>
                </div>
            )}
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
    </div>
);

// Agregar PropTypes para CustomTooltip
CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.string,
};

// Agregar PropTypes para StatCard
StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    icon: PropTypes.string.isRequired,
    gradient: PropTypes.string.isRequired,
    trend: PropTypes.string,
};

const Statistics = ({ games }) => {
    // Colores para los gráficos
    const PLATFORM_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#EC4899'];
    const STATUS_COLORS = ['#F59E0B', '#10B981', '#6B7280'];
    const RATING_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981'];

    // Calcular datos para gráfico de plataformas
    const platformData = games.reduce((acc, game) => {
        const platform = game.platform || 'Sin especificar';
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
    }, {});

    const platformChartData = Object.entries(platformData)
        .map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / games.length) * 100)
        }))
        .sort((a, b) => b.count - a.count);

    // Calcular datos para gráfico de estados
    const statusData = games.reduce((acc, game) => {
        const status = game.status || 'Sin especificar';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const statusChartData = Object.entries(statusData).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / games.length) * 100)
    }));

    // Calcular datos para rating promedio por plataforma
    const ratingByPlatform = games.reduce((acc, game) => {
        if (game.rating && game.platform) {
            if (!acc[game.platform]) {
                acc[game.platform] = { total: 0, count: 0 };
            }
            acc[game.platform].total += parseFloat(game.rating);
            acc[game.platform].count += 1;
        }
        return acc;
    }, {});

    const ratingChartData = Object.entries(ratingByPlatform)
        .map(([platform, data]) => ({
            platform,
            rating: Math.round((data.total / data.count) * 10) / 10,
            games: data.count
        }))
        .sort((a, b) => b.rating - a.rating);

    // Distribución de ratings por rangos
    const ratingDistribution = games.reduce((acc, game) => {
        if (game.rating) {
            const rating = parseFloat(game.rating);
            if (rating >= 9) acc['9-10 ⭐'] = (acc['9-10 ⭐'] || 0) + 1;
            else if (rating >= 8) acc['8-9 ⭐'] = (acc['8-9 ⭐'] || 0) + 1;
            else if (rating >= 7) acc['7-8 ⭐'] = (acc['7-8 ⭐'] || 0) + 1;
            else if (rating >= 6) acc['6-7 ⭐'] = (acc['6-7 ⭐'] || 0) + 1;
            else acc['1-6 ⭐'] = (acc['1-6 ⭐'] || 0) + 1;
        }
        return acc;
    }, {});

    const ratingDistributionData = Object.entries(ratingDistribution).map(([range, count]) => ({
        range,
        count,
        percentage: Math.round((count / games.filter(g => g.rating).length) * 100)
    }));

    // Calcular juegos agregados por mes (últimos 8 meses)
    const monthlyData = games.reduce((acc, game) => {
        const date = new Date(game.createdAt);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
    }, {});

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const last8Months = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthName = monthNames[date.getMonth()];
        const year = date.getFullYear();
        last8Months.push({
            month: `${monthName} '${year.toString().slice(2)}`,
            games: monthlyData[monthKey] || 0
        });
    }

    // Top 5 juegos mejor puntuados
    const topRatedGames = games
        .filter(game => game.rating && game.rating > 0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(game => ({
            title: game.title.length > 20 ? game.title.substring(0, 20) + '...' : game.title,
            fullTitle: game.title,
            rating: game.rating,
            platform: game.platform
        }));

    // Estadísticas por tienda PC
    const pcStoreData = games
        .filter(game => game.platform === 'PC' && game.pcStore)
        .reduce((acc, game) => {
            acc[game.pcStore] = (acc[game.pcStore] || 0) + 1;
            return acc;
        }, {});

    const pcStoreChartData = Object.entries(pcStoreData)
        .map(([store, count]) => ({
            store,
            count,
            percentage: Math.round((count / games.filter(g => g.platform === 'PC').length) * 100)
        }))
        .sort((a, b) => b.count - a.count);

    // Calcular estadísticas generales
    const totalGames = games.length;
    const averageRating = games.filter(g => g.rating).reduce((sum, g) => sum + parseFloat(g.rating), 0) / games.filter(g => g.rating).length || 0;
    const completionRate = games.filter(g => g.status === 'Completado').length / totalGames * 100;
    const replayableGames = games.filter(g => g.replayable && g.status === 'Completado').length;
    const totalCompletedGames = games.filter(g => g.status === 'Completado').length;
    const replayabilityRate = totalCompletedGames > 0 ? (replayableGames / totalCompletedGames * 100) : 0;
    
    // Tiempo de backlog (estimación)
    const backlogGames = games.filter(g => g.status === 'Backlog').length;
    const avgGamesPerMonth = last8Months.reduce((sum, month) => sum + month.games, 0) / 8;
    const estimatedBacklogMonths = avgGamesPerMonth > 0 ? Math.ceil(backlogGames / avgGamesPerMonth) : 0;

    return (
        <div className="space-y-8">
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Promedio General"
                    value={`${averageRating.toFixed(1)}/10`}
                    subtitle="Calificación promedio"
                    icon="⭐"
                    gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
                />
                
                <StatCard 
                    title="Tasa de Completado"
                    value={`${completionRate.toFixed(1)}%`}
                    subtitle={`${games.filter(g => g.status === 'Completado').length} de ${totalGames} juegos`}
                    icon="✅"
                    gradient="bg-gradient-to-br from-green-500 to-emerald-600"
                />
                
                <StatCard 
                    title="Rejugabilidad"
                    value={`${replayabilityRate.toFixed(0)}%`}
                    subtitle={`${replayableGames} de ${totalCompletedGames} completados`}
                    icon="🔄"
                    gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
                />
                
                <StatCard 
                    title="Tiempo Backlog"
                    value={estimatedBacklogMonths > 0 ? `~${estimatedBacklogMonths}m` : 'N/A'}
                    subtitle={`${backlogGames} juegos pendientes`}
                    icon="📚"
                    gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
                    trend={avgGamesPerMonth > 0 ? `${avgGamesPerMonth.toFixed(1)} juegos/mes promedio` : 'Sin datos suficientes'}
                />
            </div>

            {/* Gráficos principales en dos columnas */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Distribución por Plataformas */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        🖥️ Distribución por Plataformas
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={platformChartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                                label={({name, percentage}) => `${name} (${percentage}%)`}
                                labelLine={false}
                            >
                                {platformChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Distribución por Estados */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        📊 Estado de la Colección
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#3B82F6">
                                {statusChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráficos secundarios */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Distribución de Ratings */}
                {ratingDistributionData.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            ⭐ Distribución de Calificaciones
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ratingDistributionData} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis dataKey="range" type="category" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]}>
                                    {ratingDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={RATING_COLORS[index]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Juegos Agregados por Mes */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        📈 Actividad Mensual (Últimos 8 meses)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={last8Months} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorGames" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="games" 
                                stroke="#3B82F6" 
                                fillOpacity={1} 
                                fill="url(#colorGames)"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Estadísticas adicionales */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Rating Promedio por Plataforma */}
                {ratingChartData.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            🏆 Rating Promedio por Plataforma
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ratingChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="platform" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis domain={[0, 10]} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="rating" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Distribución tiendas PC */}
                {pcStoreChartData.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            🛒 Tiendas PC Favoritas
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pcStoreChartData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    label={({store, percentage}) => `${store} (${percentage}%)`}
                                >
                                    {pcStoreChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Top Juegos */}
            {topRatedGames.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        🌟 Top 5 Juegos Mejor Puntuados
                    </h3>
                    <div className="space-y-4">
                        {topRatedGames.map((game, index) => (
                            <div key={index} className="flex items-center justify-between bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg p-4 hover:from-gray-600 hover:to-gray-500 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' : 
                                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold" title={game.fullTitle}>{game.title}</p>
                                        <p className="text-gray-300 text-sm flex items-center gap-2">
                                            <span className="bg-gray-600 px-2 py-1 rounded text-xs">{game.platform}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-400 text-lg">⭐</span>
                                    <span className="text-white font-bold text-xl">{game.rating}</span>
                                    <span className="text-gray-400">/10</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Insights y recomendaciones */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-6 border border-indigo-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    💡 Insights de tu Colección
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/20 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-200 mb-2">📊 Análisis de Actividad</h4>
                        <p className="text-indigo-100 text-sm leading-relaxed">
                            {avgGamesPerMonth > 0 ? (
                                `Agregas aproximadamente ${avgGamesPerMonth.toFixed(1)} juegos por mes. 
                                ${backlogGames > 0 ? `Con tu backlog actual, te tomará unos ${estimatedBacklogMonths} meses terminarlo.` : 'No tienes backlog pendiente.'}`
                            ) : (
                                'Agrega más juegos para obtener análisis de tu actividad.'
                            )}
                        </p>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-200 mb-2">🎯 Recomendaciones</h4>
                        <p className="text-indigo-100 text-sm leading-relaxed">
                            {replayabilityRate < 30 ? 
                                'Considera buscar juegos con mayor valor de replay para maximizar tu inversión.' :
                                replayabilityRate > 70 ?
                                '¡Excelente! Tienes buen ojo para juegos con alta rejugabilidad.' :
                                'Tienes un buen balance entre juegos únicos y rejugables.'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

Statistics.propTypes = {
    games: PropTypes.array.isRequired,
};

export default Statistics;