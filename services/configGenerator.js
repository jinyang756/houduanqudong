const Application = require('../models/Application');
const Page = require('../models/Page');
const Module = require('../models/Module');

class ConfigGenerator {
    async generateClientConfig(appId) {
        try {
            // 获取应用信息
            const application = await Application.findById(appId);
            if (!application) {
                throw new Error('应用不存在');
            }
            
            // 获取应用下已发布的页面
            const pages = await Page.findPublishedByApp(appId);
            
            const config = {
                app: {
                    id: application.id,
                    name: application.name,
                    version: application.version,
                    config: application.config
                },
                routes: [],
                components: {},
                services: {},
                layouts: {},
                dataModules: {}
            };

            // 生成路由配置
            for (const page of pages) {
                const routeConfig = {
                    path: page.path,
                    component: page.layout_id || 'DefaultLayout',
                    modules: await this.processModules(page.modules),
                    metadata: page.metadata || {}
                };
                config.routes.push(routeConfig);
            }

            // 收集所有组件、服务、布局和数据模块
            for (const page of pages) {
                for (const moduleConfig of page.modules) {
                    const module = await Module.findById(moduleConfig.id);
                    if (module && module.status === 'active') {
                        switch (module.type) {
                            case 'component':
                                config.components[module.id] = {
                                    id: module.id,
                                    type: module.type,
                                    config: { ...module.config, ...moduleConfig.overrides },
                                    version: module.version
                                };
                                break;
                            case 'service':
                                config.services[module.id] = {
                                    id: module.id,
                                    type: module.type,
                                    config: { ...module.config, ...moduleConfig.overrides },
                                    version: module.version
                                };
                                break;
                            case 'layout':
                                config.layouts[module.id] = {
                                    id: module.id,
                                    type: module.type,
                                    config: { ...module.config, ...moduleConfig.overrides },
                                    version: module.version
                                };
                                break;
                            case 'data':
                                config.dataModules[module.id] = {
                                    id: module.id,
                                    type: module.type,
                                    config: { ...module.config, ...moduleConfig.overrides },
                                    version: module.version
                                };
                                break;
                        }
                    }
                }
            }

            return config;
        } catch (error) {
            console.error('生成客户端配置失败:', error);
            throw error;
        }
    }

    async processModules(modulesConfig) {
        const processedModules = [];
        
        for (const moduleConfig of modulesConfig || []) {
            try {
                const module = await Module.findById(moduleConfig.id);
                if (module && module.status === 'active') {
                    processedModules.push({
                        id: module.id,
                        type: module.type,
                        config: { ...module.config, ...(moduleConfig.overrides || {}) },
                        version: module.version
                    });
                }
            } catch (error) {
                console.warn(`处理模块 ${moduleConfig.id} 时出错:`, error);
                // 继续处理其他模块
            }
        }
        
        return processedModules;
    }

    // 生成前端代码
    async generateFrontendCode(appId) {
        const config = await this.generateClientConfig(appId);
        
        return `// 自动生成的前端客户端代码
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './components/ConfigProvider';

// 导入默认布局组件
const DefaultLayout = ({ children, modules }) => {
  return (
    <div className="default-layout">
      <header className="app-header">
        <h1>{config.app.name}</h1>
      </header>
      <main className="app-main">
        {children || (
          <div className="page-content">
            {modules && modules.map((module, index) => (
              <ModuleRenderer key={index} module={module} />
            ))}
          </div>
        )}
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} {config.app.name} v{config.app.version}</p>
      </footer>
    </div>
  );
};

// 模块渲染器组件
const ModuleRenderer = ({ module }) => {
  // 这里可以根据模块类型和配置动态渲染不同的组件
  return (
    <div className={"module module-" + module.type} data-module-id={module.id}>
      <pre>{JSON.stringify(module, null, 2)}</pre>
    </div>
  );
};

// 应用组件
const App = () => {
  return (
    <ConfigProvider config={${JSON.stringify(config, null, 2)}}>
      <Router>
        <Routes>
          ${this.generateRoutes(config.routes)}
          <Route path="*" element={<DefaultLayout modules={[]} />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

// 配置提供者组件
const ConfigProvider = ({ config, children }) => {
  const [appConfig] = React.useState(config);
  
  return (
    <div className="app-config-provider">
      {children}
    </div>
  );
};

export default App;
`;
    }

    generateRoutes(routes) {
        return routes.map(route => `
            <Route 
                path="${route.path}" 
                element={<${route.component} modules={${JSON.stringify(route.modules)}} />} 
            />`).join('');
    }

    // 生成组件代码
    generateComponents(components) {
        let componentCode = '';
        
        Object.values(components).forEach(component => {
            componentCode += `
// 组件: ${component.name || component.id}
const ${this.capitalizeFirstLetter(component.id)} = (props) => {
  const componentConfig = ${JSON.stringify(component.config)};
  
  return (
    <div className="component ${component.id}">
      {/* 组件实现 */}
    </div>
  );
};
`;
        });
        
        return componentCode;
    }

    // 辅助函数：首字母大写
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
    }
}

const configGenerator = new ConfigGenerator();

// 导出方法
module.exports = {
    generateClientConfig: configGenerator.generateClientConfig.bind(configGenerator),
    generateFrontendCode: configGenerator.generateFrontendCode.bind(configGenerator)
};