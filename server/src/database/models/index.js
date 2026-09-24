import { sequelize } from "../../config/database.js";
import { User } from "./User.js";
import { Role } from "./Role.js";
import { Search } from "./Search.js";
import { Permission } from "./Permission.js";
import { UserRole } from "./UserRole.js";
import { RolePermission } from "./RolePermission.js";
import { RefreshToken } from "./RefreshToken.js";

// Setup Many-to-Many: User <-> Role
User.belongsToMany(Role, {
  through: UserRole,
  as: "roles",
  foreignKey: "userId",
  otherKey: "roleId",
});

Role.belongsToMany(User, {
  through: UserRole,
  as: "users",
  foreignKey: "roleId",
  otherKey: "userId",
});

// Setup Many-to-Many: Role <-> Permission
Role.belongsToMany(Permission, {
  through: RolePermission,
  as: "permissions",
  foreignKey: "roleId",
  otherKey: "permissionId",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  as: "roles",
  foreignKey: "permissionId",
  otherKey: "roleId",
});

// Setup One-to-Many: User <-> RefreshToken
User.hasMany(RefreshToken, {
  as: "refreshTokens",
  foreignKey: "userId",
  onDelete: "CASCADE",
});

RefreshToken.belongsTo(User, {
  as: "user",
  foreignKey: "userId",
});

export {
  sequelize,
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  RefreshToken,
  Search,
};
