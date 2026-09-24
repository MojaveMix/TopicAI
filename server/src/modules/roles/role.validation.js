import Joi from 'joi';

export const roleIdParamSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.empty': 'Role ID is required',
      'string.guid': 'Role ID must be a valid UUID'
    })
  })
};

export const createRoleSchema = {
  body: Joi.object({
    name: Joi.string().trim().uppercase().min(2).max(50).required().messages({
      'string.empty': 'Role name is required',
      'string.min': 'Role name must be at least 2 characters'
    }),
    description: Joi.string().trim().max(255).optional().allow(''),
    permissions: Joi.array().items(Joi.string().trim()).optional()
  })
};

export const updateRoleSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required()
  }),
  body: Joi.object({
    name: Joi.string().trim().uppercase().min(2).max(50).optional(),
    description: Joi.string().trim().max(255).optional().allow(''),
    permissions: Joi.array().items(Joi.string().trim()).optional()
  }).min(1)
};

export const assignPermissionsSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required()
  }),
  body: Joi.object({
    permissions: Joi.array().items(Joi.string().trim().required()).min(1).required().messages({
      'array.min': 'At least one permission must be provided'
    })
  })
};
