import { SearchService } from './search.service.js';
import { ApiResponse } from '../../utils/response.util.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class SearchController {
  /**
   * Execute an AI-powered search and persist to database
   * POST /api/v1/search
   */
  static performSearch = asyncHandler(async (req, res) => {
    const { search, systemPrompt, model, temperature } = req.body;
    const result = await SearchService.performSearch({
      search,
      systemPrompt,
      model,
      temperature
    });

    return ApiResponse.created(res, 'Search completed successfully', result);
  });

  /**
   * Get paginated search history
   * GET /api/v1/search
   */
  static getHistory = asyncHandler(async (req, res) => {
    const { page, limit, search } = req.query;
    const historyData = await SearchService.getHistory({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search
    });

    return ApiResponse.paginated(
      res,
      'Search history retrieved successfully',
      historyData.items,
      {
        totalItems: historyData.totalItems,
        totalPages: historyData.totalPages,
        currentPage: historyData.currentPage,
        limit: historyData.limit,
        hasNextPage: historyData.hasNextPage,
        hasPrevPage: historyData.hasPrevPage
      }
    );
  });

  /**
   * Get a specific search by ID
   * GET /api/v1/search/:id
   */
  static getSearchById = asyncHandler(async (req, res) => {
    const searchRecord = await SearchService.getSearchById(req.params.id);
    return ApiResponse.success(res, 'Search record retrieved successfully', searchRecord);
  });

  /**
   * Delete a single search record
   * DELETE /api/v1/search/:id
   */
  static deleteSearch = asyncHandler(async (req, res) => {
    await SearchService.deleteSearch(req.params.id);
    return ApiResponse.success(res, 'Search record deleted successfully');
  });

  /**
   * Clear all search history
   * DELETE /api/v1/search
   */
  static clearHistory = asyncHandler(async (req, res) => {
    await SearchService.clearHistory();
    return ApiResponse.success(res, 'Search history cleared successfully');
  });

  /**
   * Check LLM engine health and available models
   * GET /api/v1/search/status
   */
  static getAIStatus = asyncHandler(async (req, res) => {
    const status = await SearchService.getAIStatus();
    return ApiResponse.success(res, 'AI Engine status retrieved successfully', status);
  });
}
