const configGenerator = require('./configGenerator');

class MultiPlatformService {
  constructor() {
    this.builders = {
      mobile: null,  // 将在后续实现并注入
      pc: null,      // 将在后续实现并注入
      web: null      // 现有web构建器
    };
  }

  /**
   * 设置平台构建器
   * @param {string} platform - 平台类型
   * @param {object} builder - 构建器实例
   */
  setBuilder(platform, builder) {
    if (['mobile', 'pc', 'web'].includes(platform)) {
      this.builders[platform] = builder;
    }
  }

  /**
   * 为指定平台生成客户端配置
   * @param {string} appId - 应用ID
   * @param {string} platform - 平台类型
   * @returns {Promise<object>} 生成的配置
   */
  async generatePlatformConfig(appId, platform = 'web') {
    const baseConfig = await configGenerator.generateBaseConfig(appId);
    
    switch(platform) {
      case 'mobile':
        return this.adaptForMobile(baseConfig);
      case 'pc':
        return this.adaptForPC(baseConfig);
      default:
        return baseConfig;
    }
  }

  /**
   * 适配移动端配置
   * @param {object} config - 基础配置
   * @returns {object} 适配后的移动端配置
   */
  adaptForMobile(config) {
    return {
      ...config,
      platform: 'mobile',
      navigation: 'stack',
      theme: {
        ...config.theme,
        fontSize: {
          ...config.theme.fontSize,
          // 移动端字体大小调整
          large: 20,
          medium: 16,
          small: 14
        },
        spacing: {
          ...config.theme.spacing,
          // 移动端间距调整
          unit: 4
        }
      },
      // 移除不适合移动端的组件
      components: config.components.filter(comp => !['Table', 'Chart'].includes(comp.type))
    };
  }

  /**
   * 适配PC端配置
   * @param {object} config - 基础配置
   * @returns {object} 适配后的PC端配置
   */
  adaptForPC(config) {
    return {
      ...config,
      platform: 'pc',
      navigation: 'sidebar',
      window: {
        defaultWidth: 1200,
        defaultHeight: 800,
        resizable: true
      },
      // PC端特有的桌面集成
      desktopIntegration: {
        notifications: true,
        systemTray: true
      }
    };
  }

  /**
   * 构建所有平台
   * @param {string} appId - 应用ID
   * @returns {Promise<object>} 各平台构建结果
   */
  async buildAllPlatforms(appId) {
    const platforms = ['web', 'mobile', 'pc'];
    const results = {};
    
    for (const platform of platforms) {
      try {
        results[platform] = await this.buildForPlatform(appId, platform);
      } catch (error) {
        results[platform] = { success: false, error: error.message };
      }
    }
    
    return results;
  }

  /**
   * 为指定平台构建
   * @param {string} appId - 应用ID
   * @param {string} platform - 平台类型
   * @returns {Promise<object>} 构建结果
   */
  async buildForPlatform(appId, platform) {
    // 生成平台特定配置
    const config = await this.generatePlatformConfig(appId, platform);
    
    // 如果有对应的构建器，则使用构建器构建
    if (this.builders[platform]) {
      return await this.builders[platform].build(config);
    }
    
    // 否则返回配置作为构建结果
    return {
      success: true,
      platform,
      config,
      message: `配置已生成，等待${platform}平台构建器实现`
    };
  }

  /**
   * 获取构建状态
   * @param {string} appId - 应用ID
   * @param {string} platform - 平台类型
   * @returns {object} 构建状态
   */
  async getBuildStatus(appId, platform = null) {
    // 这里可以实现从数据库获取构建状态的逻辑
    // 暂时返回模拟数据
    if (platform) {
      return {
        appId,
        platform,
        status: 'pending',
        lastBuild: null
      };
    }
    
    // 返回所有平台状态
    const platforms = ['web', 'mobile', 'pc'];
    return platforms.map(p => ({
      appId,
      platform: p,
      status: 'pending',
      lastBuild: null
    }));
  }
}

module.exports = new MultiPlatformService();