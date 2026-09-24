import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export class OllamaService {
  /**
   * Check if local Ollama server is reachable and model is available
   */
  static async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${env.OLLAMA_BASE_URL}/api/tags`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) return { online: false, modelFound: false };

      const data = await res.json();
      const models = data.models || [];
      const modelFound = models.some(
        m => m.name.toLowerCase() === env.OLLAMA_MODEL.toLowerCase() ||
             m.name.toLowerCase().startsWith(env.OLLAMA_MODEL.toLowerCase().split(':')[0])
      );

      return {
        online: true,
        model: env.OLLAMA_MODEL,
        modelFound,
        availableModels: models.map(m => m.name)
      };
    } catch (error) {
      logger.warn(`Ollama health check failed: ${error.message}`);
      return { online: false, modelFound: false, error: error.message };
    }
  }

  /**
   * Send prompt to Ollama LLM (Qwen3:8b)
   * @param {string} prompt 
   * @param {object} options 
   * @returns {Promise<string>}
   */
  static async generate({ prompt, system = null, jsonFormat = false, temperature = 0.2 }) {
    const url = `${env.OLLAMA_BASE_URL}/api/generate`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.OLLAMA_TIMEOUT_MS);

    try {
      const body = {
        model: env.OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature
        }
      };

      if (system) {
        body.system = system;
      }

      if (jsonFormat) {
        body.format = 'json';
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ollama API error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      return data.response;
    } catch (error) {
      clearTimeout(timeoutId);
      logger.error(`Ollama generate failed (${env.OLLAMA_MODEL}):`, error.message);
      throw error;
    }
  }
}
