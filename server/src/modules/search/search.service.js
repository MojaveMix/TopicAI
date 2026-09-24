import { SearchRepository } from './search.repository.js';
import { OllamaService } from '../../services/ai/ollama.service.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { getPagination, getPagingData } from '../../utils/pagination.util.js';
import { NotFoundError } from '../../errors/index.js';

export class SearchService {
  /**
   * Default system instructions for LLM Search
   */
  static DEFAULT_SYSTEM_PROMPT = `You are a direct, concise, and helpful AI search assistant.
Provide a clear, accurate, and structured answer to the user's search query.
Use clean Markdown formatting (headings, bullet points, numbered lists, and code blocks where relevant) to answer the query directly.`;

  /**
   * Perform an AI-powered search query and persist to database
   */
  static async performSearch({ search, systemPrompt = null, model = null, temperature = 0.2 }) {
    const trimmedQuery = search.trim();
    const activeModel = model || env.OLLAMA_MODEL || 'Qwen3:8b';
    const effectiveSystemPrompt = systemPrompt && systemPrompt.trim() ? systemPrompt.trim() : this.DEFAULT_SYSTEM_PROMPT;

    let aiResult = '';
    let aiEngineStatus = 'ONLINE';

    try {
      logger.info(`Checking Ollama AI health at ${env.OLLAMA_BASE_URL}...`);
      const health = await OllamaService.checkHealth();

      if (!health.online) {
        throw new Error(`Ollama service is offline or unreachable at ${env.OLLAMA_BASE_URL}`);
      }

      logger.info(`Processing search query via Ollama LLM [model: ${activeModel}]: "${trimmedQuery.slice(0, 80)}..."`);
      
      const response = await OllamaService.generate({
        prompt: trimmedQuery,
        system: effectiveSystemPrompt,
        temperature
      });

      aiResult = (response || '').trim();
      if (!aiResult) {
        throw new Error('Empty response received from LLM engine.');
      }
    } catch (error) {
      logger.warn(`Ollama LLM call failed or unavailable (${error.message}). Generating fallback response.`);
      aiEngineStatus = 'FALLBACK';
      aiResult = this.generateFallbackResponse(trimmedQuery);
    }

    // Save search query and result in the database
    const savedRecord = await SearchRepository.create({
      search: trimmedQuery,
      result: aiResult
    });

    return {
      id: savedRecord.id,
      search: savedRecord.search,
      result: savedRecord.result,
      aiEngine: {
        provider: 'Ollama',
        model: activeModel,
        status: aiEngineStatus
      },
      createdAt: savedRecord.createdAt || savedRecord.created_at,
      updatedAt: savedRecord.updatedAt || savedRecord.updated_at
    };
  }

  /**
   * Clean search reply fallback when Ollama local instance is unreachable
   */
  static generateFallbackResponse(query) {
    return `### Search Results for: "${query}"

> **Note:** Local AI engine (\`${env.OLLAMA_MODEL}\`) at \`${env.OLLAMA_BASE_URL}\` is currently offline or unreachable.

---

#### Summary
- **Query:** ${query}
- **Status:** Query recorded in database.
- **Action:** Start your local Ollama engine with \`ollama run ${env.OLLAMA_MODEL}\` to receive live generative answers.`;
  }

  /**
   * Get paginated search history with optional filter
   */
  static async getHistory({ page = 1, limit = 10, search = '' }) {
    const { page: currentPage, limit: currentLimit, offset } = getPagination({ page, limit });

    const data = await SearchRepository.findAndCountAll({
      limit: currentLimit,
      offset,
      search
    });

    return getPagingData(data, currentPage, currentLimit);
  }

  /**
   * Get search record by ID
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
      updatedAt: record.updatedAt || record.updated_at
    };
  }

  /**
   * Delete a search record by ID
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
   * Clear all search history
   */
  static async clearHistory() {
    await SearchRepository.clearAll();
    return true;
  }

  /**
   * Get Ollama AI status and available models
   */
  static async getAIStatus() {
    return OllamaService.checkHealth();
  }
}
