const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ClientType = sequelize.define('client_types', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  platform: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['web', 'mobile', 'pc']]
    }
  },
  config_template: {
    type: DataTypes.JSON,
    allowNull: true
  },
  created_at: {
    type: DataTypes.TIMESTAMP,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.TIMESTAMP,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
});

// 静态方法
ClientType.findAll = async function() {
  return await this.findAll();
};

ClientType.findById = async function(id) {
  return await this.findByPk(id);
};

module.exports = ClientType;