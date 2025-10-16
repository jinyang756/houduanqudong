const sequelize = require('./config/db');
const Module = require('./models/Module');
const Page = require('./models/Page');
const Application = require('./models/Application');
const DataSource = require('./models/DataSource');
const ClientType = require('./models/ClientType');
const DeviceAdaptation = require('./models/DeviceAdaptation');

async function initDatabase() {
  try {
    console.log('开始初始化数据库...');

    // 同步模型到数据库（创建表）
    await sequelize.sync({
      force: true, // 注意：这会删除现有表并重新创建
      alter: false
    });
    console.log('数据库表创建成功');

    // 创建示例数据源
    const apiDataSource = await DataSource.create({
      id: 'api-datasource',
      name: 'API数据源',
      type: 'api',
      config: {
        baseUrl: 'https://api.example.com',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      },
      status: 'active'
    });

    const staticDataSource = await DataSource.create({
      id: 'static-datasource',
      name: '静态数据源',
      type: 'static',
      config: {
        data: {
          options: ['选项1', '选项2', '选项3']
        }
      },
      status: 'active'
    });

    console.log('示例数据源创建成功');

    // 创建示例模块
    const headerModule = await Module.create({
      id: 'header',
      name: '页面头部',
      type: 'component',
      config: {
        component: 'Header',
        props: {
          showLogo: true,
          showNav: true
        },
        events: {
          onLogoClick: 'handleLogoClick',
          onNavChange: 'handleNavChange'
        }
      },
      status: 'active'
    });

    const buttonModule = await Module.create({
      id: 'primary-button',
      name: '主要按钮',
      type: 'component',
      config: {
        component: 'Button',
        props: {
          type: 'primary',
          size: 'middle'
        },
        events: {
          onClick: 'handleButtonClick'
        }
      },
      status: 'active'
    });

    const defaultLayout = await Module.create({
      id: 'default-layout',
      name: '默认布局',
      type: 'layout',
      config: {
        component: 'Layout',
        props: {
          hasSidebar: true,
          hasFooter: true
        }
      },
      status: 'active'
    });

    const apiService = await Module.create({
      id: 'api-service',
      name: 'API服务',
      type: 'service',
      config: {
        service: 'ApiService',
        methods: ['get', 'post', 'put', 'delete']
      },
      status: 'active'
    });

    console.log('示例模块创建成功');

    // 创建示例应用
    const sampleApp = await Application.create({
      id: 'sample-app',
      name: '示例应用',
      description: '这是一个基于后端驱动的前端应用示例',
      config: {
        theme: 'light',
        locale: 'zh-CN',
        permissions: ['read', 'write']
      },
      version: '1.0.0',
      status: 'active'
    });

    console.log('示例应用创建成功');

    // 创建示例页面
    const homePage = await Page.create({
      id: 'home',
      name: '首页',
      path: '/home',
      layout_id: 'default-layout',
      modules: [
        {
          id: 'header',
          overrides: {
            props: {
              title: '欢迎首页'
            }
          }
        },
        {
          id: 'primary-button',
          overrides: {
            props: {
              children: '点击我'
            }
          }
        }
      ],
      metadata: {
        title: '首页',
        description: '应用首页'
      },
      status: 'published',
      app_id: 'sample-app'
    });

    const aboutPage = await Page.create({
      id: 'about',
      name: '关于页面',
      path: '/about',
      layout_id: 'default-layout',
      modules: [
        {
          id: 'header',
          overrides: {
            props: {
              title: '关于我们'
            }
          }
        }
      ],
      metadata: {
        title: '关于我们',
        description: '关于页面的描述'
      },
      status: 'published',
      app_id: 'sample-app'
    });

    console.log('示例页面创建成功');

    // 创建示例客户端类型
    const mobileClientType = await ClientType.create({
      id: 'react-native-client',
      name: 'React Native 客户端',
      platform: 'mobile',
      config_template: {
        framework: 'react-native',
        version: '0.72.0',
        plugins: ['react-navigation', 'axios']
      }
    });

    const pcClientType = await ClientType.create({
      id: 'electron-client',
      name: 'Electron 客户端',
      platform: 'pc',
      config_template: {
        framework: 'electron',
        version: '25.0.0',
        windowConfig: {
          width: 1200,
          height: 800
        }
      }
    });

    console.log('示例客户端类型创建成功');

    // 创建示例设备适配
    await DeviceAdaptation.create({
      id: 'header-mobile-adaptation',
      module_id: 'header',
      client_type_id: 'react-native-client',
      adaptation_config: {
        layout: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        },
        components: {
          logo: {
            width: 60,
            height: 60
          },
          nav: {
            type: 'bottom-tabs'
          }
        }
      }
    });

    console.log('示例设备适配创建成功');

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

// 执行初始化
initDatabase();