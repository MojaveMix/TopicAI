import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

export class OllamaService {
  /**
   * Check whether Ollama is running
   * and retrieve installed models.
   */
  static async checkHealth() {
    try {
      const baseUrl = env.OLLAMA_BASE_URL?.replace(/\/$/, "");

      if (!baseUrl) {
        throw new Error("OLLAMA_BASE_URL is not configured.");
      }

      const response = await fetch(`${baseUrl}/api/tags`);

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `Ollama health check failed: HTTP ${response.status} - ${body}`,
        );
      }

      const data = await response.json();

      return {
        online: true,
        models: data.models || [],
      };
    } catch (error) {
      logger.error(`Ollama health check failed: ${error.message}`);

      return {
        online: false,
        models: [],
      };
    }
  }

  /**
   * Generate text using Ollama /api/generate.
   */
  static async generate({ model, prompt, system = "", temperature = 0.2 }) {
    if (!model) {
      throw new Error("Ollama model is required.");
    }

    if (!prompt) {
      throw new Error("Ollama prompt is required.");
    }

    const baseUrl = env.OLLAMA_BASE_URL?.replace(/\/$/, "");

    if (!baseUrl) {
      throw new Error("OLLAMA_BASE_URL is not configured.");
    }

    const payload = {
      model,
      prompt,
      stream: false,
      options: {
        temperature,
      },
    };

    /**
     * Only add system when it exists.
     */
    if (system?.trim()) {
      payload.system = system.trim();
    }

    logger.debug(`Sending request to Ollama: ${baseUrl}/api/generate`);

    logger.debug(`Ollama model: ${model}`);

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify(payload),
      });

      /**
       * Always read the response body first.
       * This makes Ollama errors much easier to diagnose.
       */
      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Ollama HTTP ${response.status}: ${responseText}`);
      }

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Invalid JSON response from Ollama: ${responseText}`);
      }

      /**
       * Ollama /api/generate returns:
       *
       * {
       *   "model": "...",
       *   "response": "...",
       *   "done": true
       * }
       */
      if (typeof data.response !== "string") {
        throw new Error(`Ollama returned an invalid response: ${responseText}`);
      }

      return data.response;
    } catch (error) {
      logger.error(`Ollama generate failed (${model}): ${error.message}`);

      throw error;
    }
  }
}
