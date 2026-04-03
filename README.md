# AKTools A股股票数据查看器

这是一个基于 Docker 快速部署的 A股股票数据查看应用，通过代理服务访问 AKTools API，解决跨域问题，提供美观的 Web 界面。

## 📋 目录

- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [部署方式](#部署方式)
- [开发指南](#开发指南)
- [API 文档](#api-文档)
- [故障排查](#故障排查)

## ✨ 功能特性

- ✅ **Docker 快速部署** - 一键启动，开箱即用
- ✅ **解决跨域问题** - 内置代理服务，无需额外配置
- ✅ **服务健康检查** - 自动检测服务和 AKTools 连接状态
- ✅ **实时数据展示** - 所有 A 股实时行情数据
- ✅ **数据统计** - 自动统计涨跌股票数量
- ✅ **搜索过滤** - 快速查找特定股票
- ✅ **响应式设计** - 支持各种屏幕尺寸
- ✅ **美观 UI** - 现代化渐变设计

## 🚀 快速开始

### 方式一：使用 Docker Compose（推荐）

```bash
# 1. 克隆或下载项目
git clone <repository-url>
cd Riemann-Stock

# 2. 配置环境变量（可选）
cp .env.example .env
# 编辑 .env 文件，修改 AKTools 服务地址和认证信息

# 3. 启动服务
docker-compose up -d

# 4. 访问应用
打开浏览器访问: http://localhost:3000
```

### 方式二：使用 Docker 命令

```bash
# 1. 构建镜像
docker build -t aktools-stock-viewer .

# 2. 运行容器
docker run -d \
  --name aktools-stock-viewer \
  -p 3000:3000 \
  -e AKTOOLS_URL=http://nb.nblink.cc:15641 \
  -e AKTOOLS_USERNAME=akshare \
  -e AKTOOLS_PASSWORD=akfamily \
  aktools-stock-viewer

# 3. 访问应用
打开浏览器访问: http://localhost:3000
```

### 方式三：本地开发模式

```bash
# 1. 安装依赖
cd backend
npm install

# 2. 配置环境变量
export AKTOOLS_URL=http://nb.nblink.cc:15641
export AKTOOLS_USERNAME=akshare
export AKTOOLS_PASSWORD=akfamily

# 3. 启动服务
npm start

# 4. 访问应用
打开浏览器访问: http://localhost:3000
```

## ⚙️ 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | `3000` |
| `AKTOOLS_URL` | AKTools 服务地址 | `http://nb.nblink.cc:15641` |
| `AKTOOLS_USERNAME` | AKTools 用户名 | `akshare` |
| `AKTOOLS_PASSWORD` | AKTools 密码 | `akfamily` |

### 配置文件

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
AKTOOLS_URL=http://nb.nblink.cc:15641
AKTOOLS_USERNAME=akshare
AKTOOLS_PASSWORD=akfamily
```

## 📦 部署方式

### Docker Compose 部署（生产推荐）

**优点：**
- 简化部署流程
- 自动重启
- 健康检查
- 易于扩展

**配置文件 `docker-compose.yml`：**

```yaml
version: '3.8'

services:
  aktools-web:
    build: .
    container_name: aktools-stock-viewer
    ports:
      - "3000:3000"
    environment:
      - AKTOOLS_URL=http://nb.nblink.cc:15641
      - AKTOOLS_USERNAME=akshare
      - AKTOOLS_PASSWORD=akfamily
      - PORT=3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**启动命令：**

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart
```

### Kubernetes 部署

创建 `k8s-deployment.yaml`：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aktools-stock-viewer
spec:
  replicas: 2
  selector:
    matchLabels:
      app: aktools-stock-viewer
  template:
    metadata:
      labels:
        app: aktools-stock-viewer
    spec:
      containers:
      - name: aktools-stock-viewer
        image: aktools-stock-viewer:latest
        ports:
        - containerPort: 3000
        env:
        - name: AKTOOLS_URL
          value: "http://nb.nlink.cc:15641"
        - name: AKTOOLS_USERNAME
          valueFrom:
            secretKeyRef:
              name: aktools-secret
              key: username
        - name: AKTOOLS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: aktools-secret
              key: password
---
apiVersion: v1
kind: Service
metadata:
  name: aktools-stock-viewer
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: aktools-stock-viewer
```

## 🛠️ 开发指南

### 项目结构

```
Riemann-Stock/
├── backend/              # 后端代理服务
│   ├── server.js        # Express 服务器
│   └── package.json     # Node.js 依赖
├── frontend/            # 前端静态文件
│   └── index.html       # Web 界面
├── Dockerfile           # Docker 镜像配置
├── docker-compose.yml   # Docker Compose 配置
├── .env.example         # 环境变量示例
├── .gitignore           # Git 忽略文件
└── README.md            # 项目说明文档
```

### 技术栈

**后端：**
- Node.js 16+
- Express.js
- CORS
- node-fetch

**前端：**
- HTML5 + CSS3 + JavaScript
- 响应式设计
- 无需框架，纯原生实现

### 本地开发

```bash
# 1. 安装后端依赖
cd backend
npm install

# 2. 开发模式启动（支持热重载）
npm run dev

# 3. 修改前端文件
# 编辑 frontend/index.html

# 4. 刷新浏览器查看效果
```

## 📚 API 文档

### 健康检查

**接口：** `GET /health`

**描述：** 检查服务状态

**响应：**

```json
{
  "status": "ok",
  "timestamp": "2026-04-03T10:07:00.000Z",
  "aktools_url": "http://nb.nlink.cc:15641"
}
```

### 获取股票数据

**接口：** `GET /api/stock_zh_a_spot`

**描述：** 获取所有 A 股实时行情数据

**参数：** 无

**响应示例：**

```json
[
  {
    "代码": "sh600000",
    "名称": "浦发银行",
    "最新价": 10.20,
    "涨跌额": 0.55,
    "涨跌幅": 5.70,
    "买入": 10.20,
    "卖出": 10.21,
    "昨收": 9.65,
    "今开": 9.70,
    "最高": 10.29,
    "最低": 9.68,
    "成交量": 149422915,
    "成交额": 1501459278.0,
    "时间戳": "15:00:00"
  }
]
```

### 通用代理接口

**接口：** `GET /api/:path`

**描述：** 代理所有 AKTools API 请求

**示例：**

```bash
# 获取股票历史数据
curl "http://localhost:3000/api/stock_zh_a_hist?symbol=600000&period=daily"

# 获取其他 AKTools 接口数据
curl "http://localhost:3000/api/<interface_name>?param1=value1&param2=value2"
```

## 🔧 故障排查

### 问题 1: 无法访问应用

**检查步骤：**

1. 确认容器是否运行：

```bash
docker ps | grep aktools-stock-viewer
```

2. 查看容器日志：

```bash
docker logs aktools-stock-viewer
```

3. 检查端口是否被占用：

```bash
lsof -i :3000
```

### 问题 2: 服务状态显示"连接失败"

**可能原因：**
- 代理服务未启动
- AKTools 服务地址配置错误
- AKTools 服务不可访问

**解决方法：**

1. 检查 AKTools 服务是否可访问：

```bash
curl http://nb.nblink.cc:15641/api/public/stock_zh_a_spot
```

2. 检查环境变量配置：

```bash
docker exec aktools-stock-viewer env | grep AKTOOLS
```

3. 查看详细错误日志：

```bash
docker logs -f aktools-stock-viewer
```

### 问题 3: 数据加载失败

**可能原因：**
- AKTools 认证失败
- 网络连接问题
- API 限流

**解决方法：**

1. 检查认证信息是否正确
2. 查看浏览器控制台错误信息
3. 检查网络连接
4. 等待一段时间后重试（可能被限流）

### 问题 4: 跨域错误

**说明：**
本项目已通过代理服务解决跨域问题，不应该出现跨域错误。如果仍然遇到：

**解决方法：**
- 确保访问的是代理服务地址（如 http://localhost:3000）
- 不要直接打开 HTML 文件（file:// 协议）
- 清除浏览器缓存

## 📝 注意事项

1. **数据更新频率**：新浪财经接口可能有请求频率限制，建议不要过于频繁刷新数据。

2. **数据准确性**：实时行情数据存在微小延迟，请以交易所官方数据为准。

3. **安全性**：
   - 不要将 `.env` 文件提交到版本控制
   - 生产环境建议使用更强的密码
   - 考虑添加 HTTPS 支持

4. **性能优化**：
   - 可考虑添加缓存机制
   - 大量数据时可实现分页加载

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [AKShare](https://github.com/akfamily/akshare) - 开源财经数据接口库
- [AKTools](https://github.com/akfamily/aktools) - AKShare HTTP API 工具
- 新浪财经 - 数据来源

---

**Made with ❤️ for A股投资者**
