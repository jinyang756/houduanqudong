const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { v4: uuidv4 } = require('uuid');

// 获取所有应用
router.get('/', async (req, res) => {
    try {
        const applications = await Application.findAll();
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取单个应用
router.get('/:id', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ error: '应用不存在' });
        }
        res.json(application);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建应用
router.post('/', async (req, res) => {
    try {
        // 生成唯一ID
        const data = {
            ...req.body,
            id: req.body.id || uuidv4()
        };
        const application = await Application.create(data);
        res.status(201).json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 更新应用
router.put('/:id', async (req, res) => {
    try {
        const application = await Application.update(req.params.id, req.body);
        if (!application) {
            return res.status(404).json({ error: '应用不存在' });
        }
        res.json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 删除应用
router.delete('/:id', async (req, res) => {
    try {
        const result = await Application.delete(req.params.id);
        if (result === 0) {
            return res.status(404).json({ error: '应用不存在' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 更新应用状态
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: '无效的状态值' });
        }
        const application = await Application.update(req.params.id, { status });
        if (!application) {
            return res.status(404).json({ error: '应用不存在' });
        }
        res.json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 获取应用配置（用于前端）
router.get('/:id/config', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ error: '应用不存在' });
        }
        res.json(application.config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;