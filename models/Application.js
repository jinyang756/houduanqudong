const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Application = sequelize.define('applications', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  config: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  version: {
    type: DataTypes.STRING(20),
    defaultValue: '1.0.0'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  created_at: {
    type: DataTypes.TIMESTAMP,
    defaultValue: DataTypes.NOW
  }
});

// 静态方法
Application.findAll = async function() {
  return await this.findAll();
};

Application.findById = async function(id) {
  return await this.findByPk(id);
};

Application.create = async function(data) {
  return await this.create(data);
};

Application.update = async function(id, data) {
  const [updated] = await this.update(data, {
    where: { id }
  });
  if (updated) {
    return await this.findByPk(id);
  }
  return null;
};

Application.delete = async function(id) {
  return await this.destroy({
    where: { id }
  });
};

module.exports = Application;