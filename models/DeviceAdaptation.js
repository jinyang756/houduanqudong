const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DeviceAdaptation = sequelize.define('device_adaptations', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },
  module_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'modules',
      key: 'id'
    }
  },
  client_type_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'client_types',
      key: 'id'
    }
  },
  adaptation_config: {
    type: DataTypes.JSON,
    allowNull: false
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
DeviceAdaptation.findAll = async function() {
  return await this.findAll();
};

DeviceAdaptation.findById = async function(id) {
  return await this.findByPk(id);
};

DeviceAdaptation.findByModuleId = async function(moduleId) {
  return await this.findAll({ where: { module_id: moduleId } });
};

module.exports = DeviceAdaptation;