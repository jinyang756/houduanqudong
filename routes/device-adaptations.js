const express = require('express');
const router = express.Router();
const { DeviceAdaptation, Module, ClientType } = require('../models');

/**
 * @swagger
 * /api/device-adaptations:
 *   get:
 *     summary: 获取所有设备适配配置
 *     tags: [Device Adaptations]
 *     parameters:
 *       - in: query
 *         name: moduleId
 *         schema:
 *           type: string
 *         description: 模块ID筛选
 *       - in: query
 *         name: clientTypeId
 *         schema:
 *           type: string
 *         description: 客户端类型ID筛选
 *     responses:
 *       200:
 *         description: 设备适配配置列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeviceAdaptation'
 */
router.get('/', async (req, res) => {
  try {
    const { moduleId, clientTypeId } = req.query;
    
    let adaptations;
    if (moduleId) {
      adaptations = await DeviceAdaptation.findByModuleId(moduleId);
    } else {
      adaptations = await DeviceAdaptation.findAll();
    }
    
    // 如果指定了客户端类型ID，进行进一步筛选
    if (clientTypeId) {
      adaptations = adaptations.filter(adapt => adapt.client_type_id === clientTypeId);
    }
    
    res.json(adaptations);
  } catch (error) {
    console.error('获取设备适配配置失败:', error);
    res.status(500).json({ error: '获取设备适配配置失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/device-adaptations/{id}:
 *   get:
 *     summary: 根据ID获取设备适配配置
 *     tags: [Device Adaptations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 设备适配配置详情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceAdaptation'
 *       404:
 *         description: 设备适配配置不存在
 */
router.get('/:id', async (req, res) => {
  try {
    const adaptation = await DeviceAdaptation.findById(req.params.id);
    if (!adaptation) {
      return res.status(404).json({ error: '设备适配配置不存在' });
    }
    
    // 获取关联的模块和客户端类型信息
    const module = await Module.findById(adaptation.module_id);
    const clientType = await ClientType.findById(adaptation.client_type_id);
    
    res.json({
      ...adaptation.toJSON ? adaptation.toJSON() : adaptation,
      module: module || null,
      clientType: clientType || null
    });
  } catch (error) {
    console.error('获取设备适配配置失败:', error);
    res.status(500).json({ error: '获取设备适配配置失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/device-adaptations:
 *   post:
 *     summary: 创建新的设备适配配置
 *     tags: [Device Adaptations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - module_id
 *               - client_type_id
 *               - adaptation_config
 *             properties:
 *               module_id:
 *                 type: string
 *               client_type_id:
 *                 type: string
 *               adaptation_config:
 *                 type: object
 *     responses:
 *       201:
 *         description: 设备适配配置创建成功
 *       400:
 *         description: 无效的请求参数
 *       404:
 *         description: 模块或客户端类型不存在
 */
router.post('/', async (req, res) => {
  try {
    const { module_id, client_type_id, adaptation_config } = req.body;
    
    // 验证必填字段
    if (!module_id || !client_type_id || !adaptation_config) {
      return res.status(400).json({ error: '模块ID、客户端类型ID和适配配置是必填项' });
    }
    
    // 验证模块和客户端类型是否存在
    const moduleExists = await Module.findById(module_id);
    const clientTypeExists = await ClientType.findById(client_type_id);
    
    if (!moduleExists) {
      return res.status(404).json({ error: '指定的模块不存在' });
    }
    
    if (!clientTypeExists) {
      return res.status(404).json({ error: '指定的客户端类型不存在' });
    }
    
    // 检查是否已存在相同模块和客户端类型的适配配置
    const existingAdaptations = await DeviceAdaptation.findAll();
    const existing = existingAdaptations.find(
      adapt => adapt.module_id === module_id && adapt.client_type_id === client_type_id
    );
    
    if (existing) {
      return res.status(400).json({ error: '该模块和客户端类型的适配配置已存在' });
    }
    
    const newAdaptation = await DeviceAdaptation.create({
      id: `adapt-${Date.now()}`,
      module_id,
      client_type_id,
      adaptation_config
    });
    
    res.status(201).json(newAdaptation);
  } catch (error) {
    console.error('创建设备适配配置失败:', error);
    res.status(500).json({ error: '创建设备适配配置失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/device-adaptations/{id}:
 *   put:
 *     summary: 更新设备适配配置
 *     tags: [Device Adaptations]
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
 *               module_id:
 *                 type: string
 *               client_type_id:
 *                 type: string
 *               adaptation_config:
 *                 type: object
 *     responses:
 *       200:
 *         description: 设备适配配置更新成功
 *       400:
 *         description: 无效的请求参数
 *       404:
 *         description: 设备适配配置不存在
 */
router.put('/:id', async (req, res) => {
  try {
    const adaptation = await DeviceAdaptation.findById(req.params.id);
    if (!adaptation) {
      return res.status(404).json({ error: '设备适配配置不存在' });
    }
    
    const { module_id, client_type_id, adaptation_config } = req.body;
    
    // 如果要更新模块ID或客户端类型ID，需要验证
    if (module_id !== undefined && module_id !== adaptation.module_id) {
      const moduleExists = await Module.findById(module_id);
      if (!moduleExists) {
        return res.status(404).json({ error: '指定的模块不存在' });
      }
    }
    
    if (client_type_id !== undefined && client_type_id !== adaptation.client_type_id) {
      const clientTypeExists = await ClientType.findById(client_type_id);
      if (!clientTypeExists) {
        return res.status(404).json({ error: '指定的客户端类型不存在' });
      }
    }
    
    // 检查是否会导致重复配置
    if ((module_id !== undefined || client_type_id !== undefined)) {
      const newModuleId = module_id !== undefined ? module_id : adaptation.module_id;
      const newClientTypeId = client_type_id !== undefined ? client_type_id : adaptation.client_type_id;
      
      const existingAdaptations = await DeviceAdaptation.findAll();
      const existing = existingAdaptations.find(
        adapt => adapt.id !== adaptation.id && 
                 adapt.module_id === newModuleId && 
                 adapt.client_type_id === newClientTypeId
      );
      
      if (existing) {
        return res.status(400).json({ error: '该模块和客户端类型的适配配置已存在' });
      }
    }
    
    // 更新字段
    if (module_id !== undefined) adaptation.module_id = module_id;
    if (client_type_id !== undefined) adaptation.client_type_id = client_type_id;
    if (adaptation_config !== undefined) adaptation.adaptation_config = adaptation_config;
    
    await adaptation.save();
    res.json(adaptation);
  } catch (error) {
    console.error('更新设备适配配置失败:', error);
    res.status(500).json({ error: '更新设备适配配置失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/device-adaptations/{id}:
 *   delete:
 *     summary: 删除设备适配配置
 *     tags: [Device Adaptations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 设备适配配置删除成功
 *       404:
 *         description: 设备适配配置不存在
 */
router.delete('/:id', async (req, res) => {
  try {
    const adaptation = await DeviceAdaptation.findById(req.params.id);
    if (!adaptation) {
      return res.status(404).json({ error: '设备适配配置不存在' });
    }
    
    await adaptation.destroy();
    res.json({ message: '设备适配配置删除成功' });
  } catch (error) {
    console.error('删除设备适配配置失败:', error);
    res.status(500).json({ error: '删除设备适配配置失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/device-adaptations/batch:
 *   post:
 *     summary: 批量创建或更新设备适配配置
 *     tags: [Device Adaptations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 module_id:
 *                   type: string
 *                 client_type_id:
 *                   type: string
 *                 adaptation_config:
 *                   type: object
 *     responses:
 *       200:
 *         description: 批量操作成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 created:
 *                   type: array
 *                 updated:
 *                   type: array
 *                 errors:
 *                   type: array
 */
router.post('/batch', async (req, res) => {
  try {
    const adaptations = req.body;
    if (!Array.isArray(adaptations)) {
      return res.status(400).json({ error: '请求体必须是数组格式' });
    }
    
    const results = {
      created: [],
      updated: [],
      errors: []
    };
    
    for (const item of adaptations) {
      try {
        const { id, module_id, client_type_id, adaptation_config } = item;
        
        // 验证必填字段
        if (!module_id || !client_type_id || !adaptation_config) {
          results.errors.push({
            item,
            error: '模块ID、客户端类型ID和适配配置是必填项'
          });
          continue;
        }
        
        // 验证模块和客户端类型
        const moduleExists = await Module.findById(module_id);
        const clientTypeExists = await ClientType.findById(client_type_id);
        
        if (!moduleExists || !clientTypeExists) {
          results.errors.push({
            item,
            error: '模块或客户端类型不存在'
          });
          continue;
        }
        
        if (id) {
          // 更新现有配置
          const existing = await DeviceAdaptation.findById(id);
          if (existing) {
            // 检查是否会导致重复
            const existingAdaptations = await DeviceAdaptation.findAll();
            const duplicate = existingAdaptations.find(
              adapt => adapt.id !== id && 
                       adapt.module_id === module_id && 
                       adapt.client_type_id === client_type_id
            );
            
            if (duplicate) {
              results.errors.push({
                item,
                error: '该模块和客户端类型的适配配置已存在'
              });
              continue;
            }
            
            existing.module_id = module_id;
            existing.client_type_id = client_type_id;
            existing.adaptation_config = adaptation_config;
            
            await existing.save();
            results.updated.push(existing);
          } else {
            results.errors.push({
              item,
              error: '指定的适配配置不存在'
            });
          }
        } else {
          // 创建新配置
          const existingAdaptations = await DeviceAdaptation.findAll();
          const existing = existingAdaptations.find(
            adapt => adapt.module_id === module_id && adapt.client_type_id === client_type_id
          );
          
          if (existing) {
            results.errors.push({
              item,
              error: '该模块和客户端类型的适配配置已存在'
            });
            continue;
          }
          
          const newAdaptation = await DeviceAdaptation.create({
            id: `adapt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            module_id,
            client_type_id,
            adaptation_config
          });
          results.created.push(newAdaptation);
        }
      } catch (error) {
        results.errors.push({
          item,
          error: error.message
        });
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error('批量操作设备适配配置失败:', error);
    res.status(500).json({ error: '批量操作失败', message: error.message });
  }
});

/**
 * @swagger
 * /api/device-adaptations/export:
 *   get:
 *     summary: 导出设备适配配置
 *     tags: [Device Adaptations]
 *     parameters:
 *       - in: query
 *         name: moduleId
 *         schema:
 *           type: string
 *         description: 模块ID筛选
 *     responses:
 *       200:
 *         description: 导出的适配配置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 adaptations:
 *                   type: array
 *                 exportDate:
 *                   type: string
 *                   format: date-time
 */
router.get('/export', async (req, res) => {
  try {
    const { moduleId } = req.query;
    
    let adaptations;
    if (moduleId) {
      adaptations = await DeviceAdaptation.findByModuleId(moduleId);
    } else {
      adaptations = await DeviceAdaptation.findAll();
    }
    
    // 丰富导出数据，包含关联信息
    const enrichedAdaptations = await Promise.all(
      adaptations.map(async (adapt) => {
        const module = await Module.findById(adapt.module_id);
        const clientType = await ClientType.findById(adapt.client_type_id);
        
        return {
          id: adapt.id,
          module_id: adapt.module_id,
          module_name: module ? module.name : 'Unknown',
          client_type_id: adapt.client_type_id,
          client_type_name: clientType ? clientType.name : 'Unknown',
          client_type_platform: clientType ? clientType.platform : 'Unknown',
          adaptation_config: adapt.adaptation_config,
          createdAt: adapt.createdAt || new Date().toISOString()
        };
      })
    );
    
    res.json({
      adaptations: enrichedAdaptations,
      exportDate: new Date().toISOString(),
      count: enrichedAdaptations.length
    });
  } catch (error) {
    console.error('导出设备适配配置失败:', error);
    res.status(500).json({ error: '导出失败', message: error.message });
  }
});

module.exports = router;