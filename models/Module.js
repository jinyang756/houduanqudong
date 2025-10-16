const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Module = sequelize.define('modules', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['component', 'page', 'layout', 'service', 'data']]
    }
  },
  config: {
    type: DataTypes.JSON,
    allowNull: false
  },
  multi_platform_config: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      platforms: {
        mobile: {
          enabled: false,
          framework: 'react-native',
          adaptions: {}
        },
        pc: {
          enabled: false,
          framework: 'electron',
          adaptions: {}
        }
      }
    }
  },
  version: {
    type: DataTypes.STRING(20),
    defaultValue: '1.0.0'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'draft'),
    defaultValue: 'draft'
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
Module.findAll = async function() {
  return await this.findAll();
};

Module.findById = async function(id) {
  return await this.findByPk(id);
};

Module.create = async function(data) {
  return await this.create(data);
};

Module.update = async function(id, data) {
  const [updated] = await this.update(data, {
    where: { id }
  });
  if (updated) {
    return await this.findByPk(id);
  }
  return null;
};

Module.delete = async function(id) {
  return await this.destroy({
    where: { id }
  });
};

module.exports = Module;