const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const moduleRoutes = require('./routes/modules');
const pageRoutes = require('./routes/pages');
const appRoutes = require('./routes/applications');
const dataSourceRoutes = require('./routes/dataSources');
const { generateClientConfig } = require('./services/configGenerator');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
app.use('/api/modules', moduleRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/applications', appRoutes);
app.use('/api/data-sources', dataSourceRoutes);

// 客户端配置生成接口
app.get('/api/client-config/:appId', async (req, res) => {
    try {
        const { appId } = req.params;
        const clientConfig = await generateClientConfig(appId);
        res.json(clientConfig);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 生成前端代码接口
app.get('/api/generate-code/:appId', async (req, res) => {
    try {
        const { appId } = req.params;
        const { generateFrontendCode } = require('./services/configGenerator');
        const frontendCode = await generateFrontendCode(appId);
        res.send(frontendCode);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '服务运行正常' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;