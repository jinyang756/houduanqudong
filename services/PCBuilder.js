class PCBuilder {
  constructor() {
    this.framework = 'electron';
  }

  /**
   * 构建PC端应用
   * @param {object} config - 应用配置
   * @returns {Promise<object>} 构建结果
   */
  async build(config) {
    try {
      // 1. 生成项目结构
      const projectStructure = this.generateProjectStructure(config);
      
      // 2. 生成主进程文件
      const mainProcess = this.generateMainProcessFiles(config);
      
      // 3. 生成渲染进程文件
      const rendererProcess = this.generateRendererProcessFiles(config);
      
      // 4. 生成组件代码
      const components = this.generateComponents(config);
      
      // 5. 生成配置文件
      const projectConfig = this.generateProjectConfig(config);
      
      return {
        success: true,
        platform: 'pc',
        framework: this.framework,
        projectStructure,
        files: {
          ...mainProcess,
          ...rendererProcess,
          ...components,
          ...projectConfig
        },
        buildSteps: [
          '生成项目结构',
          '创建主进程文件',
          '创建渲染进程文件',
          '生成组件代码',
          '生成项目配置'
        ],
        message: 'PC端应用构建成功'
      };
    } catch (error) {
      console.error('PC端构建失败:', error);
      return {
        success: false,
        platform: 'pc',
        error: error.message,
        message: 'PC端应用构建失败'
      };
    }
  }

  /**
   * 生成项目结构
   * @param {object} config - 应用配置
   * @returns {object} 项目结构
   */
  generateProjectStructure(config) {
    return {
      directories: [
        'src/',
        'src/main/',
        'src/renderer/',
        'src/renderer/components/',
        'src/renderer/pages/',
        'src/renderer/assets/',
        'src/renderer/services/',
        'src/renderer/utils/',
        'src/renderer/theme/',
        'public/'
      ]
    };
  }

  /**
   * 生成主进程文件
   * @param {object} config - 应用配置
   * @returns {object} 主进程文件
   */
  generateMainProcessFiles(config) {
    return {
      'src/main/main.js': this.generateMainProcess(config),
      'src/main/preload.js': this.generatePreloadScript(),
      'src/main/menu.js': this.generateMenuTemplate(config)
    };
  }

  /**
   * 生成渲染进程文件
   * @param {object} config - 应用配置
   * @returns {object} 渲染进程文件
   */
  generateRendererProcessFiles(config) {
    return {
      'src/renderer/index.js': this.generateRendererIndex(),
      'src/renderer/App.jsx': this.generateAppComponent(config),
      'public/index.html': this.generateHtmlTemplate(config)
    };
  }

  /**
   * 生成组件代码
   * @param {object} config - 应用配置
   * @returns {object} 组件文件
   */
  generateComponents(config) {
    const components = {};
    
    // 生成通用组件
    components['src/renderer/components/Sidebar.jsx'] = this.generateSidebarComponent(config);
    components['src/renderer/components/Header.jsx'] = this.generateHeaderComponent(config);
    components['src/renderer/components/Button.jsx'] = this.generateButtonComponent(config);
    
    // 生成页面组件
    components['src/renderer/pages/HomePage.jsx'] = this.generateHomePage(config);
    components['src/renderer/pages/AboutPage.jsx'] = this.generateAboutPage(config);
    
    return components;
  }

  /**
   * 生成项目配置文件
   * @param {object} config - 应用配置
   * @returns {object} 配置文件
   */
  generateProjectConfig(config) {
    return {
      'package.json': this.generatePackageJson(config),
      'webpack.main.config.js': this.generateWebpackMainConfig(),
      'webpack.renderer.config.js': this.generateWebpackRendererConfig(),
      'electron-builder.yml': this.generateElectronBuilderConfig(config)
    };
  }

  // 生成主进程相关文件
  generateMainProcess(config) {
    return `const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const menuTemplate = require('./menu');

let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: ${config.window?.defaultWidth || 1200},
    height: ${config.window?.defaultHeight || 800},
    resizable: ${config.window?.resizable ?? true},
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, '../renderer/assets/icon.png')
  });

  // 加载应用
  mainWindow.loadFile(path.join(__dirname, '../../public/index.html'));

  // 开发环境下打开调试工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // 设置应用菜单
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // 窗口关闭事件
  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  // 窗口移动或调整大小后保存窗口状态
  mainWindow.on('move', saveWindowState);
  mainWindow.on('resize', saveWindowState);
}

function saveWindowState() {
  if (mainWindow) {
    const { x, y, width, height } = mainWindow.getBounds();
    // 这里可以实现保存窗口状态到配置文件的逻辑
  }
}

// 当Electron完成初始化并准备创建浏览器窗口时调用
app.whenReady().then(() => {
  createWindow();

  // 在macOS上，点击dock图标重新创建窗口
  app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 关闭所有窗口时退出应用（Windows & Linux）
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

// 处理IPC通信
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-name', () => {
  return app.getName();
});`;
  }

  generatePreloadScript() {
    return `const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  
  // 文件操作（示例）
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
  openFile: () => ipcRenderer.invoke('open-file'),
  
  // 系统通知
  showNotification: (title, body) => ipcRenderer.send('show-notification', title, body),
  
  // 系统托盘
  updateTrayMenu: (menuTemplate) => ipcRenderer.send('update-tray-menu', menuTemplate)
});`;
  }

  generateMenuTemplate(config) {
    return `const { app, shell } = require('electron');

const menuTemplate = [
  {
    label: '文件',
    submenu: [
      {
        label: '新建',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          // 新建文件逻辑
        }
      },
      {
        label: '打开',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          // 打开文件逻辑
        }
      },
      {
        label: '保存',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          // 保存文件逻辑
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        accelerator: 'CmdOrCtrl+Q',
        click: () => app.quit()
      }
    ]
  },
  {
    label: '编辑',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { type: 'separator' },
      { role: 'selectAll' }
    ]
  },
  {
    label: '视图',
    submenu: [
      {
        label: '刷新',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        label: '开发者工具',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: (item, focusedWindow) => {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools();
        }
      }
    ]
  },
  {
    label: '帮助',
    submenu: [
      {
        label: '关于',
        click: () => {
          // 打开关于窗口
        }
      },
      {
        label: '文档',
        click: async () => {
          await shell.openExternal('https://example.com/docs');
        }
      }
    ]
  }
];

module.exports = menuTemplate;`;
  }

  // 生成渲染进程相关文件
  generateRendererIndex() {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  }

  generateAppComponent(config) {
    return `import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './theme/global.css';

function App() {
  const [appInfo, setAppInfo] = useState({ version: '1.0.0', name: '${config.name || 'Desktop App'}' });
  
  useEffect(() => {
    // 从主进程获取应用信息
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(version => {
        setAppInfo(prev => ({ ...prev, version }));
      });
      window.electronAPI.getAppName().then(name => {
        setAppInfo(prev => ({ ...prev, name }));
      });
    }
  }, []);
  
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header title={appInfo.name} version={appInfo.version} />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;`;
  }

  generateHtmlTemplate(config) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name || 'Desktop App'}</title>
</head>
<body>
  <div id="root"></div>
  <script>window.NODE_ENV = '${process.env.NODE_ENV || 'production'}';</script>
</body>
</html>`;
  }

  // 生成组件
  generateSidebarComponent(config) {
    return `import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2>应用导航</h2>
      </div>
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="menu-icon">🏠</span>
            <span className="menu-text">首页</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="menu-icon">ℹ️</span>
            <span className="menu-text">关于</span>
          </NavLink>
        </li>
        {/* 可以根据配置动态生成菜单 */}
      </ul>
    </nav>
  );
};

export default Sidebar;`;
  }

  generateHeaderComponent(config) {
    return `import React from 'react';
import './Header.css';

const Header = ({ title, version }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">{title}</h1>
        <div className="header-info">
          <span className="version">v{version}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;`;
  }

  generateButtonComponent(config) {
    return `import React from 'react';
import './Button.css';

const Button = ({
  children,
  onClick,
  type = 'primary',
  size = 'medium',
  disabled = false,
  className = ''
}) => {
  return (
    <button
      className={
        \`button button--\${type} button--\${size} \${disabled ? 'button--disabled' : ''} \${className}\`
      }
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;`;
  }

  generateHomePage(config) {
    return `import React from 'react';
import './HomePage.css';
import Button from '../components/Button';

const HomePage = () => {
  return (
    <div className="home-page">
      <h2>欢迎使用 {config.name || '桌面应用'}</h2>
      <p>这是PC端桌面应用的首页内容。</p>
      <div className="button-group">
        <Button>主要操作</Button>
        <Button type="secondary">次要操作</Button>
      </div>
    </div>
  );
};

export default HomePage;`;
  }

  generateAboutPage(config) {
    return `import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <h2>关于应用</h2>
      <p>{config.description || '这是一个基于Electron的桌面应用程序。'}</p>
      <div className="about-info">
        <p>版本: {config.version || '1.0.0'}</p>
        <p>框架: Electron</p>
      </div>
    </div>
  );
};

export default AboutPage;`;
  }

  // 生成配置文件
  generatePackageJson(config) {
    return JSON.stringify({
      "name": config.slug || "desktop-app",
      "version": config.version || "1.0.0",
      "description": config.description || "Electron桌面应用",
      "main": "main.js",
      "scripts": {
        "start": "electron .",
        "dev": "NODE_ENV=development electron .",
        "build": "npm run build:main && npm run build:renderer",
        "build:main": "webpack --config webpack.main.config.js",
        "build:renderer": "webpack --config webpack.renderer.config.js",
        "pack": "electron-builder --dir",
        "dist": "electron-builder"
      },
      "dependencies": {
        "electron-store": "^8.1.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.9.0"
      },
      "devDependencies": {
        "@babel/core": "^7.21.0",
        "@babel/preset-env": "^7.20.0",
        "@babel/preset-react": "^7.18.6",
        "babel-loader": "^9.1.2",
        "css-loader": "^6.7.3",
        "electron": "^23.0.0",
        "electron-builder": "^23.6.0",
        "html-webpack-plugin": "^5.5.0",
        "style-loader": "^3.3.2",
        "webpack": "^5.76.0",
        "webpack-cli": "^5.0.1"
      }
    }, null, 2);
  }

  generateWebpackMainConfig() {
    return `const path = require('path');

module.exports = {
  target: 'electron-main',
  entry: './src/main/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  resolve: {
    extensions: ['.js']
  },
  node: {
    __dirname: false,
    __filename: false
  }
};`;
  }

  generateWebpackRendererConfig() {
    return `const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'electron-renderer',
  entry: './src/renderer/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  }
};`;
  }

  generateElectronBuilderConfig(config) {
    return `appId: 'com.${config.slug || 'desktopapp'}.app'
productName: '${config.name || 'Desktop App'}'
version: '${config.version || '1.0.0'}'

mac:
  target: dmg
  icon: build/icon.icns

win:
  target: nsis
  icon: build/icon.ico

linux:
  target: AppImage
  icon: build/icon.png

files:
  - dist/
  - node_modules/
  - package.json

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true

artifactName: '${config.slug || 'desktop-app'}-v\${version}-\${os}.\${ext}'`;
  }
}

module.exports = PCBuilder;