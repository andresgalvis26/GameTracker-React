export const EMPTY_AI_SETTINGS = {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: '',
    models: []
};

export const AI_PRESETS = [
    { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
    { label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1' },
    { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1' },
    { label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1' },
    { label: 'Mistral', baseUrl: 'https://api.mistral.ai/v1' },
    { label: 'xAI', baseUrl: 'https://api.x.ai/v1' },
    { label: 'Together', baseUrl: 'https://api.together.xyz/v1' },
    { label: 'Cerebras', baseUrl: 'https://api.cerebras.ai/v1' },
    { label: 'Moonshot', baseUrl: 'https://api.moonshot.ai/v1' },
    { label: 'HuggingFace', baseUrl: 'https://router.huggingface.co/v1' },
    { label: 'LM Studio', baseUrl: 'http://localhost:1234/v1' },
    { label: 'Ollama', baseUrl: 'http://localhost:11434/v1' }
];

export const normalizeBaseUrl = (url) => {
    const trimmed = (url || '').trim().replace(/\/+$/, '');
    if (!trimmed) return '';
    try {
        const parsed = new URL(trimmed);
        if (!parsed.pathname || parsed.pathname === '/') return `${trimmed}/v1`;
        return trimmed;
    } catch {
        return trimmed;
    }
};
