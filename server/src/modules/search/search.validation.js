import Joi from 'joi';

export const performSearchSchema = {
  body: Joi.object({
    search: Joi.string().trim().min(1).max(2000).required().messages({
      'string.empty': 'Search query is required',
      'any.required': 'Search query is required',
      'string.min': 'Search query must have at least 1 character',
      'string.max': 'Search query cannot exceed 2000 characters'
    }),
    systemPrompt: Joi.string().trim().max(2000).optional().allow('', null),
    model: Joi.string().trim().max(100).optional().allow('', null),
    temperature: Joi.number().min(0).max(2).optional()
  })
};

export const searchIdParamSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.empty': 'Search ID is required',
      'string.guid': 'Search ID must be a valid UUID'
    })
  })
};

export const getSearchHistoryQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().allow('').optional()
  })
};
