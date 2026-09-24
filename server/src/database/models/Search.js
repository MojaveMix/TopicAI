import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export class Search extends Model {}

Search.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    search: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    result: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    modelName: "Search",
    tableName: "search",
  },
);
