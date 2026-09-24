import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema
} from './auth.validation.js';

const router = Router();

// Public routes
router.post('/register', authRateLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh-token', validate(refreshTokenSchema), AuthController.refreshToken);
router.post('/logout', AuthController.logout);

// Protected routes (Require valid JWT access token)
router.get('/me', authenticate, AuthController.getMe);
router.put('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

export default router;
