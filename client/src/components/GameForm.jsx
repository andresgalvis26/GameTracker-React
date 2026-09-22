import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { coverLabel } from '../constants/coverOptions';
import { PC_STORES, PLATFORMS, STATUSES, GENRES } from '../constants/gameOptions';
import { generate, looksLikeReasoning, sanitizeAiText } from '../services/aiService';

const isPerGameCover = (key) => /(^|\/)game-covers\/[^/]+\//.test(key) || key.startsWith('uploads/games/');

const spanishish = (value) => /[áéíóñ¿¡]|\b(de|la|el|los|las|que|por|para|con|una|un|juego|aventura|historia|mecánicas)\b/i.test(String(value || ''));

const initialCoverMode = (form) => {
    if (form.coverFile) return 'upload';
    if (form.imageKey) return isPerGameCover(form.imageKey) ? 'upload' : 'library';
    if (form.imageUrl && !/^https?:\/\//i.test(form.imageUrl)) return 'library';
    if (form.imageUrl) return 'url';
    return 'library';
};

const GameForm = ({ form, isEditing, isSaving, onChange, onSubmit, onCancel, aiSettings, onOpenSettings, covers, coversLoading, coversError, onReloadCovers }) => {
    const [coverMode, setCoverMode] = useState(() => initialCoverMode(form));
    const [coverSearch, setCoverSearch] = useState('');
    const [errors, setErrors] = useState({});
    const [imageError, setImageError] = useState(false);
    const [aiAction, setAiAction] = useState(null);
    const [aiError, setAiError] = useState('');
    const [coverPreview, setCoverPreview] = useState('');
    const [aiStatus, setAiStatus] = useState('');
    const descriptionRef = useRef(null);
    const update = (changes) => {
        onChange((current) => ({ ...current, ...changes }));
        setErrors((current) => ({ ...current, ...Object.fromEntries(Object.keys(changes).map((key) => [key, ''])) }));
    };
    const completed = form.status === 'Completado';

    useEffect(() => {
        if (!form.coverFile) { setCoverPreview(''); return undefined; }
        const url = URL.createObjectURL(form.coverFile);
        setCoverPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.coverFile]);

    useEffect(() => {
        const el = descriptionRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(Math.max(el.scrollHeight, 240), 480)}px`;
    }, [form.description, aiAction]);

    useEffect(() => {
        if (aiAction !== 'description') { setAiStatus(''); return undefined; }
        const messages = [
            'Preparando el contexto del juego...',
            'Consultando el modelo de IA...',
            'Redactando la descripción...',
            'Puliendo el texto final...'
        ];
        let index = 0;
        setAiStatus(messages[0]);
        const timer = setInterval(() => {
            index = Math.min(index + 1, messages.length - 1);
            setAiStatus(messages[index]);
        }, 1600);
        return () => clearInterval(timer);
    }, [aiAction]);

    const selectedCover = covers.find((cover) => cover.key === form.imageKey);
    const previewSrc = coverPreview || form.imageUrl || selectedCover?.url || '';
    const visibleCovers = covers
        .map((cover) => ({ ...cover, label: coverLabel(cover.file) }))
        .filter((cover) => cover.label.toLowerCase().includes(coverSearch.toLowerCase()));

    const ensureAiReady = () => {
        setAiError('');
        if (!aiSettings.apiKey.trim() || !aiSettings.model) {
            onOpenSettings();
            return false;
        }
        return true;
    };

    const gameContext = () => [
        `Título: ${form.title.trim() || '(sin título)'}`,
        `Plataforma: ${form.platform}`,
        form.pcStore && `Tienda PC: ${form.pcStore}`,
        form.targetYear && `Año: ${form.targetYear}`,
        form.isOnline ? 'Tipo: juego online' : 'Tipo: juego local/campaña'
    ].filter(Boolean).join('\n');

    const typeIntoDescription = async (fullText) => {
        const chunkSize = 6;
        const delay = 18;
        update({ description: '' });
        for (let index = chunkSize; index <= fullText.length; index += chunkSize) {
            update({ description: fullText.slice(0, index) });
            await new Promise((resolve) => { setTimeout(resolve, delay); });
        }
        update({ description: fullText });
    };

    const generateDescription = async () => {
        if (!ensureAiReady()) return;
        setAiAction('description');
        try {
            const raw = await generate({
                baseUrl: aiSettings.baseUrl,
                apiKey: aiSettings.apiKey,
                model: aiSettings.model,
                maxTokens: 1600,
                messages: [
                    { role: 'system', content: 'Eres un redactor de fichas de videojuegos en ESPAÑOL. REGLAS ESTRICTAS: 1) Responde SOLO con el texto final de la descripción. 2) NO razones, NO uses inglés, NO listes datos de trabajo, NO digas "let me", "the user wants", "developer:", etc. 3) Tono neutro y factual, sin emoji, sin spoilers, sin opinión personal. 4) Si no sabes el juego, di una descripción breve basada en el título.' },
                    { role: 'user', content: `Escribe la descripción final (ya redactada) de este videojuego. Género, premisa, mecánicas y puntos destacados. Máximo 1800 caracteres. SOLO la descripción en español.\n\nJuego:\n${gameContext()}` }
                ]
            });
            let cleaned = sanitizeAiText(raw);
            if (!cleaned || looksLikeReasoning(cleaned)) {
                cleaned = sanitizeAiText(raw.split(/\n\s*\n/).filter((part) => spanishish(part)).pop() || '');
            }
            if (!cleaned || looksLikeReasoning(cleaned) || cleaned.length < 40) {
                throw new Error('El modelo devolvió razonamiento interno en vez de la descripción. Elige un modelo de chat normal (p. ej. gpt-4o-mini, llama-3.3, gemini) y no uno "reasoner".');
            }
            cleaned = cleaned.slice(0, 2000);
            setAiAction('typing');
            await typeIntoDescription(cleaned);
        } catch (error) {
            setAiError(error.message || 'No se pudo generar la descripción.');
        } finally {
            setAiAction(null);
        }
    };

    const suggestTitle = async () => {
        if (!ensureAiReady()) return;
        setAiAction('title');
        try {
            const raw = await generate({
                baseUrl: aiSettings.baseUrl,
                apiKey: aiSettings.apiKey,
                model: aiSettings.model,
                maxTokens: 80,
                temperature: 0.2,
                messages: [
                    { role: 'system', content: 'Respondes ÚNICAMENTE con el título oficial del videojuego. Sin comillas, sin explicaciones, sin razonamiento, en una sola línea y en el idioma oficial del juego.' },
                    { role: 'user', content: `Título aproximado: "${form.title.trim() || '(vacío)'}"\nPlataforma: ${form.platform}\nTítulo oficial:` }
                ]
            });
            const cleaned = sanitizeAiText(raw).split('\n').map((line) => line.trim()).filter((line) => line && !/^(the |let me |i )/i.test(line)).slice(-1)[0] || '';
            const title = cleaned.replace(/^["'“”]+|["'“”]+$/g, '').trim().slice(0, 200);
            if (title) update({ title });
            else throw new Error('No se pudo obtener un título válido.');
        } catch (error) {
            setAiError(error.message || 'No se pudo sugerir el título.');
        } finally {
            setAiAction(null);
        }
    };

    const validateAndSubmit = (event) => {
        event.preventDefault();
        const nextErrors = {};
        if (!form.title.trim()) nextErrors.title = 'Escribe el nombre del juego.';
        if (form.rating !== '' && (Number(form.rating) < 0 || Number(form.rating) > 10)) nextErrors.rating = 'La puntuación debe estar entre 0 y 10.';
        if (form.imageUrl && !/^https?:\/\//i.test(form.imageUrl) && !form.imageUrl.startsWith('/')) nextErrors.imageUrl = 'Usa una URL http(s) válida.';
        if (form.coverFile && form.coverFile.size > 5 * 1024 * 1024) nextErrors.coverFile = 'La imagen excede los 5 MB.';
        if (form.hoursPlayed !== '' && (Number.isNaN(Number(form.hoursPlayed)) || Number(form.hoursPlayed) < 0)) nextErrors.hoursPlayed = 'Las horas deben ser un número positivo.';
        if (form.progress !== '' && (Number.isNaN(Number(form.progress)) || Number(form.progress) < 0 || Number(form.progress) > 100)) nextErrors.progress = 'El progreso debe estar entre 0 y 100.';
        setErrors(nextErrors);
        if (!Object.keys(nextErrors).length) onSubmit(event);
    };

    return <form onSubmit={validateAndSubmit} className="bg-gray-900" noValidate>
        <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
            <aside className="border-b border-gray-800 bg-gray-950/70 p-5 lg:border-b-0 lg:border-r">
                <SectionKicker>Portada</SectionKicker>
                <div className="relative mx-auto mt-4 aspect-[3/4] max-w-[210px] overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-xl">
                    <img src={imageError || !previewSrc ? '/GameTracker.ico' : previewSrc} alt={previewSrc ? 'Previsualización de la portada' : 'Sin portada seleccionada'} className="h-full w-full object-cover" onError={() => setImageError(true)} />
                    {previewSrc && <button type="button" onClick={() => { update({ imageUrl: '', imageKey: '', coverFile: null }); setImageError(false); }} className="absolute right-2 top-2 rounded-lg bg-black/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black">Quitar</button>}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-1 rounded-lg bg-gray-800 p-1 text-xs"><button type="button" onClick={() => setCoverMode('library')} className={`rounded-md px-2 py-2 transition ${coverMode === 'library' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Biblioteca</button><button type="button" onClick={() => setCoverMode('upload')} className={`rounded-md px-2 py-2 transition ${coverMode === 'upload' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Subir</button><button type="button" onClick={() => setCoverMode('url')} className={`rounded-md px-2 py-2 transition ${coverMode === 'url' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>URL</button></div>
                {coverMode === 'url' && <div className="mt-3"><label htmlFor="image-url" className="text-xs text-gray-400">URL o ruta personalizada</label><input id="image-url" type="text" value={form.imageUrl} onChange={(event) => { setImageError(false); update({ imageUrl: event.target.value, imageKey: '', coverFile: null }); }} placeholder="https://.../portada.jpg" className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm text-white" />{errors.imageUrl && <ErrorMessage>{errors.imageUrl}</ErrorMessage>}</div>}
                {coverMode === 'upload' && <div className="mt-3"><label htmlFor="cover-file" className="text-xs text-gray-400">Subir imagen (JPG, PNG o WebP · máx 5 MB)</label><input id="cover-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setImageError(false); update({ coverFile: event.target.files?.[0] || null, imageKey: '', imageUrl: '' }); }} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white" />{form.coverFile && <p className="mt-1 text-xs text-gray-400">{form.coverFile.name}</p>}{errors.coverFile && <ErrorMessage>{errors.coverFile}</ErrorMessage>}</div>}
                {coverMode === 'library' && <div className="mt-3"><label htmlFor="cover-search" className="sr-only">Buscar portada</label><input id="cover-search" type="search" value={coverSearch} onChange={(event) => setCoverSearch(event.target.value)} placeholder="Buscar portada..." className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm text-white" />{coversLoading ? <p className="mt-2 text-xs text-gray-500">Cargando portadas…</p> : coversError ? <p className="mt-2 text-xs text-red-300">{coversError} <button type="button" onClick={onReloadCovers} className="underline">Reintentar</button></p> : visibleCovers.length === 0 ? <p className="mt-2 text-xs text-gray-500">No hay portadas en R2.</p> : <div className="mt-2 grid max-h-48 grid-cols-3 gap-2 overflow-y-auto pr-1">{visibleCovers.map((cover) => <button type="button" key={cover.key} onClick={() => { setImageError(false); update({ imageKey: cover.key, imageUrl: '', coverFile: null }); }} className={`overflow-hidden rounded-lg border-2 ${form.imageKey === cover.key ? 'border-blue-400' : 'border-transparent'}`} title={cover.label}><img src={cover.url} alt={cover.label} loading="lazy" className="aspect-[3/4] w-full object-cover" /></button>)}</div>}</div>}
            </aside>
            <div>
                <section className="border-b border-gray-800 p-5 sm:p-7"><SectionKicker>Información principal</SectionKicker><div className="mt-4 space-y-4"><div><div className="flex items-center justify-between gap-2"><label htmlFor="game-title" className="text-sm font-medium text-gray-300">Nombre del videojuego<span className="ml-1 text-blue-400">*</span></label><AiButton onClick={suggestTitle} loading={aiAction === 'title'} idleLabel="✨ Sugerir título" loadingLabel="Pensando..." /></div><input id="game-title" type="text" value={form.title} placeholder="Ej. Marvel's Spider-Man 2" required onChange={(event) => update({ title: event.target.value })} className={`mt-1 w-full rounded-lg border bg-gray-800 p-3 text-white transition ${aiAction === 'title' ? 'animate-pulse border-blue-400/60' : errors.title ? 'border-red-400' : 'border-gray-700'}`} />{errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}</div><div><div className="flex items-center justify-between gap-2"><label htmlFor="description" className="text-sm font-medium text-gray-300">Descripción <span className="font-normal text-gray-500">(opcional)</span></label><AiButton onClick={generateDescription} loading={aiAction === 'description' || aiAction === 'typing'} idleLabel="✨ Generar con IA" loadingLabel={aiAction === 'typing' ? 'Escribiendo...' : 'Generando...'} /></div>{aiAction === 'description' ? <AiLoadingPanel status={aiStatus} /> : <div className="relative mt-1"><textarea id="description" ref={descriptionRef} value={form.description} onChange={(event) => update({ description: event.target.value })} maxLength="2000" placeholder="Notas, opinión o contexto personal..." rows={8} readOnly={aiAction === 'typing'} className={`min-h-60 w-full resize-y rounded-lg border bg-gray-800 p-3 leading-6 text-white max-h-[480px] overflow-y-auto ${aiAction === 'typing' ? 'ai-cursor border-blue-400/50' : 'border-gray-700'}`} />{aiAction === 'typing' && <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-blue-600/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow">✨ Escribiendo...</span>}</div>}<span className="mt-1 block text-right text-xs text-gray-500">{form.description.length}/2000</span></div>{aiError && <ErrorMessage>{aiError}</ErrorMessage>}</div></section>
                <section className="border-b border-gray-800 p-5 sm:p-7"><SectionKicker>Clasificación</SectionKicker><div className="mt-4 space-y-5"><div><p className="mb-2 text-sm font-medium text-gray-300">Estado</p><div className="grid gap-2 sm:grid-cols-3">{STATUSES.map((status) => <button type="button" key={status} onClick={() => update({ status, replayable: status === 'Completado' ? form.replayable : false, platinated: status === 'Completado' ? form.platinated : false })} aria-pressed={form.status === status} className={`rounded-xl border p-3 text-left ${form.status === status ? 'border-blue-400 bg-blue-500/15 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}><span className="block text-sm font-bold">{status === 'Backlog' ? '📚' : status === 'Jugando' ? '🎮' : '✅'} {status}</span><span className="mt-1 block text-xs text-gray-500">{status === 'Backlog' ? 'Pendiente de jugar' : status === 'Jugando' ? 'Actualmente en progreso' : 'Ya terminado'}</span></button>)}</div></div><div><p className="mb-2 text-sm font-medium text-gray-300">Plataforma</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{PLATFORMS.map((platform) => <button type="button" key={platform} onClick={() => update({ platform, pcStore: platform === 'PC' ? form.pcStore : '' })} aria-pressed={form.platform === platform} className={`rounded-lg border px-3 py-2 text-sm ${form.platform === platform ? 'border-blue-400 bg-blue-500/15 text-blue-200' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>{platform}</button>)}</div></div>{form.platform === 'PC' && <Select id="pc-store" label="Tienda de PC" value={form.pcStore} options={PC_STORES} empty="Sin especificar" onChange={(value) => update({ pcStore: value })} />}<label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${form.isOnline ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-gray-700 bg-gray-800'}`}><input type="checkbox" checked={form.isOnline} onChange={(event) => update({ isOnline: event.target.checked })} className="mt-1 h-4 w-4 accent-cyan-500" /><span><span className="block text-sm font-bold text-gray-200">🌐 Juego online</span><span className="mt-1 block text-xs leading-5 text-gray-500">No contará en el progreso de juegos completables ni en la tasa de completado.</span></span></label></div></section>
                <section className="p-5 sm:p-7"><SectionKicker>Tu seguimiento</SectionKicker><div className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2"><div><div className="flex items-end justify-between"><label htmlFor="rating" className="text-sm font-medium text-gray-300">Puntuación</label><span className="text-lg font-black text-yellow-300">{form.rating === '' ? 'Sin puntuar' : `${Number(form.rating).toFixed(1)} / 10`}</span></div><input id="rating" type="range" min="0" max="10" step="0.1" value={form.rating === '' ? 0 : form.rating} onChange={(event) => update({ rating: event.target.value })} className="mt-4 w-full accent-yellow-400" aria-label="Puntuación de 0 a 10" /><div className="mt-1 flex items-center justify-between text-xs text-gray-500"><span>0</span><span>10</span></div>{errors.rating && <ErrorMessage>{errors.rating}</ErrorMessage>}</div><div><div className="flex items-end justify-between"><label htmlFor="progress" className="text-sm font-medium text-gray-300">Progreso</label><span className={`text-lg font-black ${form.progress === '' ? 'text-gray-500' : progressTone(form.progress)}`}>{form.progress === '' ? 'Sin registrar' : `${form.progress}%`}</span></div><input id="progress" type="range" min="0" max="100" step="1" value={form.progress === '' ? 0 : Number(form.progress)} onChange={(event) => update({ progress: event.target.value })} className="mt-4 w-full accent-purple-500" aria-label="Progreso de 0 a 100" /><div className="mt-1 flex items-center justify-between text-xs text-gray-500"><span>0%</span>{form.progress !== '' && <button type="button" onClick={() => update({ progress: '' })} className="rounded px-2 py-0.5 text-gray-400 underline transition hover:text-white">Limpiar</button>}<span>100%</span></div>{errors.progress && <ErrorMessage>{errors.progress}</ErrorMessage>}</div><label htmlFor="target-year" className="block text-sm font-medium text-gray-300">{completed ? 'Año de completado' : 'Año objetivo'}<select id="target-year" value={form.targetYear} onChange={(event) => update({ targetYear: event.target.value })} className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white"><option value="">Sin especificar</option>{years().map((year) => <option key={year} value={year}>{year}</option>)}</select></label><label htmlFor="hours-played" className="block text-sm font-medium text-gray-300">Horas jugadas <span className="font-normal text-gray-500">(opcional)</span><input id="hours-played" type="number" min="0" step="0.5" inputMode="decimal" value={form.hoursPlayed} onChange={(event) => update({ hoursPlayed: event.target.value })} placeholder="Ej. 12.5" className={`mt-2 w-full rounded-lg border bg-gray-800 p-3 text-white ${errors.hoursPlayed ? 'border-red-400' : 'border-gray-700'}`} />{errors.hoursPlayed && <ErrorMessage>{errors.hoursPlayed}</ErrorMessage>}</label><div className="sm:col-span-2"><p className="mb-3 text-sm font-medium text-gray-300">Géneros</p><div className="flex flex-wrap gap-2">{GENRES.map((genre) => { const active = form.genres.includes(genre); return <button key={genre} type="button" onClick={() => update({ genres: active ? form.genres.filter((item) => item !== genre) : [...form.genres, genre] })} aria-pressed={active} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? 'border-blue-400 bg-blue-500/20 text-blue-200' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500 hover:text-white'}`}>{genre}</button>; })}</div></div><div className="grid gap-3 sm:col-span-2 sm:grid-cols-2"><Check label="🎯 Lista de deseos" hint="Lo quiero jugar más adelante" checked={Boolean(form.wishlist)} onChange={(value) => update({ wishlist: value })} />{completed && <><Check label="Lo volvería a jugar" hint="Vale la pena repetirlo" checked={form.replayable} onChange={(value) => update({ replayable: value })} /><Check label="Platinado / 100%" hint="Todos los logros conseguidos" checked={form.platinated} onChange={(value) => update({ platinated: value })} /></>}</div></div></section>
            </div>
        </div>
        <footer className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-gray-700 bg-gray-900/95 p-4 backdrop-blur sm:px-7"><p className="hidden text-xs text-gray-500 sm:block">{isEditing ? 'Los cambios se aplicarán al guardar.' : 'Puedes completar estos datos más adelante.'}</p><div className="ml-auto flex flex-1 gap-3 sm:flex-none"><button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-gray-700 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-gray-800 hover:text-white sm:flex-none">Cancelar</button><button type="submit" disabled={isSaving} className="min-w-36 flex-1 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500 disabled:opacity-50 sm:flex-none">{isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Añadir juego'}</button></div></footer>
    </form>;
};

const years = () => Array.from({ length: 21 }, (_, index) => new Date().getFullYear() - 10 + index);
const progressTone = (value) => {
    const number = Number(value);
    if (number >= 75) return 'text-emerald-300';
    if (number >= 40) return 'text-blue-300';
    return 'text-amber-300';
};
const SectionKicker = ({ children }) => <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">{children}</p>;
const ErrorMessage = ({ children }) => <p className="mt-1 text-xs text-red-300" role="alert">{children}</p>;
const AiButton = ({ onClick, loading, idleLabel, loadingLabel }) => (
    <button type="button" onClick={onClick} disabled={loading} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-400/40 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-70">
        {loading && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-300 border-t-transparent" aria-hidden="true" />}
        {loading ? loadingLabel : idleLabel}
    </button>
);
const AiLoadingPanel = ({ status }) => (
    <div className="relative mt-1 min-h-60 w-full overflow-hidden rounded-lg border border-blue-400/40 bg-gray-800 p-4" role="status" aria-live="polite">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" aria-hidden="true" />
        <div className="relative flex flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="ai-orb flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl shadow-lg shadow-blue-900/40">✨</div>
            <div>
                <p className="text-sm font-bold text-white">La IA está escribiendo tu descripción</p>
                <p className="mt-1 text-xs text-blue-300">{status || 'Trabajando...'}</p>
            </div>
            <div className="w-full max-w-md space-y-2.5" aria-hidden="true">
                <div className="ai-shimmer h-3 w-full rounded-full" />
                <div className="ai-shimmer h-3 w-11/12 rounded-full" style={{ animationDelay: '0.15s' }} />
                <div className="ai-shimmer h-3 w-4/5 rounded-full" style={{ animationDelay: '0.3s' }} />
                <div className="ai-shimmer h-3 w-10/12 rounded-full" style={{ animationDelay: '0.45s' }} />
            </div>
        </div>
    </div>
);
const Select = ({ id, label, value, options, empty, onChange }) => <label htmlFor={id} className="block text-sm font-medium text-gray-300">{label}<select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white"><option value="">{empty}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
const Check = ({ label, hint, checked, onChange }) => <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${checked ? 'border-blue-400 bg-blue-500/10' : 'border-gray-700 bg-gray-800'}`}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-blue-500" /><span><span className="block text-sm font-semibold text-gray-200">{label}</span><span className="mt-1 block text-xs text-gray-500">{hint}</span></span></label>;

SectionKicker.propTypes = { children: PropTypes.node.isRequired };
ErrorMessage.propTypes = { children: PropTypes.node.isRequired };
AiButton.propTypes = { onClick: PropTypes.func.isRequired, loading: PropTypes.bool.isRequired, idleLabel: PropTypes.node.isRequired, loadingLabel: PropTypes.node.isRequired };
AiLoadingPanel.propTypes = { status: PropTypes.string.isRequired };
Select.propTypes = { id: PropTypes.string.isRequired, label: PropTypes.string.isRequired, value: PropTypes.string.isRequired, options: PropTypes.arrayOf(PropTypes.string).isRequired, empty: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired };
Check.propTypes = { label: PropTypes.string.isRequired, hint: PropTypes.string.isRequired, checked: PropTypes.bool.isRequired, onChange: PropTypes.func.isRequired };
GameForm.propTypes = { form: PropTypes.object.isRequired, isEditing: PropTypes.bool.isRequired, isSaving: PropTypes.bool.isRequired, onChange: PropTypes.func.isRequired, onSubmit: PropTypes.func.isRequired, onCancel: PropTypes.func.isRequired, aiSettings: PropTypes.object.isRequired, onOpenSettings: PropTypes.func.isRequired, covers: PropTypes.array.isRequired, coversLoading: PropTypes.bool.isRequired, coversError: PropTypes.string.isRequired, onReloadCovers: PropTypes.func.isRequired };

export default GameForm;
