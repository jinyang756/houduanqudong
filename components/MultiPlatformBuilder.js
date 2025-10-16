import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, Grid, Paper, 
  Button, Checkbox, FormControlLabel, 
  CircularProgress, Alert, Card, CardContent,
  Divider, IconButton, Tooltip
} from '@mui/material';
import { 
  PlayArrow, Cancel, Refresh, Download, 
  Settings, Info, Smartphone, Laptop, Monitor,
  CheckCircle, ErrorCircle
} from '@mui/icons-material';

const MultiPlatformBuilder = ({ appId }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState(['web']);
  const [clientTypes, setClientTypes] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildId, setBuildId] = useState(null);
  const [buildStatus, setBuildStatus] = useState(null);
  const [errors, setErrors] = useState([]);
  const [buildOptions, setBuildOptions] = useState({
    minify: true,
    sourceMap: false,
    debug: false
  });
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    // 加载客户端类型
    loadClientTypes();
  }, []);

  useEffect(() => {
    // 定期检查构建状态
    let interval;
    if (buildId && buildStatus && buildStatus.status !== 'completed' && buildStatus.status !== 'failed') {
      interval = setInterval(() => {
        checkBuildStatus();
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [buildId, buildStatus]);

  const loadClientTypes = async () => {
    try {
      const response = await axios.get('/api/clients/types');
      setClientTypes(response.data);
    } catch (error) {
      console.error('加载客户端类型失败:', error);
      setErrors(['加载客户端类型失败']);
    }
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleOptionChange = (key, value) => {
    setBuildOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const startBuild = async () => {
    if (selectedPlatforms.length === 0) {
      setErrors(['请至少选择一个平台']);
      return;
    }

    setIsBuilding(true);
    setErrors([]);
    setBuildStatus(null);
    
    try {
      const response = await axios.post('/api/clients/build', {
        appId,
        platforms: selectedPlatforms,
        options: buildOptions
      });
      
      setBuildId(response.data.buildId);
      setBuildStatus({
        buildId: response.data.buildId,
        status: 'started',
        progress: 0,
        platforms: response.data.platforms.map(p => ({
          platform: p,
          status: 'pending',
          error: null
        }))
      });
      
      // 立即检查一次状态
      await checkBuildStatus();
    } catch (error) {
      console.error('启动构建失败:', error);
      setErrors(['启动构建失败: ' + (error.response?.data?.message || error.message)]);
    } finally {
      setIsBuilding(false);
    }
  };

  const checkBuildStatus = async () => {
    if (!buildId) return;
    
    try {
      const response = await axios.get(`/api/clients/build/${buildId}/status`);
      setBuildStatus(response.data);
      
      if (response.data.status === 'completed' || response.data.status === 'failed') {
        setBuildId(null);
      }
    } catch (error) {
      console.error('检查构建状态失败:', error);
    }
  };

  const cancelBuild = async () => {
    if (!buildId) return;
    
    try {
      await axios.post(`/api/clients/build/${buildId}/cancel`);
      setBuildStatus(prev => ({
        ...prev,
        status: 'cancelled'
      }));
      setBuildId(null);
    } catch (error) {
      console.error('取消构建失败:', error);
      setErrors(['取消构建失败']);
    }
  };

  const downloadBuild = async (platform) => {
    try {
      const response = await axios.get(`/api/clients/build/${buildId}/download?platform=${platform}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `app-${platform}-build.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('下载构建包失败:', error);
      setErrors(['下载构建包失败']);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'mobile':
        return <Smartphone color="primary" />;
      case 'pc':
        return <Monitor color="primary" />;
      case 'web':
        return <Laptop color="primary" />;
      default:
        return <Info color="primary" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'failed':
        return <ErrorCircle color="error" />;
      case 'in_progress':
        return <CircularProgress size={20} color="primary" />;
      case 'started':
      case 'pending':
        return <Refresh size={20} color="primary" />;
      default:
        return <Info size={20} color="disabled" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'in_progress':
      case 'started':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'disabled';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          多端构建控制台
        </Typography>
        
        {/* 错误提示 */}
        {errors.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {errors.map((error, index) => (
              <Alert key={index} severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            ))}
          </Box>
        )}

        {/* 平台选择区域 */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            选择构建平台
          </Typography>
          
          <Grid container spacing={3}>
            {['web', 'mobile', 'pc'].map((platform) => (
              <Grid item xs={12} sm={6} md={4} key={platform}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedPlatforms.includes(platform)}
                      onChange={() => handlePlatformChange(platform)}
                      disabled={isBuilding}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getPlatformIcon(platform)}
                      <Typography sx={{ ml: 1, textTransform: 'capitalize' }}>
                        {platform === 'web' ? 'Web应用' : 
                         platform === 'mobile' ? '移动端应用' : 'PC桌面应用'}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            ))}
          </Grid>
          
          {/* 构建选项 */}
          <Box sx={{ mt: 3 }}>
            <Button
              variant="text"
              startIcon={<Settings size={16} />}
              onClick={() => setShowOptions(!showOptions)}
              disabled={isBuilding}
            >
              构建选项 {showOptions ? '▲' : '▼'}
            </Button>
            
            {showOptions && (
              <Box sx={{ mt: 2, pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={buildOptions.minify}
                      onChange={(e) => handleOptionChange('minify', e.target.checked)}
                      disabled={isBuilding}
                    />
                  }
                  label="代码压缩"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={buildOptions.sourceMap}
                      onChange={(e) => handleOptionChange('sourceMap', e.target.checked)}
                      disabled={isBuilding}
                    />
                  }
                  label="生成源码映射"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={buildOptions.debug}
                      onChange={(e) => handleOptionChange('debug', e.target.checked)}
                      disabled={isBuilding}
                    />
                  }
                  label="调试模式"
                />
              </Box>
            )}
          </Box>
        </Paper>

        {/* 构建控制按钮 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={startBuild}
            disabled={isBuilding || selectedPlatforms.length === 0}
            size="large"
            sx={{ flexGrow: 1 }}
          >
            {isBuilding ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                启动中...
              </Box>
            ) : (
              '开始构建'
            )}
          </Button>
          
          {buildId && buildStatus && 
           (buildStatus.status === 'started' || buildStatus.status === 'in_progress') && (
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={cancelBuild}
              color="error"
            >
              取消构建
            </Button>
          )}
        </Box>

        {/* 构建状态 */}
        {buildStatus && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              构建状态
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                构建ID: {buildStatus.buildId}
              </Typography>
              <Typography variant="subtitle1">
                总体状态: 
                <Box 
                  component="span" 
                  sx={{ 
                    ml: 1, 
                    color: getStatusColor(buildStatus.status) === 'success' ? 'green' :
                           getStatusColor(buildStatus.status) === 'error' ? 'red' :
                           getStatusColor(buildStatus.status) === 'primary' ? 'primary.main' : 'text.primary'
                  }}
                >
                  {buildStatus.status === 'completed' ? '已完成' :
                   buildStatus.status === 'failed' ? '失败' :
                   buildStatus.status === 'in_progress' ? '进行中' :
                   buildStatus.status === 'started' ? '已启动' :
                   buildStatus.status === 'cancelled' ? '已取消' : buildStatus.status}
                </Box>
              </Typography>
            </Box>
            
            {/* 进度条 */}
            <Box sx={{ width: '100%', mb: 3 }}>
              <Box sx={{ position: 'relative', height: 8, bgcolor: 'divider', borderRadius: 4 }}>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    height: '100%', 
                    borderRadius: 4,
                    bgcolor: 'primary.main',
                    width: `${(buildStatus.progress || 0) * 100}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ float: 'right', mt: 0.5 }}>
                {Math.round((buildStatus.progress || 0) * 100)}%
              </Typography>
            </Box>
            
            {/* 各平台状态 */}
            <Grid container spacing={2}>
              {buildStatus.platforms?.map((item) => (
                <Grid item xs={12} sm={6} key={item.platform}>
                  <Card elevation={1}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getPlatformIcon(item.platform)}
                          <Typography sx={{ ml: 1, textTransform: 'capitalize' }}>
                            {item.platform === 'web' ? 'Web应用' : 
                             item.platform === 'mobile' ? '移动端应用' : 'PC桌面应用'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getStatusIcon(item.status)}
                          <Typography 
                            sx={{ 
                              ml: 1, 
                              color: getStatusColor(item.status) === 'success' ? 'green' :
                                     getStatusColor(item.status) === 'error' ? 'red' :
                                     getStatusColor(item.status) === 'primary' ? 'primary.main' : 'text.primary'
                            }}
                          >
                            {item.status === 'completed' ? '已完成' :
                             item.status === 'failed' ? '失败' :
                             item.status === 'in_progress' ? '进行中' :
                             item.status === 'pending' ? '等待中' : item.status}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {item.error && (
                        <Alert severity="error" sx={{ mt: 1, fontSize: '0.875rem' }}>
                          {item.error}
                        </Alert>
                      )}
                      
                      {item.status === 'completed' && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Download />}
                            onClick={() => downloadBuild(item.platform)}
                          >
                            下载
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* 构建历史 */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            构建历史
          </Typography>
          <Typography variant="body2" color="textSecondary">
            最近的构建历史记录将显示在这里
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default MultiPlatformBuilder;