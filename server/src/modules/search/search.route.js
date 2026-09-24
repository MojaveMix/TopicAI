import { Router } from 'express';
import { SearchController } from './search.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  performSearchSchema,
  searchIdParamSchema,
  getSearchHistoryQuerySchema
} from './search.validation.js';

const router = Router();

// Check AI engine / Ollama connection status
router.get('/status', SearchController.getAIStatus);

// Perform AI Search & save to database
router.post('/', validate(performSearchSchema), SearchController.performSearch);

// Get paginated search history
router.get('/', validate(getSearchHistoryQuerySchema), SearchController.getHistory);

// Clear all search history
router.delete('/', SearchController.clearHistory);

// Get search by ID
router.get('/:id', validate(searchIdParamSchema), SearchController.getSearchById);

// Delete search by ID
router.delete('/:id', validate(searchIdParamSchema), SearchController.deleteSearch);

export default router;
