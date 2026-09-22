import { normalizeBaseUrl } from '../constants/aiOptions';

const buildHeaders = (apiKey) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`
});

const extractError = (data) => {
    if (!data) return null;
    if (typeof data.error === 'string') return data.error;
    if (data.error?.message) return data.error.message;
    if (data.message) return data.message;
    return null;
};

const readErrorMessage = async (response) => {
    try {
        const data = await response.json();
        return extractError(data) || `Error HTTP ${response.status}`;
    } catch {
        return `Error HTTP ${response.status}`;
    }
};

// fetch lanza TypeError cuando hay CORS o fallo de red: damos un mensaje útil.
const requestJson = async (url, options, actionLabel) => {
    try {
        return await fetch(url, options);
    } catch {
        throw new Error(`No se pudo conectar con el proveedor de IA al ${actionLabel}. Puede ser CORS, red o URL base incorrecta.`);
    }
};

const isUnsupportedParamError = (message) =>
    /max_tokens|max_completion_tokens|temperature|unsupported|not supported|unknown parameter|unrecognized|invalid_request_error/i.test(message || '');

// Extrae el texto de la respuesta soportando content string/array y modelos de razonamiento.
const extractContent = (data) => {
    const choice = data?.choices?.[0];
    if (!choice) return { text: '', reason: null };

    let content = choice.message?.content;
    if (Array.isArray(content)) content = content.map((part) => part?.text || '').join('');

    let text = typeof content === 'string' ? content : '';
    if (!text) text = choice.message?.reasoning_content || choice.message?.reasoning || '';
    if (!text && typeof choice.text === 'string') text = choice.text;

    return { text, reason: choice.finish_reason || choice.native_finish_reason || null };
};

export const listModels = async ({ baseUrl, apiKey }) => {
    const url = `${normalizeBaseUrl(baseUrl)}/models`;
    const response = await requestJson(url, { headers: buildHeaders(apiKey) }, 'listar modelos');
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) throw new Error('API Key inválida o sin permisos.');
        throw new Error(await readErrorMessage(response));
    }
    const data = await response.json();
    const excluded = /(embedding|audio|whisper|tts|dall-e|moderation|transcribe|image)/i;
    const models = (data?.data || [])
        .filter((entry) => entry.id && !excluded.test(entry.id))
        .map((entry) => {
            const pricing = entry.pricing;
            const free = entry.id.endsWith(':free')
                || (pricing && Number(pricing.prompt) === 0 && Number(pricing.completion) === 0);
            return { id: entry.id, free: Boolean(free) };
        });
    return models.sort((a, b) => (b.free - a.free) || a.id.localeCompare(b.id));
};

export const generate = async ({ baseUrl, apiKey, model, messages, maxTokens = 700, temperature = 0.7 }) => {
    const url = `${normalizeBaseUrl(baseUrl)}/chat/completions`;

    const send = async (body) => {
        const response = await requestJson(url, {
            method: 'POST',
            headers: buildHeaders(apiKey),
            body: JSON.stringify(body)
        }, 'generar texto');
        const data = await response.json().catch(() => null);
        return { response, data };
    };

    // Intento estándar (OpenAI-compatible).
    let attempt = await send({ model, messages, temperature, max_tokens: maxTokens });

    // Modelos de razonamiento rechazan temperature/max_tokens: reintenta adaptado.
    if (!attempt.response.ok && isUnsupportedParamError(extractError(attempt.data))) {
        attempt = await send({ model, messages, max_completion_tokens: Math.max(maxTokens, 1024) });
    }
    if (!attempt.response.ok && isUnsupportedParamError(extractError(attempt.data))) {
        attempt = await send({ model, messages });
    }

    const { response, data } = attempt;

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) throw new Error('API Key inválida o sin permisos.');
        throw new Error(extractError(data) || `Error HTTP ${response.status}`);
    }

    // Algunos proveedores devuelven errores dentro de un 200.
    if (data?.error) throw new Error(extractError(data) || 'La IA devolvió un error.');

    const { text, reason } = extractContent(data);
    if (text) return text.trim();

    if (reason === 'length') throw new Error('La respuesta se cortó por el límite de tokens. Prueba un modelo de chat sin razonamiento o sube el límite.');
    if (reason === 'content_filter') throw new Error('La respuesta fue bloqueada por el filtro de contenido del proveedor.');
    throw new Error(`La IA no devolvió contenido${reason ? ` (finish_reason: ${reason})` : ''}. Verifica que el modelo sea de chat (no embeddings/imagen) y compatible con /chat/completions.`);
};

const META_LINE = /^(the user (wants|asked|needs|is)|let me |let'?s |i (need|will|should|must|want|am going|'ll|think|believe|should|will try)|first[,:]|okay[,:]|ok[,:]|now[,:]|here'?s|note:|notes:|step\s*\d|draft|following (the|these)|as (an|a) |in order to|to (write|create|generate|draft|produce)|the (model|system|instructions|description below)|thinking:|reasoning:|chain of thought|developer:|publisher:|released:|genre:|premise:|mechanics:|features:|key facts|summary:|outline:|i'?ll |i should|the response|the description should|make sure|ensure that|count characters|let'?s draft)/i;

const spanishScore = (value) => {
    const matches = value.match(/[áéíóñ¿¡]|\b(de|la|el|los|las|que|por|para|con|una|un|juego|descripción|aventura|mecánicas|historia|personaje|jugadores|misión|nivel)\b/gi);
    return matches ? matches.length : 0;
};

// Quita razonamiento interno (CoT en inglés) y deja solo la descripción usable.
export const sanitizeAiText = (raw) => {
    let text = String(raw || '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/^\s*(reasoning|pensamiento|thought process)\s*[:：].*$/gim, '')
        .trim();
    if (!text) return '';

    const lines = text.split(/\r?\n/);
    const kept = lines.filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return true;
        return !META_LINE.test(trimmed);
    });
    text = kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();

    const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
    if (paragraphs.length) {
        const useful = paragraphs.filter((part) => spanishScore(part) >= 2 || (!/^(the |let me |i |developer:|publisher:|released:)/i.test(part) && part.length > 100));
        if (useful.length) text = useful.join('\n\n').trim();
    }

    return text.replace(/^["'“”]+|["'“”]+$/g, '').trim();
};

export const looksLikeReasoning = (value) => {
    const text = String(value || '');
    if (!text) return false;
    const metaHits = (text.match(new RegExp(META_LINE.source, 'gim')) || []).length;
    return metaHits >= 3 || (metaHits >= 1 && spanishScore(text) < 2 && /(^|\n)\s*(the |let me |i (need|will|should))/i.test(text));
};
