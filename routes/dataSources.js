const express = require('express');
const router = express.Router();
const DataSource = require('../models/DataSource');
const { v4: uuidv4 } = require('uuid');

// 获取所有数据源
router.get('/', async (req, res) => {
    try {
        const dataSources = await DataSource.findAll();
        res.json(dataSources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取单个数据源
router.get('/:id', async (req, res) => {
    try {
        const dataSource = await DataSource.findById(req.params.id);
        if (!dataSource) {
            return res.status(404).json({ error: '数据源不存在' });
        }
        res.json(dataSource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建数据源
router.post('/', async (req, res) => {
    try {
        // 生成唯一ID
        const data = {
            ...req.body,
            id: req.body.id || uuidv4()
        };
        const dataSource = await DataSource.create(data);
        res.status(201).json(dataSource);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 更新数据源
router.put('/:id', async (req, res) => {
    try {
        const dataSource = await DataSource.update(req.params.id, req.body);
        if (!dataSource) {
            return res.status(404).json({ error: '数据源不存在' });
        }
        res.json(dataSource);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 删除数据源
router.delete('/:id', async (req, res) => {
    try {
        const result = await DataSource.delete(req.params.id);
        if (result === 0) {
            return res.status(404).json({ error: '数据源不存在' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 更新数据源状态
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: '无效的状态值' });
        }
        const dataSource = await DataSource.update(req.params.id, { status });
        if (!dataSource) {
            return res.status(404).json({ error: '数据源不存在' });
        }
        res.json(dataSource);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 根据类型获取数据源
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        if (!['api', 'database', 'static'].includes(type)) {
            return res.status(400).json({ error: '无效的数据源类型' });
        }
        const dataSources = await DataSource.findAll({
            where: { type, status: 'active' }
        });
        res.json(dataSources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;