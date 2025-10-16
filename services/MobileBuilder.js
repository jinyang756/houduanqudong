class MobileBuilder {
  constructor() {
    this.framework = 'react-native';
  }

  /**
   * 构建移动端应用
   * @param {object} config - 应用配置
   * @returns {Promise<object>} 构建结果
   */
  async build(config) {
    try {
      // 1. 生成项目结构
      const projectStructure = this.generateProjectStructure(config);
      
      // 2. 生成核心文件
      const files = this.generateCoreFiles(config);
      
      // 3. 生成组件代码
      const components = this.generateComponents(config);
      
      // 4. 生成路由配置
      const routes = this.generateRoutes(config);
      
      // 5. 生成应用入口文件
      const entryPoint = this.generateEntryPoint(config);
      
      // 6. 生成配置文件
      const projectConfig = this.generateProjectConfig(config);
      
      return {
        success: true,
        platform: 'mobile',
        framework: this.framework,
        projectStructure,
        files: {
          ...files,
          ...components,
          ...routes,
          ...entryPoint,
          ...projectConfig
        },
        buildSteps: [
          '生成项目结构',
          '创建核心文件',
          '生成组件代码',
          '配置路由',
          '创建入口文件',
          '生成项目配置'
        ],
        message: '移动端应用构建成功'
      };
    } catch (error) {
      console.error('移动端构建失败:', error);
      return {
        success: false,
        platform: 'mobile',
        error: error.message,
        message: '移动端应用构建失败'
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
        'src/components/',
        'src/screens/',
        'src/navigation/',
        'src/services/',
        'src/assets/',
        'src/utils/',
        'src/hooks/',
        'src/theme/'
      ]
    };
  }

  /**
   * 生成核心文件
   * @param {object} config - 应用配置
   * @returns {object} 核心文件
   */
  generateCoreFiles(config) {
    return {
      'babel.config.js': this.generateBabelConfig(),
      'metro.config.js': this.generateMetroConfig(),
      'app.json': this.generateAppJson(config)
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
    components['src/components/Header.js'] = this.generateHeaderComponent(config);
    components['src/components/Button.js'] = this.generateButtonComponent(config);
    
    return components;
  }

  /**
   * 生成路由配置
   * @param {object} config - 应用配置
   * @returns {object} 路由文件
   */
  generateRoutes(config) {
    return {
      'src/navigation/AppNavigator.js': this.generateAppNavigator(config)
    };
  }

  /**
   * 生成应用入口文件
   * @param {object} config - 应用配置
   * @returns {object} 入口文件
   */
  generateEntryPoint(config) {
    return {
      'App.js': this.generateAppComponent(config)
    };
  }

  /**
   * 生成项目配置文件
   * @param {object} config - 应用配置
   * @returns {object} 配置文件
   */
  generateProjectConfig(config) {
    return {
      'package.json': this.generatePackageJson(config),
      'src/theme/theme.js': this.generateTheme(config)
    };
  }

  // 生成各种配置文件和组件的辅助方法
  generateBabelConfig() {
    return `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin'
    ]
  };
};`;
  }

  generateMetroConfig() {
    return `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;`;
  }

  generateAppJson(config) {
    return JSON.stringify({
      expo: {
        name: config.name || 'Mobile App',
        slug: config.slug || 'mobile-app',
        version: config.version || '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        userInterfaceStyle: 'light',
        splash: {
          image: './assets/splash.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff'
        },
        assetBundlePatterns: [
          '**/*'
        ],
        ios: {
          supportsTablet: true
        },
        android: {
          adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff'
          }
        },
        web: {
          favicon: './assets/favicon.png'
        }
      }
    }, null, 2);
  }

  generateHeaderComponent(config) {
    return `import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';

const Header = ({ title, showBack = false, rightComponent }) => {
  const navigation = useNavigation();
  const theme = useTheme();
  
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      {showBack && (
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      )}
      <Text style={[styles.title, { color: theme.colors.white }]}>{title}</Text>
      {rightComponent || <View style={styles.rightPlaceholder} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
    color: '#fff',
  },
  rightPlaceholder: {
    width: 40,
  },
});

export default Header;`;
  }

  generateButtonComponent(config) {
    return `import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const Button = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const theme = useTheme();
  
  const buttonStyles = [
    styles.button,
    styles[size],
    styles[type],
    { backgroundColor: disabled ? '#E0E0E0' : theme.colors[type] },
    style
  ];
  
  const textStyles = [
      styles.text,
      styles[size + 'Text'],
      { color: disabled ? '#9E9E9E' : '#FFFFFF' },
      textStyle
  ];
  
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  primary: {
    backgroundColor: '#2196F3',
  },
  secondary: {
    backgroundColor: '#FF9800',
  },
  danger: {
    backgroundColor: '#F44336',
  },
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});

export default Button;`;
  }

  generateAppNavigator(config) {
    return `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
import { useTheme } from '../hooks/useTheme';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const theme = useTheme();
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background },
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

  generateAppComponent(config) {
    return `import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/hooks/useTheme';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}`;
  }

  generatePackageJson(config) {
    return JSON.stringify({
      "name": config.slug || "mobile-app",
      "version": config.version || "1.0.0",
      "main": "node_modules/expo/AppEntry.js",
      "scripts": {
        "start": "expo start",
        "android": "expo start --android",
        "ios": "expo start --ios",
        "web": "expo start --web"
      },
      "dependencies": {
        "expo": "^48.0.0",
        "expo-status-bar": "~1.4.4",
        "react": "18.2.0",
        "react-native": "0.71.6",
        "@react-navigation/native": "^6.1.6",
        "@react-navigation/stack": "^6.3.16",
        "react-native-safe-area-context": "4.5.0",
        "react-native-screens": "~3.20.0",
        "axios": "^1.3.4"
      },
      "devDependencies": {
        "@babel/core": "^7.20.0"
      },
      "private": true
    }, null, 2);
  }

  generateTheme(config) {
    return `import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    colors: {
      primary: '#2196F3',
      secondary: '#FF9800',
      danger: '#F44336',
      success: '#4CAF50',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#212121',
      white: '#FFFFFF',
      black: '#000000',
    },
    fontSize: {
      large: 20,
      medium: 16,
      small: 14,
      xs: 12
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 16
    }
  });
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context.theme;
};`;
  }
}

module.exports = MobileBuilder;