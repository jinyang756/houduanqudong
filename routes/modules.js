const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const { v4: uuidv4 } = require('uuid');

// 获取所有模块
router.get('/', async (req, res) => {
    try {
        const modules = await Module.findAll();
        res.json(modules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取单个模块
router.get('/:id', async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);
        if (!module) {
            return res.status(404).json({ error: '模块不存在' });
        }
        res.json(module);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建模块
router.post('/', async (req, res) => {
    try {
        // 生成唯一ID
        const data = {
            ...req.body,
            id: req.body.id || uuidv4()
        };
        const module = await Module.create(data);
        res.status(201).json(module);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 更新模块
router.put('/:id', async (req, res) => {
    try {
        const module = await Module.update(req.params.id, req.body);
        if (!module) {
            return res.status(404).json({ error: '模块不存在' });
        }
        res.json(module);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 删除模块
router.delete('/:id', async (req, res) => {
    try {
        const result = await Module.delete(req.params.id);
        if (result === 0) {
            return res.status(404).json({ error: '模块不存在' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 更新模块状态
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['active', 'inactive', 'draft'].includes(status)) {
            return res.status(400).json({ error: '无效的状态值' });
        }
        const module = await Module.update(req.params.id, { status });
        if (!module) {
            return res.status(404).json({ error: '模块不存在' });
        }
        res.json(module);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;