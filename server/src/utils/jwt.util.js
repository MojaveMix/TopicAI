import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../errors/index.js';

export class JwtUtil {
  /**
   * Generate an Access Token
   * @param {object} payload - { id, email, roles, permissions }
   * @returns {string} JWT Token
   */
  static generateAccessToken(payload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      jwtid: crypto.randomUUID()
    });
  }

  /**
   * Generate a Refresh Token
   * @param {object} payload - { id }
   * @returns {string} JWT Token
   */
  static generateRefreshToken(payload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      jwtid: crypto.randomUUID()
    });
  }

  /**
   * Verify an Access Token
   * @param {string} token 
   * @returns {object} Decoded payload
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Access token has expired. Please refresh your token.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid access token.');
      }
      throw new UnauthorizedError('Authentication failed.');
    }
  }

  /**
   * Verify a Refresh Token
   * @param {string} token 
   * @returns {object} Decoded payload
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Refresh token has expired. Please log in again.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid refresh token.');
      }
      throw new UnauthorizedError('Authentication failed.');
    }
  }
}
