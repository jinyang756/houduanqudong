const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DataSource = sequelize.define('data_sources', {
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
  type: {
    type: DataTypes.ENUM('api', 'database', 'static'),
    allowNull: false
  },
  config: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
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
DataSource.findAll = async function() {
  return await this.findAll();
};

DataSource.findById = async function(id) {
  return await this.findByPk(id);
};

DataSource.create = async function(data) {
  return await this.create(data);
};

DataSource.update = async function(id, data) {
  const [updated] = await this.update(data, {
    where: { id }
  });
  if (updated) {
    return await this.findByPk(id);
  }
  return null;
};

DataSource.delete = async function(id) {
  return await this.destroy({
    where: { id }
  });
};

module.exports = DataSource;