const Sequelize = require('sequelize');
require('dotenv').config(); // 加载环境变量

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'backend_driven_system',
  logging: process.env.NODE_ENV === 'development',
  define: {
    timestamps: false,
    freezeTableName: true
  }
});

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

module.exports = sequelize;