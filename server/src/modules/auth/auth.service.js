import { User, Role, Permission, RefreshToken, sequelize } from '../../database/models/index.js';
import { PasswordUtil } from '../../utils/password.util.js';
import { JwtUtil } from '../../utils/jwt.util.js';
import { ROLES, DEFAULT_ROLE } from '../../constants/roles.constant.js';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../../errors/index.js';

export class AuthService {
  /**
   * Helper to format User entity with roles and permissions
   */
  static formatUserPayload(user) {
    const roleNames = user.roles ? user.roles.map(r => r.name) : [];
    const permissionNames = user.roles
      ? [...new Set(user.roles.flatMap(r => (r.permissions ? r.permissions.map(p => p.name) : [])))]
      : [];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isActive: user.isActive,
      roles: roleNames,
      permissions: permissionNames,
      createdAt: user.createdAt
    };
  }

  /**
   * Helper to create & save a new refresh token record
   */
  static async createRefreshTokenRecord(userId, refreshTokenString, ipAddress, userAgent, transaction = null) {
    // 7 days expiration from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return RefreshToken.create(
      {
        userId,
        token: refreshTokenString,
        expiresAt,
        ipAddress,
        userAgent
      },
      transaction ? { transaction } : {}
    );
  }

  /**
   * Register a new user
   */
  static async register({ name, email, password, avatar = null, ipAddress = null, userAgent = null }) {
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists.');
    }

    const defaultRole = await Role.findOne({ where: { name: DEFAULT_ROLE } });
    if (!defaultRole) {
      throw new BadRequestError('Default user role is not configured in the system.');
    }

    const hashedPassword = await PasswordUtil.hash(password);

    const transaction = await sequelize.transaction();
    try {
      const user = await User.create(
        {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          avatar
        },
        { transaction }
      );

      // Assign default USER role
      await user.setRoles([defaultRole], { transaction });

      // Fetch user with associations
      const createdUser = await User.findByPk(user.id, {
        include: [
          {
            model: Role,
            as: 'roles',
            include: [{ model: Permission, as: 'permissions' }]
          }
        ],
        transaction
      });

      const userPayload = this.formatUserPayload(createdUser);

      // Generate JWT tokens
      const accessToken = JwtUtil.generateAccessToken({
        id: createdUser.id,
        email: createdUser.email,
        roles: userPayload.roles,
        permissions: userPayload.permissions
      });

      const refreshToken = JwtUtil.generateRefreshToken({ id: createdUser.id });

      // Save refresh token
      await this.createRefreshTokenRecord(createdUser.id, refreshToken, ipAddress, userAgent, transaction);

      await transaction.commit();

      return {
        user: userPayload,
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Login with email and password
   */
  static async login({ email, password, ipAddress = null, userAgent = null }) {
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [
        {
          model: Role,
          as: 'roles',
          include: [{ model: Permission, as: 'permissions' }]
        }
      ]
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Please contact an administrator.');
    }

    const isPasswordValid = await PasswordUtil.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const userPayload = this.formatUserPayload(user);

    // Generate JWT tokens
    const accessToken = JwtUtil.generateAccessToken({
      id: user.id,
      email: user.email,
      roles: userPayload.roles,
      permissions: userPayload.permissions
    });

    const refreshToken = JwtUtil.generateRefreshToken({ id: user.id });

    // Store refresh token
    await this.createRefreshTokenRecord(user.id, refreshToken, ipAddress, userAgent);

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: userPayload,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }

  /**
   * Rotate and exchange refresh token for a fresh access token & refresh token
   */
  static async refreshToken({ refreshToken, ipAddress = null, userAgent = null }) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required.');
    }

    // Verify token signature & expiry
    const decoded = JwtUtil.verifyRefreshToken(refreshToken);

    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken }
    });

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.isExpired) {
      throw new UnauthorizedError('Refresh token is invalid, expired, or revoked.');
    }

    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          include: [{ model: Permission, as: 'permissions' }]
        }
      ]
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is invalid or deactivated.');
    }

    const userPayload = this.formatUserPayload(user);

    // Generate new access & refresh tokens (Token Rotation)
    const newAccessToken = JwtUtil.generateAccessToken({
      id: user.id,
      email: user.email,
      roles: userPayload.roles,
      permissions: userPayload.permissions
    });

    const newRefreshToken = JwtUtil.generateRefreshToken({ id: user.id });

    // Mark current token as revoked and rotated
    tokenRecord.isRevoked = true;
    tokenRecord.revokedAt = new Date();
    tokenRecord.replacedByToken = newRefreshToken;
    await tokenRecord.save();

    // Create new refresh token record
    await this.createRefreshTokenRecord(user.id, newRefreshToken, ipAddress, userAgent);

    return {
      user: userPayload,
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    };
  }

  /**
   * Logout user by revoking the refresh token
   */
  static async logout({ refreshToken }) {
    if (refreshToken) {
      const tokenRecord = await RefreshToken.findOne({
        where: { token: refreshToken }
      });

      if (tokenRecord) {
        tokenRecord.isRevoked = true;
        tokenRecord.revokedAt = new Date();
        await tokenRecord.save();
      }
    }

    return true;
  }

  /**
   * Change user password
   */
  static async changePassword({ userId, currentPassword, newPassword }) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isMatch = await PasswordUtil.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError('Current password does not match.');
    }

    user.password = await PasswordUtil.hash(newPassword);
    await user.save();

    // Revoke all active refresh tokens for this user for security
    await RefreshToken.update(
      { isRevoked: true, revokedAt: new Date() },
      { where: { userId, isRevoked: false } }
    );

    return true;
  }

  /**
   * Get current authenticated user profile
   */
  static async getMe(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          include: [{ model: Permission, as: 'permissions' }]
        }
      ]
    });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    return this.formatUserPayload(user);
  }
}
