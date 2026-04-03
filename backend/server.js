const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// AKTools 服务地址（从环境变量读取）
const AKTOOLS_URL = process.env.AKTOOLS_URL || 'http://nb.nblink.cc:15641';
const AKTOOLS_USERNAME = process.env.AKTOOLS_USERNAME || 'akshare';
const AKTOOLS_PASSWORD = process.env.AKTOOLS_PASSWORD || 'akfamily';

// 启用 CORS
app.use(cors());

// 解析 JSON 请求体
app.use(express.json());

// 提供静态文件（前端页面）
app.use(express.static(path.join(__dirname, '../frontend')));

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    aktools_url: AKTOOLS_URL
  });
});

// AKTools API 代理接口
app.get('/api/stock_zh_a_spot', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] 请求股票数据...`);
    
    // 构建请求 URL
    const targetUrl = `${AKTOOLS_URL}/api/public/stock_zh_a_spot`;
    console.log('目标 URL:', targetUrl);
    
    // 创建 Basic Auth 头
    const auth = Buffer.from(`${AKTOOLS_USERNAME}:${AKTOOLS_PASSWORD}`).toString('base64');
    
    // 发起请求
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`AKTools API 返回错误: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`[${new Date().toISOString()}] 成功获取数据，共 ${Array.isArray(data) ? data.length : 1} 条记录`);
    
    // 返回数据
    res.json(data);
    
  } catch (error) {
    console.error('代理请求失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 通用 AKTools API 代理接口（支持所有 AKTools 接口）
app.get('/api/*', async (req, res) => {
  try {
    const apiPath = req.params[0];
    console.log(`[${new Date().toISOString()}] 代理请求: /api/${apiPath}`);
    
    // 构建请求 URL
    const targetUrl = `${AKTOOLS_URL}/api/public/${apiPath}`;
    const queryString = new URLSearchParams(req.query).toString();
    const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;
    
    console.log('目标 URL:', fullUrl);
    
    // 创建 Basic Auth 头
    const auth = Buffer.from(`${AKTOOLS_USERNAME}:${AKTOOLS_PASSWORD}`).toString('base64');
    
    // 发起请求
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`AKTools API 返回错误: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`[${new Date().toISOString()}] 成功获取数据`);
    
    res.json(data);
    
  } catch (error) {
    console.error('代理请求失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 所有其他请求返回前端页面
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================`);
  console.log(`AKTools 代理服务已启动`);
  console.log(`端口: ${PORT}`);
  console.log(`AKTools 地址: ${AKTOOLS_URL}`);
  console.log(`访问地址: http://localhost:${PORT}`);
  console.log(`========================================`);
});
