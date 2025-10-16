import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, Grid, Paper, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Button, TextField,
  CircularProgress, Card, CardContent, CardHeader,
  Divider, Snackbar, Alert, Tabs, Tab, IconButton,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { 
  CheckCircle, Error, Warning, Refresh, 
  Download, Cancel, History, FilterList,
  Clock, Search, ChevronDown, ArrowUpRight,
  FileText, Code, Layers
} from '@mui/icons-material';

const BuildStatusMonitor = () => {
  const [buildJobs, setBuildJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 seconds

  useEffect(() => {
    loadBuildJobs();
  }, []);

  useEffect(() => {
    // 设置自动刷新
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        refreshJobs();
      }, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    // 应用过滤条件
    let results = [...buildJobs];

    // 搜索过滤
    if (searchTerm) {
      results = results.filter(job => 
        job.appId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 状态过滤
    if (filter !== 'all') {
      results = results.filter(job => job.status === filter);
    }

    // 平台过滤
    if (platformFilter !== 'all') {
      results = results.filter(job => job.platform === platformFilter);
    }

    // 时间过滤
    const now = new Date();
    switch (timeFilter) {
      case '1h':
        results = results.filter(job => new Date(job.createdAt) > new Date(now - 60 * 60 * 1000));
        break;
      case '24h':
        results = results.filter(job => new Date(job.createdAt) > new Date(now - 24 * 60 * 60 * 1000));
        break;
      case '7d':
        results = results.filter(job => new Date(job.createdAt) > new Date(now - 7 * 24 * 60 * 60 * 1000));
        break;
      case '30d':
        results = results.filter(job => new Date(job.createdAt) > new Date(now - 30 * 24 * 60 * 60 * 1000));
        break;
      default:
        // 不进行时间过滤
        break;
    }

    // 按创建时间倒序排序
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredJobs(results);
  }, [buildJobs, searchTerm, filter, platformFilter, timeFilter]);

  const loadBuildJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/clients/builds');
      // 模拟数据处理
      const jobs = response.data || getMockBuildJobs();
      setBuildJobs(jobs);
    } catch (error) {
      console.error('加载构建任务失败:', error);
      // 加载模拟数据
      setBuildJobs(getMockBuildJobs());
      showSnackbar('加载构建任务失败，显示模拟数据', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const refreshJobs = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get('/api/clients/builds');
      const jobs = response.data || getMockBuildJobs();
      setBuildJobs(jobs);
      // 更新进行中的任务状态
      updateInProgressJobs(jobs);
    } catch (error) {
      console.error('刷新构建任务失败:', error);
      // 模拟更新进行中的任务
      simulateInProgressUpdates();
    } finally {
      setRefreshing(false);
    }
  };

  const updateInProgressJobs = (newJobs) => {
    // 比较新旧任务，更新状态
    const updatedJobs = [...buildJobs];
    newJobs.forEach(newJob => {
      const index = updatedJobs.findIndex(job => job.id === newJob.id);
      if (index !== -1 && updatedJobs[index].status === 'in_progress') {
        updatedJobs[index] = newJob;
      }
    });
    if (JSON.stringify(updatedJobs) !== JSON.stringify(buildJobs)) {
      setBuildJobs(updatedJobs);
    }
  };

  const simulateInProgressUpdates = () => {
    // 模拟更新进行中的任务进度
    const updatedJobs = buildJobs.map(job => {
      if (job.status === 'in_progress') {
        const newProgress = Math.min(job.progress + Math.floor(Math.random() * 10), 100);
        const newStatus = newProgress >= 100 ? 'success' : 'in_progress';
        return {
          ...job,
          progress: newProgress,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          ...(newStatus === 'success' && {
            artifactUrl: `/downloads/${job.id}.zip`
          })
        };
      }
      return job;
    });
    setBuildJobs(updatedJobs);
  };

  const cancelBuild = async (jobId) => {
    if (window.confirm('确定要取消这个构建任务吗？')) {
      try {
        await axios.post(`/api/clients/builds/${jobId}/cancel`);
        setBuildJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: 'cancelled' } : job
        ));
        showSnackbar('构建任务已取消', 'info');
      } catch (error) {
        console.error('取消构建任务失败:', error);
        // 模拟取消
        setBuildJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: 'cancelled' } : job
        ));
        showSnackbar('取消构建任务失败', 'error');
      }
    }
  };

  const restartBuild = async (job) => {
    try {
      const response = await axios.post('/api/clients/builds', {
        appId: job.appId,
        platform: job.platform,
        name: job.name
      });
      setBuildJobs(prev => [response.data, ...prev]);
      showSnackbar('构建任务已重启', 'success');
    } catch (error) {
      console.error('重启构建任务失败:', error);
      showSnackbar('重启构建任务失败', 'error');
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime) return '--';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end - start;
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Error color="error" />;
      case 'in_progress':
        return <Clock color="primary" />;
      case 'queued':
        return <Refresh color="default" />;
      case 'cancelled':
        return <Cancel color="warning" />;
      default:
        return <Warning color="warning" />;
    }
  };

  const getStatusChip = (status) => {
    const colorMap = {
      success: 'success',
      failed: 'error',
      in_progress: 'primary',
      queued: 'default',
      cancelled: 'warning'
    };

    const labelMap = {
      success: '成功',
      failed: '失败',
      in_progress: '进行中',
      queued: '排队中',
      cancelled: '已取消'
    };

    return (
      <Chip
        icon={getStatusIcon(status)}
        label={labelMap[status] || status}
        color={colorMap[status] || 'default'}
        size="small"
        variant="outlined"
      />
    );
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'mobile':
        return <span style={{ fontSize: '16px' }}>📱</span>;
      case 'pc':
        return <span style={{ fontSize: '16px' }}>💻</span>;
      case 'web':
        return <span style={{ fontSize: '16px' }}>🌐</span>;
      default:
        return <Layers size={16} />;
    }
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setActiveTab(0);
  };

  const getTabContent = (index) => {
    if (!selectedJob) return null;

    switch (index) {
      case 0:
        // 基本信息
        return (
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">任务ID</Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                  {selectedJob.id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">应用ID</Typography>
                <Typography variant="body1">{selectedJob.appId}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">应用名称</Typography>
                <Typography variant="body1">{selectedJob.name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">平台</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getPlatformIcon(selectedJob.platform)}
                  <Typography variant="body1">
                    {selectedJob.platform === 'web' ? 'Web' : 
                     selectedJob.platform === 'mobile' ? '移动端' : 'PC端'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">创建时间</Typography>
                <Typography variant="body1">{formatDateTime(selectedJob.createdAt)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">完成时间</Typography>
                <Typography variant="body1">
                  {selectedJob.finishedAt ? formatDateTime(selectedJob.finishedAt) : '--'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">构建时长</Typography>
                <Typography variant="body1">
                  {formatDuration(selectedJob.createdAt, selectedJob.finishedAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">构建状态</Typography>
                {getStatusChip(selectedJob.status)}
              </Grid>
              {selectedJob.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">描述</Typography>
                  <Typography variant="body1">{selectedJob.description}</Typography>
                </Grid>
              )}
              {selectedJob.artifactUrl && selectedJob.status === 'success' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">构建产物</Typography>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    href={selectedJob.artifactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    下载产物
                  </Button>
                </Grid>
              )}
            </Grid>
          </CardContent>
        );
      case 1:
        // 构建日志
        return (
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="subtitle2">构建日志</Typography>
            </Box>
            <Box 
              sx={{ 
                p: 2, 
                maxHeight: 400, 
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                bgcolor: '#1e1e1e',
                color: '#d4d4d4'
              }}
            >
              {selectedJob.logs ? (
                <pre style={{ margin: 0 }}>{selectedJob.logs}</pre>
              ) : (
                <Typography>暂无日志信息</Typography>
              )}
            </Box>
          </CardContent>
        );
      case 2:
        // 构建配置
        return (
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>构建配置</Typography>
            <Box 
              sx={{ 
                maxHeight: 400, 
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                p: 2,
                bgcolor: '#f5f5f5',
                borderRadius: 1
              }}
            >
              {selectedJob.config ? (
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(selectedJob.config, null, 2)}
                </pre>
              ) : (
                <Typography>暂无配置信息</Typography>
              )}
            </Box>
          </CardContent>
        );
      default:
        return null;
    }
  };

  // 模拟构建任务数据
  const getMockBuildJobs = () => [
    {
      id: 'build-001',
      appId: 'app-001',
      name: '示例应用',
      description: '企业管理系统演示版',
      platform: 'web',
      status: 'success',
      progress: 100,
      config: { platform: 'web', framework: 'react', version: '18.2.0' },
      logs: '开始构建...\n安装依赖...\n编译代码...\n打包完成',
      artifactUrl: '/downloads/build-001.zip',
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      finishedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString()
    },
    {
      id: 'build-002',
      appId: 'app-001',
      name: '示例应用',
      description: '企业管理系统演示版',
      platform: 'mobile',
      status: 'in_progress',
      progress: 65,
      config: { platform: 'mobile', framework: 'react-native', version: '0.72.0' },
      logs: '开始构建...\n安装依赖...\n配置原生环境...\n打包资源...',
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 1000).toISOString()
    },
    {
      id: 'build-003',
      appId: 'app-002',
      name: '数据分析工具',
      platform: 'pc',
      status: 'failed',
      progress: 100,
      config: { platform: 'pc', framework: 'electron', version: '25.0.0' },
      logs: '开始构建...\n安装依赖...\n编译失败: 缺少必要模块',
      error: '模块依赖错误',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      finishedAt: new Date(Date.now() - 58 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 58 * 60 * 1000).toISOString()
    },
    {
      id: 'build-004',
      appId: 'app-003',
      name: '用户管理系统',
      platform: 'web',
      status: 'queued',
      progress: 0,
      config: { platform: 'web', framework: 'vue', version: '3.2.0' },
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: 'build-005',
      appId: 'app-001',
      name: '示例应用',
      platform: 'pc',
      status: 'cancelled',
      progress: 30,
      config: { platform: 'pc', framework: 'electron', version: '25.0.0' },
      logs: '开始构建...\n安装依赖...\n用户取消构建',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      finishedAt: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString()
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          构建状态监控
        </Typography>
        
        {/* 搜索和过滤区 */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4} lg={5}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Search sx={{ mr: 1, color: 'action.active', display: 'flex' }} />
                <TextField
                  fullWidth
                  placeholder="搜索应用ID或名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8} lg={7}>
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item xs={6} sm={4} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>状态</InputLabel>
                    <Select
                      value={filter}
                      label="状态"
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <MenuItem value="all">全部</MenuItem>
                      <MenuItem value="success">成功</MenuItem>
                      <MenuItem value="failed">失败</MenuItem>
                      <MenuItem value="in_progress">进行中</MenuItem>
                      <MenuItem value="queued">排队中</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>平台</InputLabel>
                    <Select
                      value={platformFilter}
                      label="平台"
                      onChange={(e) => setPlatformFilter(e.target.value)}
                    >
                      <MenuItem value="all">全部</MenuItem>
                      <MenuItem value="web">Web</MenuItem>
                      <MenuItem value="mobile">移动端</MenuItem>
                      <MenuItem value="pc">PC端</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>时间范围</InputLabel>
                    <Select
                      value={timeFilter}
                      label="时间范围"
                      onChange={(e) => setTimeFilter(e.target.value)}
                    >
                      <MenuItem value="1h">1小时内</MenuItem>
                      <MenuItem value="24h">24小时内</MenuItem>
                      <MenuItem value="7d">7天内</MenuItem>
                      <MenuItem value="30d">30天内</MenuItem>
                      <MenuItem value="all">全部</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6} sm={4} md={3} sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
                    onClick={refreshJobs}
                    disabled={refreshing}
                    fullWidth
                  >
                    刷新
                  </Button>
                  
                  <Button
                    variant={autoRefresh ? "contained" : "outlined"}
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    size="small"
                    sx={{ minWidth: 'auto', padding: '0 10px' }}
                  >
                    {autoRefresh ? '停止' : '自动'}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* 构建任务列表 */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={selectedJob ? 7 : 12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">构建任务列表</Typography>
                <Typography variant="body2" color="textSecondary">
                  共 {filteredJobs.length} 个任务
                </Typography>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>应用名称</TableCell>
                        <TableCell>平台</TableCell>
                        <TableCell>状态</TableCell>
                        <TableCell>进度</TableCell>
                        <TableCell>创建时间</TableCell>
                        <TableCell>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredJobs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                            暂无符合条件的构建任务
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredJobs.map((job) => (
                          <TableRow 
                            key={job.id} 
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                              backgroundColor: selectedJob?.id === job.id ? 'rgba(0, 0, 0, 0.08)' : 'transparent'
                            }}
                            onClick={() => handleJobClick(job)}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" fontWeight="medium">
                                  {job.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {job.appId}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getPlatformIcon(job.platform)}
                                <Typography variant="body2">
                                  {job.platform === 'web' ? 'Web' : 
                                   job.platform === 'mobile' ? '移动端' : 'PC端'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {getStatusChip(job.status)}
                            </TableCell>
                            <TableCell>
                              {job.status === 'in_progress' ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 80, height: 6, bgcolor: 'grey.200', borderRadius: 3 }}>
                                    <Box 
                                      sx={{ 
                                        width: `${job.progress}%`, 
                                        height: '100%', 
                                        bgcolor: 'primary.main',
                                        borderRadius: 3
                                      }}
                                    />
                                  </Box>
                                  <Typography variant="caption">{job.progress}%</Typography>
                                </Box>
                              ) : job.status === 'success' ? (
                                <Typography variant="body2" color="success.main">100%</Typography>
                              ) : (
                                <Typography variant="body2" color="textSecondary">--</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {formatDateTime(job.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                {job.status === 'in_progress' && (
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cancelBuild(job.id);
                                    }}
                                    title="取消构建"
                                  >
                                    <Cancel size={16} />
                                  </IconButton>
                                )}
                                
                                {(job.status === 'failed' || job.status === 'cancelled') && (
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      restartBuild(job);
                                    }}
                                    title="重新构建"
                                  >
                                    <Refresh size={16} />
                                  </IconButton>
                                )}
                                
                                {job.status === 'success' && job.artifactUrl && (
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(job.artifactUrl, '_blank');
                                    }}
                                    title="下载产物"
                                  >
                                    <Download size={16} />
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>

          {/* 任务详情 */}
          {selectedJob && (
            <Grid item xs={12} md={5}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6">任务详情</Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => setSelectedJob(null)}
                        title="关闭详情"
                      >
                        <ArrowUpRight size={18} />
                      </IconButton>
                    </Box>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {selectedJob.name} ({selectedJob.platform})
                      </Typography>
                      {getStatusChip(selectedJob.status)}
                    </Box>
                  }
                  sx={{ pb: 1 }}
                />
                
                <Divider />
                
                <Tabs 
                  value={activeTab} 
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  variant="fullWidth"
                  sx={{ mt: 1 }}
                >
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FileText size={16} />
                        基本信息
                      </Box>
                    } 
                  />
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <History size={16} />
                        构建日志
                      </Box>
                    } 
                  />
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Code size={16} />
                        配置
                      </Box>
                    } 
                  />
                </Tabs>
                
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                  {getTabContent(activeTab)}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
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

export default BuildStatusMonitor;