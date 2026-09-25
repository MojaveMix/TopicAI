import { SearchRepository } from "./search.repository.js";
import { OllamaService } from "../../services/ai/ollama.service.js";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { getPagination, getPagingData } from "../../utils/pagination.util.js";
import { NotFoundError } from "../../errors/index.js";

export class SearchService {
  /**
   * Default system instructions for LLM Search
   */
  static DEFAULT_SYSTEM_PROMPT = `
You are a direct, concise, and helpful AI search assistant.

Your task is to answer the user's query accurately and clearly.

Rules:
- Answer the user's question directly.
- Do not invent information.
- If you are uncertain, say so.
- Use clean Markdown formatting.
- Use headings, bullet points, numbered lists, and code blocks when useful.
- Keep the answer concise but useful.
`.trim();

  /**
   * Perform an AI-powered search query and persist the result.
   */
  static async performSearch({
    search,
    systemPrompt = null,
    model = null,
    temperature = 0.2,
  }) {
    if (!search || typeof search !== "string") {
      throw new Error("Search query is required.");
    }

    const trimmedQuery = search.trim();

    if (!trimmedQuery) {
      throw new Error("Search query cannot be empty.");
    }

    /**
     * Use the requested model first.
     * Otherwise use the .env model.
     * Finally fallback to qwen3:8b.
     */
    const activeModel = model?.trim() || env.OLLAMA_MODEL?.trim() || "qwen3:8b";

    const effectiveSystemPrompt =
      systemPrompt?.trim() || this.DEFAULT_SYSTEM_PROMPT;

    let aiResult = "";
    let aiEngineStatus = "ONLINE";

    try {
      logger.info(`Checking Ollama AI health at ${env.OLLAMA_BASE_URL}...`);

      const health = await OllamaService.checkHealth();

      if (!health.online) {
        throw new Error(
          `Ollama service is offline or unreachable at ${env.OLLAMA_BASE_URL}`,
        );
      }

      /**
       * Optional: verify that the requested model exists.
       */
      const modelExists = health.models?.some(
        (item) => item.name === activeModel,
      );

      if (!modelExists && health.models?.length > 0) {
        const availableModels = health.models
          .map((item) => item.name)
          .join(", ");

        logger.warn(
          `Model "${activeModel}" was not found. Available models: ${availableModels}`,
        );

        throw new Error(
          `Ollama model "${activeModel}" is not available. Available models: ${availableModels}`,
        );
      }

      logger.info(
        `Processing search query via Ollama [model: ${activeModel}]: "${trimmedQuery.slice(
          0,
          80,
        )}${trimmedQuery.length > 80 ? "..." : ""}"`,
      );

      const response = await OllamaService.generate({
        model: activeModel,
        prompt: trimmedQuery,
        system: effectiveSystemPrompt,
        temperature,
      });

      aiResult = response?.trim() || "";

      if (!aiResult) {
        throw new Error("Empty response received from Ollama.");
      }

      logger.info(
        `Ollama response successfully generated [model: ${activeModel}]`,
      );
    } catch (error) {
      /**
       * During production you can keep the fallback.
       * The complete error is logged so you can debug it.
       */
      logger.error(
        `Ollama LLM call failed [model: ${activeModel}]: ${error.message}`,
      );

      if (error.stack) {
        logger.debug(error.stack);
      }

      aiEngineStatus = "FALLBACK";

      aiResult = this.generateFallbackResponse(trimmedQuery, activeModel);
    }

    /**
     * Persist search and result.
     */
    const savedRecord = await SearchRepository.create({
      search: trimmedQuery,
      result: aiResult,
    });

    return {
      id: savedRecord.id,
      search: savedRecord.search,
      result: savedRecord.result,

      aiEngine: {
        provider: "Ollama",
        model: activeModel,
        status: aiEngineStatus,
      },

      createdAt: savedRecord.createdAt || savedRecord.created_at,

      updatedAt: savedRecord.updatedAt || savedRecord.updated_at,
    };
  }

  /**
   * Generate fallback response when Ollama is unavailable.
   */
  static generateFallbackResponse(query, model) {
    return `### Search Results for: "${query}"

> **Note:** The local AI engine is currently unavailable.

#### AI Engine

- **Provider:** Ollama
- **Model:** \`${model}\`
- **URL:** \`${env.OLLAMA_BASE_URL}\`
- **Status:** Offline or unreachable

#### Query

\`${query}\`

The query has been successfully recorded in the database.

To start Ollama:

\`\`\`bash
ollama run ${model}
\`\`\`
`;
  }

  /**
   * Get paginated search history.
   */
  static async getHistory({ page = 1, limit = 10, search = "" }) {
    const {
      page: currentPage,
      limit: currentLimit,
      offset,
    } = getPagination({
      page,
      limit,
    });

    const data = await SearchRepository.findAndCountAll({
      limit: currentLimit,
      offset,
      search,
    });

    return getPagingData(data, currentPage, currentLimit);
  }

  /**
   * Get search record by ID.
   */
  static async getSearchById(id) {
    const record = await SearchRepository.findById(id);

    if (!record) {
      throw new NotFoundError(`Search record with ID '${id}' not found.`);
    }

    return {
      id: record.id,
      search: record.search,
      result: record.result,

      createdAt: record.createdAt || record.created_at,

      updatedAt: record.updatedAt || record.updated_at,
    };
  }

  /**
   * Delete a search record.
   */
  static async deleteSearch(id) {
    const record = await SearchRepository.findById(id);

    if (!record) {
      throw new NotFoundError(`Search record with ID '${id}' not found.`);
    }

    await SearchRepository.delete(id);

    return true;
  }

  /**
   * Clear all search history.
   */
  static async clearHistory() {
    await SearchRepository.clearAll();

    return true;
  }

  /**
   * Get Ollama AI status and available models.
   */
  static async getAIStatus() {
    return OllamaService.checkHealth();
  }
}
