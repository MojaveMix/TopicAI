import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';

export class Permission extends Model {}

Permission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      },
      set(value) {
        this.setDataValue('name', value.toLowerCase().trim());
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'general'
    }
  },
  {
    sequelize,
    modelName: 'Permission',
    tableName: 'permissions',
    indexes: [
      { unique: true, fields: ['name'] },
      { fields: ['module'] }
    ]
  }
);
