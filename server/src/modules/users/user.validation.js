import Joi from 'joi';

export const listUsersSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().optional().allow(''),
    role: Joi.string().trim().optional().allow(''),
    isActive: Joi.boolean().optional()
  })
};

export const userIdParamSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.empty': 'User ID is required',
      'string.guid': 'User ID must be a valid UUID'
    })
  })
};

export const createUserSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).max(128).required(),
    roles: Joi.array().items(Joi.string().trim()).min(1).optional(),
    isActive: Joi.boolean().optional().default(true),
    avatar: Joi.string().uri().optional().allow(null, '')
  })
};

export const updateUserSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    email: Joi.string().trim().email().optional(),
    isActive: Joi.boolean().optional(),
    avatar: Joi.string().uri().optional().allow(null, '')
  }).min(1)
};

export const assignRolesSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required()
  }),
  body: Joi.object({
    roles: Joi.array().items(Joi.string().trim().required()).min(1).required().messages({
      'array.min': 'At least one role name must be provided'
    })
  })
};
