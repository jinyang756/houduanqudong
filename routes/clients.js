const express = require('express');
const router = express.Router();
const { ClientType, DeviceAdaptation, Module } = require('../models');
const multiPlatformService = require('../services/MultiPlatformService');

/**
 * @swagger
 * /api/clients/types:
 *   get:
 *     summary: 获取所有客户端类型
 *     tags: [Clients]
 *     responses:
 *       200:
 *         description: 客户端类型列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClientType'
 */
router.get('/types', async (req, res) => {
  try {
    const clientTypes = await ClientType.findAll();
    res.json(clientTypes);
  } catch (error) {
    console.error('获取客户端类型失败:', error);
    res.status(500).json({ error: '获取客户端类型失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/clients/types/{id}:
 *   get:
 *     summary: 根据ID获取客户端类型
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 客户端类型详情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientType'
 *       404:
 *         description: 客户端类型不存在
 */
router.get('/types/:id', async (req, res) => {
  try {
    const clientType = await ClientType.findById(req.params.id);
    if (!clientType) {
      return res.status(404).json({ error: '客户端类型不存在' });
    }
    res.json(clientType);
  } catch (error) {
    console.error('获取客户端类型失败:', error);
    res.status(500).json({ error: '获取客户端类型失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/clients/types:
 *   post:
 *     summary: 创建新的客户端类型
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - platform
 *             properties:
 *               name: 
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: [web, mobile, pc]
 *               config_template:
 *                 type: object
 *     responses:
 *       201:
 *         description: 客户端类型创建成功
 *       400:
 *         description: 无效的请求参数
 */
router.post('/types', async (req, res) => {
  try {
    const { name, platform, config_template = {} } = req.body;
    
    // 验证必填字段
    if (!name || !platform) {
      return res.status(400).json({ error: '名称和平台是必填项' });
    }
    
    // 验证平台值
    const validPlatforms = ['web', 'mobile', 'pc'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: '无效的平台类型，必须是 web、mobile 或 pc' });
    }
    
    const newClientType = await ClientType.create({
      id: `client-${Date.now()}`,
      name,
      platform,
      config_template
    });
    
    res.status(201).json(newClientType);
  } catch (error) {
    console.error('创建客户端类型失败:', error);
    res.status(500).json({ error: '创建客户端类型失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/clients/types/{id}:
 *   put:
 *     summary: 更新客户端类型
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: [web, mobile, pc]
 *               config_template:
 *                 type: object
 *     responses:
 *       200:
 *         description: 客户端类型更新成功
 *       404:
 *         description: 客户端类型不存在
 */
router.put('/types/:id', async (req, res) => {
  try {
    const clientType = await ClientType.findById(req.params.id);
    if (!clientType) {
      return res.status(404).json({ error: '客户端类型不存在' });
    }
    
    const { name, platform, config_template } = req.body;
    
    // 更新字段
    if (name !== undefined) clientType.name = name;
    if (platform !== undefined) {
      const validPlatforms = ['web', 'mobile', 'pc'];
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({ error: '无效的平台类型' });
      }
      clientType.platform = platform;
    }
    if (config_template !== undefined) clientType.config_template = config_template;
    
    await clientType.save();
    res.json(clientType);
  } catch (error) {
    console.error('更新客户端类型失败:', error);
    res.status(500).json({ error: '更新客户端类型失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/clients/types/{id}:
 *   delete:
 *     summary: 删除客户端类型
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 客户端类型删除成功
 *       404:
 *         description: 客户端类型不存在
 */
router.delete('/types/:id', async (req, res) => {
  try {
    const clientType = await ClientType.findById(req.params.id);
    if (!clientType) {
      return res.status(404).json({ error: '客户端类型不存在' });
    }
    
    await clientType.destroy();
    res.json({ message: '客户端类型删除成功' });
  } catch (error) {
    console.error('删除客户端类型失败:', error);
    res.status(500).json({ error: '删除客户端类型失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/clients/build:
 *   post:
 *     summary: 构建客户端应用
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appId
 *             properties:
 *               appId:
 *                 type: string
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [web, mobile, pc]
 *               options:
 *                 type: object
 *     responses:
 *       200:
 *         description: 构建任务已开始
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 buildId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   example: started
 *                 platforms:
 *                   type: array
 *       400:
 *         description: 无效的请求参数
 */
router.post('/build', async (req, res) => {
  try {
    const { appId, platforms = ['web'], options = {} } = req.body;
    
    if (!appId) {
      return res.status(400).json({ error: '应用ID是必填项' });
    }
    
    // 验证平台值
    const validPlatforms = ['web', 'mobile', 'pc'];
    const invalidPlatforms = platforms.filter(p => !validPlatforms.includes(p));
    if (invalidPlatforms.length > 0) {
      return res.status(400).json({ error: `无效的平台类型: ${invalidPlatforms.join(', ')}` });
    }
    
    // 开始构建任务
    const buildId = await multiPlatformService.startBuild(appId, platforms, options);
    
    res.json({
      buildId,
      status: 'started',
      platforms,
      message: '构建任务已开始，请稍后查询状态'
    });
  } catch (error) {
    console.error('开始构建失败:', error);
    res.status(500).json({ error: '开始构建失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/clients/build/{buildId}/status:
 *   get:
 *     summary: 查询构建状态
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: buildId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 构建状态信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 buildId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [started, in_progress, completed, failed]
 *                 progress:
 *                   type: number
 *                   example: 0.75
 *                 platforms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       platform:
 *                         type: string
 *                       status:
 *                         type: string
 *                       error:
 *                         type: string
 */
router.get('/build/:buildId/status', async (req, res) => {
  try {
    const { buildId } = req.params;
    
    const status = await multiPlatformService.getBuildStatus(buildId);
    if (!status) {
      return res.status(404).json({ error: '构建任务不存在' });
    }
    
    res.json(status);
  } catch (error) {
    console.error('查询构建状态失败:', error);
    res.status(500).json({ error: '查询构建状态失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/clients/build/{buildId}/cancel:
 *   post:
 *     summary: 取消构建任务
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: buildId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 构建任务已取消
 *       404:
 *         description: 构建任务不存在
 */
router.post('/build/:buildId/cancel', async (req, res) => {
  try {
    const { buildId } = req.params;
    
    const result = await multiPlatformService.cancelBuild(buildId);
    if (!result) {
      return res.status(404).json({ error: '构建任务不存在或已完成' });
    }
    
    res.json({ message: '构建任务已取消' });
  } catch (error) {
    console.error('取消构建任务失败:', error);
    res.status(500).json({ error: '取消构建任务失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/clients/app/{appId}/config:
 *   get:
 *     summary: 获取应用配置
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [web, mobile, pc]
 *           default: web
 *     responses:
 *       200:
 *         description: 应用配置信息
 *       404:
 *         description: 应用不存在
 */
router.get('/app/:appId/config', async (req, res) => {
  try {
    const { appId } = req.params;
    const { platform = 'web' } = req.query;
    
    // 验证平台值
    const validPlatforms = ['web', 'mobile', 'pc'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: '无效的平台类型' });
    }
    
    const config = await multiPlatformService.generateConfig(appId, platform);
    if (!config) {
      return res.status(404).json({ error: '应用配置不存在' });
    }
    
    res.json(config);
  } catch (error) {
    console.error('获取应用配置失败:', error);
    res.status(500).json({ error: '获取应用配置失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/clients/app/{appId}/config:
 *   put:
 *     summary: 更新应用平台配置
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - platform
 *               - config
 *             properties:
 *               platform:
 *                 type: string
 *                 enum: [web, mobile, pc]
 *               config:
 *                 type: object
 *     responses:
 *       200:
 *         description: 配置更新成功
 *       404:
 *         description: 应用不存在
 */
router.put('/app/:appId/config', async (req, res) => {
  try {
    const { appId } = req.params;
    const { platform, config } = req.body;
    
    if (!platform || !config) {
      return res.status(400).json({ error: '平台和配置是必填项' });
    }
    
    const updated = await multiPlatformService.updatePlatformConfig(appId, platform, config);
    if (!updated) {
      return res.status(404).json({ error: '更新配置失败，应用可能不存在' });
    }
    
    res.json({ message: '配置更新成功', config: updated });
  } catch (error) {
    console.error('更新应用配置失败:', error);
    res.status(500).json({ error: '更新应用配置失败', message: error.message });
  }
});

module.exports = router;