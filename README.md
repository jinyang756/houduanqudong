# 后端驱动前端管理系统

这是一个基于模块配置驱动前端的后端管理系统，允许您通过配置模块来生成对应的前端客户端，支持多平台（Web、移动端、PC端）应用的生成。

## 系统功能特性

1. **可视化配置**：通过拖拽和表单配置模块
2. **实时预览**：配置后实时查看效果
3. **版本管理**：模块和页面的版本控制
4. **类型安全**：配置数据的类型验证
5. **扩展性**：支持自定义模块类型
6. **代码生成**：自动生成前端代码
7. **多客户端生成**：支持同时生成Web、移动端(React Native)和PC端(Electron)应用
8. **设备适配管理**：为不同平台配置适配规则
9. **构建状态监控**：实时监控多平台构建任务

## 技术栈

- **后端**：Node.js, Express
- **数据库**：MySQL, Sequelize ORM
- **前端**：
  - Web: React
  - 移动端: React Native (Expo)
  - PC端: Electron
- **UI框架**：Material-UI (管理界面)

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

编辑 `.env` 文件，配置您的数据库连接信息。

### 3. 初始化数据库

确保您的MySQL服务已启动，然后运行：

```bash
node init-db.js
```

### 4. 启动服务器

```bash
npm start
```

## API接口文档

### 模块管理
- GET `/api/modules` - 获取所有模块
- GET `/api/modules/:id` - 获取单个模块
- POST `/api/modules` - 创建新模块
- PUT `/api/modules/:id` - 更新模块
- DELETE `/api/modules/:id` - 删除模块

### 页面管理
- GET `/api/pages` - 获取所有页面
- GET `/api/pages/:id` - 获取单个页面
- POST `/api/pages` - 创建新页面
- PUT `/api/pages/:id` - 更新页面
- DELETE `/api/pages/:id` - 删除页面

### 应用管理
- GET `/api/applications` - 获取所有应用
- GET `/api/applications/:id` - 获取单个应用
- POST `/api/applications` - 创建新应用
- PUT `/api/applications/:id` - 更新应用
- DELETE `/api/applications/:id` - 删除应用

### 数据源管理
- GET `/api/dataSources` - 获取所有数据源
- GET `/api/dataSources/:id` - 获取单个数据源
- POST `/api/dataSources` - 创建新数据源
- PUT `/api/dataSources/:id` - 更新数据源
- DELETE `/api/dataSources/:id` - 删除数据源

### 客户端管理
- GET `/api/clients/types` - 获取所有客户端类型
- GET `/api/clients/types/:id` - 获取单个客户端类型
- POST `/api/clients/types` - 创建新客户端类型
- PUT `/api/clients/types/:id` - 更新客户端类型
- DELETE `/api/clients/types/:id` - 删除客户端类型
- POST `/api/clients/build` - 开始构建任务
- GET `/api/clients/builds` - 获取构建任务列表
- GET `/api/clients/builds/:id` - 获取构建任务状态
- DELETE `/api/clients/builds/:id` - 取消构建任务

### 设备适配管理
- GET `/api/device-adaptations` - 获取所有设备适配配置
- GET `/api/device-adaptations/:id` - 获取单个设备适配配置
- POST `/api/device-adaptations` - 创建新设备适配配置
- PUT `/api/device-adaptations/:id` - 更新设备适配配置
- DELETE `/api/device-adaptations/:id` - 删除设备适配配置
- GET `/api/device-adaptations/module/:moduleId` - 获取指定模块的所有适配配置
- POST `/api/device-adaptations/batch` - 批量创建适配配置
- GET `/api/device-adaptations/export` - 导出适配配置

### 配置生成
- GET `/api/config/:appId` - 获取应用配置
- GET `/api/code/:appId` - 获取生成的前端代码
- GET `/api/code/:appId/:platform` - 获取指定平台的前端代码

## 数据库结构

系统使用MySQL数据库，主要包含以下表：

### modules表
- id: 模块ID
- name: 模块名称
- type: 模块类型（component, service, layout, data）
- config: 模块配置（JSON格式）
- multi_platform_config: 多平台配置（JSON格式）
- version: 模块版本
- status: 状态（active, inactive）

### pages表
- id: 页面ID
- name: 页面名称
- path: 页面路径
- layout_id: 布局ID
- modules: 页面模块配置（JSON格式）
- status: 状态（draft, published）

### applications表
- id: 应用ID
- name: 应用名称
- description: 应用描述
- config: 应用配置（JSON格式）
- version: 应用版本
- status: 应用状态

### data_sources表
- id: 数据源ID
- name: 数据源名称
- type: 数据源类型（api, database, mock）
- config: 数据源配置（JSON格式）
- status: 状态（active, inactive）

### client_types表
- id: 客户端类型ID
- name: 客户端类型名称
- platform: 平台类型（web, mobile, pc）
- framework: 框架名称
- version: 框架版本
- config_template: 配置模板（JSON格式）
- status: 状态（active, inactive）

### device_adaptations表
- id: 适配配置ID
- module_id: 关联模块ID
- client_type_id: 关联客户端类型ID
- adaptation_config: 适配配置（JSON格式）
- created_at: 创建时间
- updated_at: 更新时间

## 使用示例

### 1. 创建一个新的模块

发送POST请求到 `/api/modules`：

```json
{
  "name": "用户列表",
  "type": "component",
  "config": {
    "title": "用户管理",
    "columns": ["id", "name", "email", "role"],
    "dataSource": "userDataSource"
  },
  "multi_platform_config": {
    "mobile": {
      "enabled": true,
      "framework": "react-native",
      "adaptation": {
        "layout": "vertical",
        "components": {}
      }
    },
    "pc": {
      "enabled": true,
      "framework": "electron",
      "adaptation": {
        "window": {
          "width": 1200,
          "height": 800
        }
      }
    }
  },
  "version": "1.0.0"
}
```

### 2. 创建设备适配配置

发送POST请求到 `/api/device-adaptations`：

```json
{
  "module_id": 1,
  "client_type_id": 1,
  "adaptation_config": {
    "layout": "vertical",
    "components": {
      "header": {
        "height": 56,
        "padding": 16
      }
    },
    "styles": {
      "fontSize": {
        "large": 18,
        "medium": 16,
        "small": 14
      }
    }
  }
}
```

### 3. 开始多平台构建

发送POST请求到 `/api/clients/build`：

```json
{
  "application_id": 1,
  "platforms": ["mobile", "pc"],
  "config": {
    "optimize": true,
    "minify": true
  }
}
```

### 4. 获取构建状态

访问 `/api/clients/builds/:buildId` 获取构建任务状态。

## 开发指南

### 项目结构

```
backend-driven-system/
├── app.js                  # 应用入口
├── init-db.js              # 数据库初始化脚本
├── config/                 # 配置文件
│   └── db.js              # 数据库配置
├── models/                 # 数据模型
│   ├── Application.js     # 应用模型
│   ├── ClientType.js      # 客户端类型模型
│   ├── DataSource.js      # 数据源模型
│   ├── DeviceAdaptation.js # 设备适配模型
│   ├── Module.js          # 模块模型
│   └── Page.js            # 页面模型
├── routes/                 # API路由
│   ├── applications.js    # 应用管理路由
│   ├── clients.js         # 客户端管理路由
│   ├── dataSources.js     # 数据源管理路由
│   ├── device-adaptations.js # 设备适配管理路由
│   ├── modules.js         # 模块管理路由
│   └── pages.js           # 页面管理路由
├── services/               # 业务逻辑服务
│   ├── CodeGenerator.js   # 代码生成器
│   ├── MobileBuilder.js   # 移动端构建器
│   ├── MultiPlatformService.js # 多平台服务
│   ├── PCBuilder.js       # PC端构建器
│   └── configGenerator.js # 配置生成器
├── components/             # 前端组件（管理界面）
│   ├── BuildStatusMonitor.js # 构建状态监控组件
│   ├── DeviceAdaptationEditor.js # 设备适配编辑器
│   └── MultiPlatformBuilder.js # 多平台构建器
├── package.json            # 项目配置
└── README.md               # 项目说明
```

## 多平台构建流程

1. **配置准备**：在系统中配置应用、模块和页面
2. **平台适配**：为不同平台配置适配规则
3. **触发构建**：通过API或管理界面触发构建任务
4. **构建执行**：系统根据配置生成各平台代码
5. **状态监控**：实时查看构建进度和状态
6. **获取结果**：下载生成的代码包或部署到目标环境

## 许可证

MIT