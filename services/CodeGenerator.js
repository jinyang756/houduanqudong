class CodeGenerator {
  constructor() {
    this.platformGenerators = {
      web: this.generateWebCode.bind(this),
      mobile: this.generateMobileCode.bind(this),
      pc: this.generatePCCode.bind(this)
    };
  }

  /**
   * 根据平台生成代码
   * @param {object} config - 配置对象
   * @param {string} platform - 平台类型
   * @returns {object} 生成的代码文件
   */
  generatePlatformCode(config, platform = 'web') {
    const generator = this.platformGenerators[platform];
    if (!generator) {
      throw new Error(`不支持的平台: ${platform}`);
    }
    
    return generator(config);
  }

  /**
   * 生成Web平台代码
   * @param {object} config - 配置对象
   * @returns {object} 生成的代码文件
   */
  generateWebCode(config) {
    return {
      main: this.generateWebMainFile(config),
      appComponent: this.generateWebAppComponent(config),
      components: this.generateWebComponents(config),
      routes: this.generateWebRoutes(config)
    };
  }

  /**
   * 生成Mobile平台代码
   * @param {object} config - 配置对象
   * @returns {object} 生成的代码文件
   */
  generateMobileCode(config) {
    return {
      main: this.generateMobileMainFile(config),
      components: this.generateMobileComponents(config),
      screens: this.generateMobileScreens(config),
      navigation: this.generateMobileNavigation(config)
    };
  }

  /**
   * 生成PC平台代码
   * @param {object} config - 配置对象
   * @returns {object} 生成的代码文件
   */
  generatePCCode(config) {
    return {
      mainProcess: this.generatePCMainProcess(config),
      rendererProcess: this.generatePCRendererProcess(config),
      components: this.generatePCComponents(config),
      pages: this.generatePCPages(config)
    };
  }

  // Web平台代码生成方法
  generateWebMainFile(config) {
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

  generateWebAppComponent(config) {
    return `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import About from './pages/About';
import Header from './components/Header';

const theme = createTheme({
  palette: {
    primary: {
      main: '${config.theme?.colors?.primary || '#2196F3'}'
    },
    secondary: {
      main: '${config.theme?.colors?.secondary || '#FF9800'}'
    }
  },
  typography: {
    fontSize: ${config.theme?.fontSize?.base || 14}
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header title="${config.name || 'Web Application'}" />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;`;
  }

  generateWebComponents(config) {
    const components = {};
    
    // 生成基础组件
    if (config.components && Array.isArray(config.components)) {
      config.components.forEach(component => {
        components[component.type] = this.generateWebComponent(component);
      });
    }
    
    return components;
  }

  generateWebComponent(component) {
    const { type, props = {}, events = {} } = component;
    
    let componentCode = `import React from 'react';
import './${type}.css';

const ${type} = ({
  // 组件属性
`;
    
    // 添加属性定义
    const propKeys = Object.keys(props);
    if (propKeys.length > 0) {
      propKeys.forEach(key => {
        const defaultValue = typeof props[key] === 'string' ? `"${props[key]}"` : props[key];
        componentCode += `  ${key} = ${defaultValue},
`;
      });
    }
    
    // 添加事件处理
    const eventKeys = Object.keys(events);
    if (eventKeys.length > 0) {
      eventKeys.forEach(key => {
        componentCode += `  ${key},
`;
      });
    }
    
    componentCode += `  ...rest
}) => {
  return (
    <div className="${type.toLowerCase()}">
      {/* ${type} 组件内容 */}
    </div>
  );
};

export default ${type};`;
    
    return componentCode;
  }

  generateWebRoutes(config) {
    return `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};

export default AppRoutes;`;
  }

  // Mobile平台代码生成方法
  generateMobileMainFile(config) {
    return `import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}`;
  }

  generateMobileComponents(config) {
    const components = {};
    
    // 生成移动端组件
    if (config.components && Array.isArray(config.components)) {
      config.components.forEach(component => {
        components[component.type] = this.generateMobileComponent(component);
      });
    }
    
    return components;
  }

  generateMobileComponent(component) {
    const { type, props = {}, events = {} } = component;
    
    let componentCode = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ${type} = ({
  // 组件属性
`;
    
    // 添加属性定义
    const propKeys = Object.keys(props);
    if (propKeys.length > 0) {
      propKeys.forEach(key => {
        const defaultValue = typeof props[key] === 'string' ? `"${props[key]}"` : props[key];
        componentCode += `  ${key} = ${defaultValue},
`;
      });
    }
    
    // 添加事件处理
    const eventKeys = Object.keys(events);
    if (eventKeys.length > 0) {
      eventKeys.forEach(key => {
        componentCode += `  ${key},
`;
      });
    }
    
    componentCode += `  ...rest
}) => {
  return (
    <View style={styles.container}>
      <Text>${type} Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16
  }
});

export default ${type};`;
    
    return componentCode;
  }

  generateMobileScreens(config) {
    return {
      HomeScreen: this.generateMobileScreen('Home', config),
      AboutScreen: this.generateMobileScreen('About', config)
    };
  }

  generateMobileScreen(screenName, config) {
    return `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';

const ${screenName}Screen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header 
        title="${screenName === 'Home' ? '首页' : '关于我们'}" 
        showBack={${screenName === 'Home' ? 'false' : 'true'}}
      />
      <View style={styles.content}>
        <Text style={styles.title}>${screenName === 'Home' ? '欢迎来到应用首页' : '关于我们'}</Text>
        <Text style={styles.description}>
          ${screenName === 'Home' ? '这是移动端应用的首页内容。' : '这是一个基于React Native的移动应用。'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  description: {
    fontSize: 16,
    color: '#666'
  }
});

export default ${screenName}Screen;`;
  }

  generateMobileNavigation(config) {
    return `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;`;
  }

  // PC平台代码生成方法
  generatePCMainProcess(config) {
    return `const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: ${config.window?.defaultWidth || 1200},
    height: ${config.window?.defaultHeight || 800},
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});`;
  }

  generatePCRendererProcess(config) {
    return `import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);`;
  }

  generatePCComponents(config) {
    const components = {};
    
    // 生成PC端组件
    components.Sidebar = this.generatePCComponent('Sidebar', config);
    components.Header = this.generatePCComponent('Header', config);
    
    return components;
  }

  generatePCComponent(componentName, config) {
    return `import React from 'react';
import './${componentName}.css';

const ${componentName} = () => {
  return (
    <div className="${componentName.toLowerCase()}">
      <h3>${componentName} Component</h3>
    </div>
  );
};

export default ${componentName};`;
  }

  generatePCPages(config) {
    return {
      HomePage: this.generatePCPage('Home', config),
      AboutPage: this.generatePCPage('About', config)
    };
  }

  generatePCPage(pageName, config) {
    return `import React from 'react';
import './${pageName}Page.css';

const ${pageName}Page = () => {
  return (
    <div className="${pageName.toLowerCase()}-page">
      <h2>${pageName === 'Home' ? 'PC应用首页' : '关于页面'}</h2>
      <p>${pageName === 'Home' ? '欢迎使用PC桌面应用。' : '这是关于应用的详细信息。'}</p>
    </div>
  );
};

export default ${pageName}Page;`;
  }

  /**
   * 生成适配器代码
   * @param {object} adaptationConfig - 适配配置
   * @param {string} platform - 目标平台
   * @returns {string} 适配器代码
   */
  generateAdapter(adaptationConfig, platform) {
    return `// ${platform}平台适配器
const adapter = {
  adaptLayout: (originalLayout) => {
    // 应用布局适配配置
    return {
      ...originalLayout,
      ...${JSON.stringify(adaptationConfig.layout || {}, null, 2)}
    };
  },
  
  adaptComponents: (originalComponents) => {
    // 应用组件适配配置
    return originalComponents.map(component => ({
      ...component,
      props: {
        ...component.props,
        ...(${JSON.stringify(adaptationConfig.components || {}, null, 2)}[component.type] || {})
      }
    }));
  }
};

export default adapter;`;
  }

  /**
   * 生成构建脚本
   * @param {string} platform - 平台类型
   * @returns {string} 构建脚本内容
   */
  generateBuildScript(platform) {
    switch(platform) {
      case 'mobile':
        return `#!/bin/bash
# 移动端构建脚本

# 安装依赖
npm install

# 安装额外依赖
npm install --save react-native-web react-dom @expo/metro-runtime

# 导出Web版本
npx expo export --platform web

# 构建Android版本
npx expo build:android

# 构建iOS版本
npx expo build:ios`;
      
      case 'pc':
        return `#!/bin/bash
# PC端构建脚本

# 安装依赖
npm install

# 构建应用
npm run build

# 打包应用
npm run dist`;
      
      default:
        return `#!/bin/bash
# Web端构建脚本

# 安装依赖
npm install

# 构建应用
npm run build`;
    }
  }
}

module.exports = new CodeGenerator();