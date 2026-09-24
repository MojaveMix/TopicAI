import { User, Role, Permission, sequelize } from "../models/index.js";
import { ROLES } from "../../constants/roles.constant.js";
import {
  PERMISSIONS,
  ROLE_PERMISSIONS_MAP,
} from "../../constants/permissions.constant.js";
import { PasswordUtil } from "../../utils/password.util.js";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

export const seedDatabase = async () => {
  const transaction = await sequelize.transaction();

  try {
    logger.info("Starting database seeding...");

    // 1. Seed Permissions
    const permissionEntities = [];
    for (const [key, permName] of Object.entries(PERMISSIONS)) {
      const moduleName = permName.split(":")[0] || "general";
      const description = `Permission to ${permName.replace(":", " ")}`;

      const [permission] = await Permission.findOrCreate({
        where: { name: permName },
        defaults: {
          name: permName,
          description,
          module: moduleName,
        },
        transaction,
      });
      permissionEntities.push(permission);
    }
    logger.info(`Seeded ${permissionEntities.length} permissions.`);

    // 2. Seed Roles
    const roleDescriptions = {
      [ROLES.SUPER_ADMIN]: "Full system access with all privileges",
      [ROLES.ADMIN]: "Administrator with user and role management access",
      [ROLES.MANAGER]: "Manager with elevated operational access",
      [ROLES.USER]: "Standard user with base application access",
    };

    const rolesMap = {};
    for (const roleName of Object.values(ROLES)) {
      const [role] = await Role.findOrCreate({
        where: { name: roleName },
        defaults: {
          name: roleName,
          description: roleDescriptions[roleName] || `${roleName} Role`,
          isSystem: true,
        },
        transaction,
      });
      rolesMap[roleName] = role;
    }
    logger.info(`Seeded ${Object.keys(rolesMap).length} default roles.`);

    // 3. Associate Permissions to Roles
    for (const [roleName, permissionNames] of Object.entries(
      ROLE_PERMISSIONS_MAP,
    )) {
      const role = rolesMap[roleName];
      if (role) {
        const permsToAssign = await Permission.findAll({
          where: { name: permissionNames },
          transaction,
        });
        await role.setPermissions(permsToAssign, { transaction });
      }
    }
    logger.info("Role-Permission mappings synchronized.");

    // 4. Seed Default Super Admin User
    const superAdminRole = rolesMap[ROLES.SUPER_ADMIN];
    let adminUser = await User.findOne({
      where: { email: env.SUPER_ADMIN_EMAIL.toLowerCase() },
      transaction,
    });

    if (!adminUser) {
      const hashedPassword = await PasswordUtil.hash(env.SUPER_ADMIN_PASSWORD);
      adminUser = await User.create(
        {
          name: env.SUPER_ADMIN_NAME,
          email: env.SUPER_ADMIN_EMAIL,
          password: hashedPassword,
          isActive: true,
        },
        { transaction },
      );

      await adminUser.setRoles([superAdminRole], { transaction });
      logger.info(
        `Super Admin created successfully (${env.SUPER_ADMIN_EMAIL})`,
      );
    } else {
      // Ensure Super Admin has the SUPER_ADMIN role
      const userRoles = await adminUser.getRoles({ transaction });
      const hasSuperAdmin = userRoles.some((r) => r.name === ROLES.SUPER_ADMIN);
      if (!hasSuperAdmin) {
        await adminUser.addRole(superAdminRole, { transaction });
      }
      logger.info(`Super Admin already exists (${env.SUPER_ADMIN_EMAIL})`);
    }

    // 5. Seed Pre-Configured OSINT & CTI Feed Sources
    const defaultFeeds = [
      {
        name: "CISA Cybersecurity Advisories & Alerts",
        url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
        type: "RSS",
        fetchInterval: 30,
      },
      {
        name: "BleepingComputer Cybersecurity News",
        url: "https://www.bleepingcomputer.com/feed/",
        type: "RSS",
        fetchInterval: 60,
      },
      {
        name: "The Hacker News",
        url: "https://feeds.feedburner.com/TheHackersNews",
        type: "RSS",
        fetchInterval: 60,
      },
      {
        name: "SANS Internet Storm Center Daily Diary",
        url: "https://isc.sans.edu/rssfeed.xml",
        type: "RSS",
        fetchInterval: 120,
      },
    ];

    logger.info(
      `Seeded ${defaultFeeds.length} default OSINT threat feed sources.`,
    );

    await transaction.commit();
    logger.info("Database seeding completed successfully.");
  } catch (error) {
    await transaction.rollback();
    logger.error("Error during database seeding:", error);
    throw error;
  }
};
