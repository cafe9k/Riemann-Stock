# 本地开发指南

## 🚀 快速启动

### 方式一：使用启动脚本（推荐）

**macOS / Linux:**
```bash
./start.sh
```

**Windows:**
```bash
start.bat
```

或者双击 `start.bat` 文件运行。

### 方式二：手动启动

```bash
# 1. 进入后端目录
cd backend

# 2. 安装依赖（首次运行）
npm install

# 3. 配置环境变量（可选）
# 复制环境变量示例文件
cp ../.env.example ../.env
# 编辑 .env 文件，修改 AKTools 服务地址和认证信息

# 4. 启动服务
npm start

# 5. 访问应用
# 打开浏览器访问: http://localhost:3000
```

### 方式三：使用环境变量直接启动

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 设置环境变量并启动（macOS/Linux）
AKTOOLS_URL=http://nb.nblink.cc:15641 \
AKTOOLS_USERNAME=akshare \
AKTOOLS_PASSWORD=akfamily \
npm start

# 或者在 Windows (PowerShell)
$env:AKTOOLS_URL="http://nb.nblink.cc:15641"
$env:AKTOOLS_USERNAME="akshare"
$env:AKTOOLS_PASSWORD="akfamily"
npm start
```

## ⚙️ 环境配置

### 环境变量说明

| 变量名 | 说明 | 默认值 | 是否必需 |
|--------|------|--------|---------|
| `PORT` | 服务端口 | `3000` | 否 |
| `AKTOOLS_URL` | AKTools 服务地址 | `http://nb.nblink.cc:15641` | 是 |
| `AKTOOLS_USERNAME` | AKTools 用户名 | `akshare` | 是 |
| `AKTOOLS_PASSWORD` | AKTools 密码 | `akfamily` | 是 |

### 配置方式

#### 方式一：使用 .env 文件（推荐）

```bash
# 1. 复制示例文件
cp .env.example .env

# 2. 编辑 .env 文件
# macOS/Linux
nano .env

# Windows
notepad .env
```

`.env` 文件内容：
```env
PORT=3000
AKTOOLS_URL=http://nb.nblink.cc:15641
AKTOOLS_USERNAME=akshare
AKTOOLS_PASSWORD=akfamily
```

#### 方式二：直接设置环境变量

**macOS/Linux:**
```bash
export PORT=3000
export AKTOOLS_URL=http://nb.nblink.cc:15641
export AKTOOLS_USERNAME=akshare
export AKTOOLS_PASSWORD=akfamily
```

**Windows (命令提示符):**
```cmd
set PORT=3000
set AKTOOLS_URL=http://nb.nblink.cc:15641
set AKTOOLS_USERNAME=akshare
set AKTOOLS_PASSWORD=akfamily
```

**Windows (PowerShell):**
```powershell
$env:PORT="3000"
$env:AKTOOLS_URL="http://nb.nblink.cc:15641"
$env:AKTOOLS_USERNAME="akshare"
$env:AKTOOLS_PASSWORD="akfamily"
```

## 📋 前置要求

### 必需软件

1. **Node.js** (版本 14.0.0 或更高)
   - 下载地址: https://nodejs.org/
   - 推荐安装 LTS (长期支持) 版本

2. **npm** (Node.js 包管理器)
   - 随 Node.js 自动安装

### 检查安装

```bash
# 检查 Node.js 版本
node -v

# 检查 npm 版本
npm -v
```

预期输出类似：
```
v16.20.0
8.19.0
```

## 🔧 开发流程

### 首次运行

```bash
# 1. 克隆项目（如果是从 Git 仓库）
git clone <repository-url>
cd Riemann-Stock

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 3. 运行启动脚本
./start.sh  # macOS/Linux
# 或
start.bat   # Windows
```

### 日常开发

```bash
# 启动服务
cd backend
npm start

# 或者使用启动脚本
./start.sh
```

### 修改代码

1. **修改前端代码**
   - 编辑 `frontend/index.html`
   - 刷新浏览器即可看到效果

2. **修改后端代码**
   - 编辑 `backend/server.js`
   - 需要重启服务（Ctrl+C 停止，然后重新启动）

3. **修改配置**
   - 编辑 `.env` 文件
   - 重启服务生效

## 🐛 常见问题

### 问题 1: 端口被占用

**错误信息:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方法:**

**macOS/Linux:**
```bash
# 查找占用端口的进程
lsof -i :3000

# 终止进程（替换 <PID> 为实际进程 ID）
kill -9 <PID>

# 或者使用不同的端口
PORT=3001 npm start
```

**Windows:**
```cmd
# 查找占用端口的进程
netstat -ano | findstr :3000

# 终止进程（替换 <PID> 为实际进程 ID）
taskkill /PID <PID> /F

# 或者使用不同的端口
set PORT=3001
npm start
```

### 问题 2: 依赖安装失败

**解决方法:**
```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题 3: 无法连接到 AKTools

**检查步骤:**

1. 检查 AKTools 服务是否运行
```bash
curl http://nb.nblink.cc:15641/api/public/stock_zh_a_spot
```

2. 检查环境变量配置
```bash
# macOS/Linux
echo $AKTOOLS_URL
echo $AKTOOLS_USERNAME
echo $AKTOOLS_PASSWORD

# Windows (PowerShell)
echo $env:AKTOOLS_URL
echo $env:AKTOOLS_USERNAME
echo $env:AKTOOLS_PASSWORD
```

3. 检查网络连接
   - 确保可以访问 AKTools 服务地址
   - 检查防火墙设置

### 问题 4: 权限错误（macOS/Linux）

**错误信息:**
```
bash: ./start.sh: Permission denied
```

**解决方法:**
```bash
# 添加执行权限
chmod +x start.sh

# 然后运行
./start.sh
```

## 📝 开发提示

### 热重载

目前不支持热重载，修改后端代码后需要手动重启服务。

如果需要热重载功能，可以安装 `nodemon`：

```bash
# 安装 nodemon
npm install -g nodemon

# 使用 nodemon 启动
nodemon backend/server.js
```

### 调试模式

启用详细日志：

```bash
# macOS/Linux
DEBUG=* npm start

# Windows (PowerShell)
$env:DEBUG="*"
npm start
```

### 查看日志

服务运行时会在控制台输出日志，包括：
- 请求时间和路径
- 响应状态
- 错误信息

## 🔄 与 Docker 开发对比

| 特性 | 本地开发 | Docker 开发 |
|------|---------|-------------|
| 启动速度 | 快 | 较慢 |
| 环境一致性 | 依赖本地环境 | 完全一致 |
| 调试便利性 | 高 | 中等 |
| 依赖管理 | 需要手动安装 | 自动处理 |
| 环境隔离 | 无 | 有 |

## 📚 下一步

- 查看 [README.md](../README.md) 了解完整功能
- 查看 [API 文档](../README.md#api-文档) 了解接口详情
- 查看 [部署指南](../README.md#部署方式) 了解生产部署

## 💡 提示

- 开发时建议使用 `.env` 文件管理配置
- 不要将 `.env` 文件提交到 Git 仓库
- 修改后端代码需要重启服务
- 前端代码修改后刷新浏览器即可

---

如有问题，请查看 [故障排查](../README.md#故障排查) 章节。
