import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { authApi } from '../services/api';

const Login = ({ onLogin }) => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await authApi.login(credentials);

            const token = res.data && (res.data.token || res.data.accessToken || res.data?.token);
            if (!token) throw new Error('No se recibió token del servidor');

            onLogin(token);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Error al iniciar sesión';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Limpiar error al escribir
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                        <span className="text-3xl font-bold text-white">🎮</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Game Tracker</h1>
                    <p className="text-blue-200">Tu colección personal de videojuegos</p>
                </div>

                {/* Formulario de Login */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
                    <h2 className="text-2xl font-bold text-white text-center mb-6">Iniciar Sesión</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-gray-200 mb-2">
                                👤 Usuario
                            </label>
                            <input
                                type="email"
                                id="login-email"
                                name="email"
                                value={credentials.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-gray-300/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                                placeholder="Ingresa tu email"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-gray-200 mb-2">
                                🔒 Contraseña
                            </label>
                            <input
                                type="password"
                                id="login-password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-gray-300/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                                placeholder="Ingresa tu contraseña"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                                ❌ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 ${
                                isLoading 
                                    ? 'bg-gray-600 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/25'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Iniciando sesión...
                                </div>
                            ) : (
                                '🚀 Entrar'
                            )}
                        </button>
                    </form>

                    {/* Credenciales de prueba eliminadas — use su cuenta real */}
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-gray-400 text-sm">
                        © 2026 Game Tracker. Hecho con ❤️ para gamers.
                    </p>
                </div>
            </div>
        </div>
    );
};

Login.propTypes = {
    onLogin: PropTypes.func.isRequired,
};

export default Login;
