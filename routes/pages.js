const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const { v4: uuidv4 } = require('uuid');

// 获取所有页面
router.get('/', async (req, res) => {
    try {
        const pages = await Page.findAll();
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取单个页面
router.get('/:id', async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ error: '页面不存在' });
        }
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建页面
router.post('/', async (req, res) => {
    try {
        // 生成唯一ID
        const data = {
            ...req.body,
            id: req.body.id || uuidv4()
        };
        const page = await Page.create(data);
        res.status(201).json(page);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 更新页面
router.put('/:id', async (req, res) => {
    try {
        const page = await Page.update(req.params.id, req.body);
        if (!page) {
            return res.status(404).json({ error: '页面不存在' });
        }
        res.json(page);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 发布页面
router.post('/:id/publish', async (req, res) => {
    try {
        const page = await Page.publish(req.params.id);
        if (!page) {
            return res.status(404).json({ error: '页面不存在' });
        }
        res.json(page);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 删除页面
router.delete('/:id', async (req, res) => {
    try {
        const result = await Page.delete(req.params.id);
        if (result === 0) {
            return res.status(404).json({ error: '页面不存在' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 获取应用下的所有页面
router.get('/app/:appId', async (req, res) => {
    try {
        const { appId } = req.params;
        const pages = await Page.findAll({
            where: { app_id: appId }
        });
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新页面状态
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['published', 'draft', 'archived'].includes(status)) {
            return res.status(400).json({ error: '无效的状态值' });
        }
        const page = await Page.update(req.params.id, { status });
        if (!page) {
            return res.status(404).json({ error: '页面不存在' });
        }
        res.json(page);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;