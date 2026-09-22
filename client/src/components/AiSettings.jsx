import { useState } from 'react';
import PropTypes from 'prop-types';
import { AI_PRESETS } from '../constants/aiOptions';
import { listModels } from '../services/aiService';

const AiSettings = ({ settings, onChange }) => {
    const [showKey, setShowKey] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState(null);

    const connect = async () => {
        if (!settings.baseUrl.trim() || !settings.apiKey.trim()) {
            setStatus({ type: 'error', message: 'Introduce la URL base y la API Key.' });
            return;
        }
        setIsConnecting(true);
        setStatus(null);
        try {
            const models = await listModels({ baseUrl: settings.baseUrl, apiKey: settings.apiKey });
            const model = models.some((entry) => entry.id === settings.model) ? settings.model : models[0]?.id || '';
            onChange({ models, model });
            const freeCount = models.filter((entry) => entry.free).length;
            const paidCount = models.length - freeCount;
            setStatus({ type: 'success', message: `Conectado. ${models.length} modelos: ${freeCount} gratis y ${paidCount} de pago.` });
        } catch (error) {
            setStatus({ type: 'error', message: error.message || 'No se pudo conectar.' });
        } finally {
            setIsConnecting(false);
        }
    };

    return <div className="space-y-6 p-5 sm:p-7">
        <section>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Conexión</p>
            <p className="mt-2 text-sm text-gray-400">Compatible con cualquier API tipo OpenAI (OpenAI, OpenRouter, Groq, LM Studio local...). La clave se guarda solo en este navegador.</p>
            <div className="mt-4 flex flex-wrap gap-2">
                {AI_PRESETS.map((preset) => <button key={preset.label} type="button" onClick={() => onChange({ baseUrl: preset.baseUrl })} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${settings.baseUrl === preset.baseUrl ? 'border-blue-400 bg-blue-500/15 text-blue-200' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'}`}>{preset.label}</button>)}
            </div>
            <div className="mt-4 space-y-4">
                <label htmlFor="ai-base-url" className="block text-sm font-medium text-gray-300">URL base
                    <input id="ai-base-url" type="url" value={settings.baseUrl} onChange={(event) => onChange({ baseUrl: event.target.value })} placeholder="https://api.openai.com/v1" className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white" />
                </label>
                <label htmlFor="ai-api-key" className="block text-sm font-medium text-gray-300">API Key
                    <span className="relative mt-1 block">
                        <input id="ai-api-key" type={showKey ? 'text' : 'password'} value={settings.apiKey} onChange={(event) => onChange({ apiKey: event.target.value })} placeholder="sk-..." autoComplete="off" className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 pr-16 text-white" />
                        <button type="button" onClick={() => setShowKey((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-gray-400 hover:text-white">{showKey ? 'Ocultar' : 'Ver'}</button>
                    </span>
                </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button type="button" onClick={connect} disabled={isConnecting} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50">{isConnecting ? 'Conectando...' : 'Conectar y listar modelos'}</button>
                {status && <p role="status" className={`text-sm ${status.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>{status.message}</p>}
            </div>
        </section>
        <section className="border-t border-gray-800 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Modelo</p>
            <label htmlFor="ai-model" className="mt-3 block text-sm font-medium text-gray-300">Modelo seleccionado <span className="font-normal text-gray-500">(los gratuitos van primero)</span>
                <select id="ai-model" value={settings.model} onChange={(event) => onChange({ model: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white">
                    <option value="">{settings.models.length ? 'Selecciona un modelo' : 'Conecta primero para listar modelos'}</option>
                    {settings.models.map((model) => <option key={model.id} value={model.id}>{model.free ? '🟢 GRATIS' : '💳 Pago'} · {model.id}</option>)}
                </select>
            </label>
            {!settings.apiKey && <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">⚠️ Sin API Key configurada, los botones de IA del formulario no estarán disponibles.</p>}
        </section>
    </div>;
};

AiSettings.propTypes = { settings: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired };

export default AiSettings;
