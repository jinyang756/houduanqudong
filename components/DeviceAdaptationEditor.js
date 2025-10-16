import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, Grid, Paper, 
  Tabs, Tab, Button, TextField, FormControl, 
  InputLabel, Select, MenuItem, Snackbar, 
  Alert, Accordion, AccordionSummary, 
  AccordionDetails, Chip, Divider
} from '@mui/material';
import { 
  Settings, Add, Delete, Save, Edit, 
  ChevronDown, Smartphone, Laptop, Monitor,
  Layout, Box as BoxIcon, Palette, Code
} from '@mui/icons-material';
import { Editor } from '@monaco-editor/react';

const DeviceAdaptationEditor = ({ moduleId }) => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [modules, setModules] = useState([]);
  const [clientTypes, setClientTypes] = useState([]);
  const [adaptations, setAdaptations] = useState({});
  const [selectedPlatform, setSelectedPlatform] = useState('mobile');
  const [isEditing, setIsEditing] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [codeTheme, setCodeTheme] = useState('vs-dark');

  useEffect(() => {
    loadModules();
    loadClientTypes();
  }, []);

  useEffect(() => {
    if (moduleId || selectedModule?.id) {
      loadAdaptations(moduleId || selectedModule.id);
    }
  }, [moduleId, selectedModule]);

  const loadModules = async () => {
    try {
      const response = await axios.get('/api/modules');
      setModules(response.data);
      if (!selectedModule && response.data.length > 0 && !moduleId) {
        setSelectedModule(response.data[0]);
      }
    } catch (error) {
      console.error('加载模块失败:', error);
      showSnackbar('加载模块失败', 'error');
    }
  };

  const loadClientTypes = async () => {
    try {
      const response = await axios.get('/api/clients/types');
      setClientTypes(response.data);
    } catch (error) {
      console.error('加载客户端类型失败:', error);
      showSnackbar('加载客户端类型失败', 'error');
    }
  };

  const loadAdaptations = async (moduleId) => {
    try {
      const response = await axios.get(`/api/device-adaptations?moduleId=${moduleId}`);
      const adaptationsMap = {};
      response.data.forEach(adapt => {
        adaptationsMap[adapt.client_type_id] = adapt;
      });
      setAdaptations(adaptationsMap);
    } catch (error) {
      console.error('加载适配配置失败:', error);
      showSnackbar('加载适配配置失败', 'error');
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleModuleChange = (module) => {
    setSelectedModule(module);
    setAdaptations({});
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    setIsEditing(false);
    setEditingConfig(null);
    setActiveTab(0);
  };

  const getClientTypeForPlatform = (platform) => {
    return clientTypes.find(ct => ct.platform === platform);
  };

  const getCurrentAdaptation = () => {
    const clientType = getClientTypeForPlatform(selectedPlatform);
    if (!clientType) return null;
    return adaptations[clientType.id] || null;
  };

  const startEditing = () => {
    const currentAdaptation = getCurrentAdaptation();
    const clientType = getClientTypeForPlatform(selectedPlatform);
    
    if (!clientType) {
      showSnackbar('找不到对应的客户端类型', 'error');
      return;
    }
    
    setEditingConfig({
      module_id: selectedModule?.id,
      client_type_id: clientType.id,
      adaptation_config: currentAdaptation?.adaptation_config || {
        layout: {
          orientation: selectedPlatform === 'mobile' ? 'portrait' : 'landscape',
          padding: selectedPlatform === 'mobile' ? 16 : 24,
          spacing: selectedPlatform === 'mobile' ? 8 : 16
        },
        components: {},
        responsive: {
          breakpoints: selectedPlatform === 'mobile' ? 
            { small: 375, medium: 414, large: 768 } : 
            { small: 1024, medium: 1440, large: 1920 }
        },
        typography: {
          fontSize: selectedPlatform === 'mobile' ? 14 : 16,
          lineHeight: 1.5
        },
        platform: selectedPlatform
      }
    });
    setIsEditing(true);
  };

  const handleConfigChange = (value, path) => {
    const newValue = JSON.parse(value);
    setEditingConfig(prev => ({
      ...prev,
      adaptation_config: newValue
    }));
  };

  const saveAdaptation = async () => {
    if (!editingConfig || !selectedModule) return;
    
    try {
      const currentAdaptation = getCurrentAdaptation();
      let response;
      
      if (currentAdaptation) {
        // 更新现有配置
        response = await axios.put(`/api/device-adaptations/${currentAdaptation.id}`, editingConfig);
      } else {
        // 创建新配置
        response = await axios.post('/api/device-adaptations', editingConfig);
      }
      
      // 更新本地状态
      setAdaptations(prev => ({
        ...prev,
        [response.data.client_type_id]: response.data
      }));
      
      setIsEditing(false);
      setEditingConfig(null);
      showSnackbar('适配配置保存成功', 'success');
    } catch (error) {
      console.error('保存适配配置失败:', error);
      showSnackbar('保存适配配置失败: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const deleteAdaptation = async () => {
    const adaptation = getCurrentAdaptation();
    if (!adaptation) return;
    
    if (window.confirm('确定要删除这个适配配置吗？')) {
      try {
        await axios.delete(`/api/device-adaptations/${adaptation.id}`);
        setAdaptations(prev => {
          const newAdaptations = { ...prev };
          delete newAdaptations[adaptation.client_type_id];
          return newAdaptations;
        });
        showSnackbar('适配配置已删除', 'info');
      } catch (error) {
        console.error('删除适配配置失败:', error);
        showSnackbar('删除适配配置失败', 'error');
      }
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'mobile':
        return <Smartphone />;
      case 'pc':
        return <Monitor />;
      case 'web':
        return <Laptop />;
      default:
        return <Settings />;
    }
  };

  const getTabIcon = (index) => {
    switch (index) {
      case 0:
        return <Layout size={16} />;
      case 1:
        return <BoxIcon size={16} />;
      case 2:
        return <Palette size={16} />;
      case 3:
        return <Code size={16} />;
      default:
        return null;
    }
  };

  const getTabContent = (index) => {
    if (!editingConfig) return null;
    
    const config = editingConfig.adaptation_config;
    
    switch (index) {
      case 0:
        // 布局配置
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>基本布局设置</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>屏幕方向</InputLabel>
                  <Select
                    value={config.layout.orientation}
                    label="屏幕方向"
                    onChange={(e) => {
                      config.layout.orientation = e.target.value;
                      setEditingConfig(prev => ({ ...prev, adaptation_config: { ...config } }));
                    }}
                  >
                    <MenuItem value="portrait">竖屏</MenuItem>
                    <MenuItem value="landscape">横屏</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="内边距 (px)"
                  type="number"
                  value={config.layout.padding}
                  onChange={(e) => {
                    config.layout.padding = parseInt(e.target.value) || 0;
                    setEditingConfig(prev => ({ ...prev, adaptation_config: { ...config } }));
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="间距 (px)"
                  type="number"
                  value={config.layout.spacing}
                  onChange={(e) => {
                    config.layout.spacing = parseInt(e.target.value) || 0;
                    setEditingConfig(prev => ({ ...prev, adaptation_config: { ...config } }));
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        // 组件适配
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>组件适配设置</Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                为不同组件类型设置特定的适配规则
              </Typography>
            </Box>
            
            <Accordion>
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Typography>响应式断点</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {Object.entries(config.responsive.breakpoints).map(([key, value]) => (
                    <Grid item xs={12} sm={4} key={key}>
                      <TextField
                        fullWidth
                        label={`${key.charAt(0).toUpperCase() + key.slice(1)} (px)`}
                        type="number"
                        value={value}
                        onChange={(e) => {
                          config.responsive.breakpoints[key] = parseInt(e.target.value) || 0;
                          setEditingConfig(prev => ({ ...prev, adaptation_config: { ...config } }));
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        );
      
      case 2:
        // 样式配置
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>排版设置</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="基础字体大小 (px)"
                  type="number"
                  value={config.typography.fontSize}
                  onChange={(e) => {
                    config.typography.fontSize = parseInt(e.target.value) || 16;
                    setEditingConfig(prev => ({ ...prev, adaptation_config: { ...config } }));
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="行高"
                  type="number"
                  step="0.1"
                  value={config.typography.lineHeight}
                  onChange={(e) => {
                    config.typography.lineHeight = parseFloat(e.target.value) || 1.5;
                    setEditingConfig(prev => ({ ...prev, adaptation_config: { ...config } }));
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 3:
        // 代码编辑
        return (
          <Box sx={{ height: 400, mt: 2 }}>
            <Editor
              height="100%"
              language="json"
              theme={codeTheme}
              value={JSON.stringify(editingConfig.adaptation_config, null, 2)}
              onChange={(value) => {
                try {
                  handleConfigChange(value, []);
                } catch (e) {
                  // 无效的JSON，忽略
                }
              }}
              options={{
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                tabSize: 2,
                automaticLayout: true
              }}
            />
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="text"
                size="small"
                onClick={() => setCodeTheme(codeTheme === 'vs-dark' ? 'vs-light' : 'vs-dark')}
              >
                {codeTheme === 'vs-dark' ? '浅色主题' : '深色主题'}
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  const currentAdaptation = getCurrentAdaptation();
  const clientType = getClientTypeForPlatform(selectedPlatform);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          设备适配编辑器
        </Typography>
        
        {/* 模块选择 */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            选择要配置的模块
          </Typography>
          
          <FormControl fullWidth>
            <InputLabel>模块</InputLabel>
            <Select
              value={selectedModule?.id || ''}
              label="模块"
              onChange={(e) => {
                const module = modules.find(m => m.id === e.target.value);
                if (module) handleModuleChange(module);
              }}
            >
              {modules.map(module => (
                <MenuItem key={module.id} value={module.id}>
                  {module.name} ({module.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* 平台选择和操作区 */}
        {selectedModule && (
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={3} alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="subtitle1">
                  当前模块: {selectedModule.name}
                </Typography>
                <Chip 
                  label={selectedModule.type} 
                  size="small" 
                  color="primary" 
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography sx={{ mr: 1 }}>选择平台:</Typography>
                  {['mobile', 'pc', 'web'].filter(p => getClientTypeForPlatform(p)).map(platform => (
                    <Button
                      key={platform}
                      variant={selectedPlatform === platform ? "contained" : "outlined"}
                      startIcon={getPlatformIcon(platform)}
                      onClick={() => handlePlatformChange(platform)}
                      size="small"
                    >
                      {platform === 'web' ? 'Web' : 
                       platform === 'mobile' ? '移动端' : 'PC端'}
                    </Button>
                  ))}
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            {/* 操作按钮 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={startEditing}
                disabled={isEditing || !clientType}
              >
                {currentAdaptation ? '编辑配置' : '创建配置'}
              </Button>
              
              {currentAdaptation && !isEditing && (
                <Button
                  variant="outlined"
                  startIcon={<Delete />}
                  color="error"
                  onClick={deleteAdaptation}
                >
                  删除配置
                </Button>
              )}
              
              {isEditing && (
                <>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={saveAdaptation}
                  >
                    保存
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingConfig(null);
                    }}
                  >
                    取消
                  </Button>
                </>
              )}
            </Box>
            
            {/* 配置编辑器 */}
            {isEditing && (
              <Box>
                <Tabs 
                  value={activeTab} 
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  variant="fullWidth"
                >
                  {['布局', '组件适配', '样式', '代码'].map((label, index) => (
                    <Tab 
                      key={index} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTabIcon(index)}
                          {label}
                        </Box>
                      } 
                    />
                  ))}
                </Tabs>
                
                <Box sx={{ mt: 2 }}>
                  {getTabContent(activeTab)}
                </Box>
              </Box>
            )}
            
            {/* 当前配置展示 */}
            {!isEditing && currentAdaptation && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  当前配置 ({selectedPlatform === 'web' ? 'Web' : 
                               selectedPlatform === 'mobile' ? '移动端' : 'PC端'}):
                </Typography>
                
                <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <pre style={{ overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(currentAdaptation.adaptation_config, null, 2)}
                  </pre>
                </Paper>
              </Box>
            )}
            
            {!isEditing && !currentAdaptation && (
              <Box sx={{ mt: 3, textAlign: 'center', p: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography color="textSecondary">
                  该模块尚未配置 {selectedPlatform === 'web' ? 'Web' : 
                                 selectedPlatform === 'mobile' ? '移动端' : 'PC端'} 适配
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={startEditing}
                  sx={{ mt: 2 }}
                  disabled={!clientType}
                >
                  创建适配配置
                </Button>
              </Box>
            )}
          </Paper>
        )}
      </Box>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DeviceAdaptationEditor;