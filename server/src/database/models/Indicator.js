import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';

export class Indicator extends Model {}

Indicator.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false // IPV4, IPV6, DOMAIN, URL, MD5, SHA1, SHA256, CVE, EMAIL, BITCOIN_ADDRESS, REGISTRY_KEY
    },
    value: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    severity: {
      type: DataTypes.STRING(50),
      defaultValue: 'MEDIUM' // CRITICAL, HIGH, MEDIUM, LOW, INFO
    },
    reputationScore: {
      type: DataTypes.INTEGER,
      defaultValue: 75, // 0 to 100
      validate: { min: 0, max: 100 }
    },
    isMalicious: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    firstSeen: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    lastSeen: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    geoCountry: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    asn: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    enrichmentData: {
      type: DataTypes.JSON,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  },
  {
    sequelize,
    modelName: 'Indicator',
    tableName: 'indicators',
    indexes: [
      { fields: ['type'] },
      { fields: ['value'] },
      { fields: ['severity'] },
      { fields: ['is_malicious'] }
    ]
  }
);
