import Joi from 'joi';

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    email: Joi.string().trim().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address'
    }),
    password: Joi.string().min(6).max(128).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters'
    }),
    avatar: Joi.string().uri().optional().allow(null, '')
  })
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().trim().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required'
    })
  })
};

export const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      'string.empty': 'Refresh token is required'
    })
  })
};

export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      'string.empty': 'Current password is required'
    }),
    newPassword: Joi.string().min(6).max(128).required().messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters'
    })
  })
};
