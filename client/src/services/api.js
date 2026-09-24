const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Helper to handle fetch requests with standard JSON parsing and error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data?.message || data?.errors?.[0]?.message || `Request failed with status ${res.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API error on [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

export const searchApi = {
  /**
   * Execute an AI search query
   */
  async search({ search, systemPrompt, model, temperature }) {
    const payload = { search };
    if (systemPrompt) payload.systemPrompt = systemPrompt;
    if (model) payload.model = model;
    if (temperature !== undefined) payload.temperature = parseFloat(temperature);

    const response = await apiRequest('/search', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data;
  },

  /**
   * Fetch paginated search history
   */
  async getHistory({ page = 1, limit = 15, search = '' } = {}) {
    const query = new URLSearchParams();
    if (page) query.set('page', page);
    if (limit) query.set('limit', limit);
    if (search) query.set('search', search);

    const response = await apiRequest(`/search?${query.toString()}`);
    return {
      items: response.data || [],
      pagination: response.pagination || {}
    };
  },

  /**
   * Fetch search record by ID
   */
  async getById(id) {
    const response = await apiRequest(`/search/${id}`);
    return response.data;
  },

  /**
   * Delete single search record
   */
  async delete(id) {
    const response = await apiRequest(`/search/${id}`, {
      method: 'DELETE'
    });
    return response;
  },

  /**
   * Clear all search history
   */
  async clearHistory() {
    const response = await apiRequest('/search', {
      method: 'DELETE'
    });
    return response;
  },

  /**
   * Check AI engine (Ollama) status and available models
   */
  async getAIStatus() {
    try {
      const response = await apiRequest('/search/status');
      return response.data;
    } catch {
      return { online: false, model: 'Qwen3:8b', modelFound: false, availableModels: [] };
    }
  },

  /**
   * System health check
   */
  async getHealth() {
    try {
      const response = await apiRequest('/health');
      return response.data;
    } catch {
      return null;
    }
  }
};
