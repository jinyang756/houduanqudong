const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Page = sequelize.define('pages', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  path: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true
  },
  layout_id: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  modules: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('published', 'draft', 'archived'),
    defaultValue: 'draft'
  },
  app_id: {
    type: DataTypes.STRING(50),
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
Page.findAll = async function() {
  return await this.findAll();
};

Page.findById = async function(id) {
  return await this.findByPk(id);
};

Page.findPublishedByApp = async function(appId) {
  return await this.findAll({
    where: {
      app_id: appId,
      status: 'published'
    }
  });
};

Page.create = async function(data) {
  return await this.create(data);
};

Page.update = async function(id, data) {
  const [updated] = await this.update(data, {
    where: { id }
  });
  if (updated) {
    return await this.findByPk(id);
  }
  return null;
};

Page.publish = async function(id) {
  const page = await this.findByPk(id);
  if (page) {
    page.status = 'published';
    await page.save();
    return page;
  }
  return null;
};

Page.delete = async function(id) {
  return await this.destroy({
    where: { id }
  });
};

module.exports = Page;