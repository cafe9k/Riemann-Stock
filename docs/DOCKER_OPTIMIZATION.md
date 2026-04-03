# Docker 镜像优化方案对比

## 当前镜像分析

**当前配置**：`node:16-alpine`
**预估体积**：~170MB

## 优化方案

### 方案 1：多阶段构建（推荐）

**优化内容**：
- ✅ 多阶段构建分离构建和运行环境
- ✅ 使用 `npm ci --only=production`
- ✅ 清理 npm 缓存
- ✅ 使用非 root 用户
- ✅ 添加健康检查

**预期体积**：~120MB
**减少比例**：30%
**复杂度**：低

**优点**：
- 大幅减少体积
- 提升安全性（非 root 用户）
- 提升可靠性（健康检查）
- 构建缓存优化

**缺点**：
- Dockerfile 稍微复杂一些

---

### 方案 2：Distroless 镜像（最激进）

**优化内容**：
- ✅ 使用 Google distroless 镜像
- ✅ 多阶段构建
- ✅ 最小化运行时环境

**预期体积**：~80MB
**减少比例**：53%
**复杂度**：高

**优点**：
- 体积最小
- 安全性最高（无 shell、无包管理器）
- 攻击面最小

**缺点**：
- 无法进入容器调试（无 shell）
- 构建和调试复杂度高
- 需要额外的调试镜像

**Dockerfile 示例**：
```dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

FROM gcr.io/distroless/nodejs:16
WORKDIR /app
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY backend/server.js ./backend/
COPY frontend/ ./frontend/
EXPOSE 3000
CMD ["backend/server.js"]
```

---

### 方案 3：最小改动优化

**优化内容**：
- ✅ 使用 `npm ci --production`
- ✅ 清理 npm 缓存
- ✅ 添加 .dockerignore

**预期体积**：~140MB
**减少比例**：18%
**复杂度**：最低

**优点**：
- 改动最小
- 风险最低
- 易于理解和维护

**缺点**：
- 优化效果有限

---

## 优化技巧清单

### 1. 基础镜像选择
- [ ] 使用 Alpine 变体（node:16-alpine）
- [ ] 考虑 distroless 镜像（最激进）

### 2. 依赖管理
- [ ] 使用 `npm ci` 替代 `npm install`
- [ ] 只安装生产依赖（`--production`）
- [ ] 不安装可选依赖（`--no-optional`）
- [ ] 清理 npm 缓存（`npm cache clean --force`）

### 3. 多阶段构建
- [ ] 分离构建环境和运行环境
- [ ] 只复制必需文件到最终镜像

### 4. 文件管理
- [ ] 创建 .dockerignore 文件
- [ ] 删除临时文件和缓存
- [ ] 合并 RUN 指令减少层数

### 5. 安全加固
- [ ] 使用非 root 用户运行
- [ ] 使用 dumb-init 处理信号
- [ ] 添加健康检查

### 6. 构建优化
- [ ] 优化 Dockerfile 层顺序
- [ ] 利用构建缓存
- [ ] 最小化构建上下文

---

## .dockerignore 示例

```
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build files
dist
build
coverage

# Git
.git
.gitignore

# Docker
Dockerfile
Dockerfile.*
.dockerignore

# Documentation
README.md
CHANGELOG.md
LICENSE

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Test
test
tests
*.test.js
*.spec.js
```

---

## 构建和测试命令

### 构建镜像
```bash
# 构建当前镜像
docker build -t riemann-stock:current .

# 构建优化版镜像
docker build -f Dockerfile.optimized -t riemann-stock:optimized .
```

### 查看镜像大小
```bash
docker images | grep riemann-stock
```

### 分析镜像层
```bash
# 使用 dive 工具分析
dive riemann-stock:optimized

# 或使用 docker history
docker history riemann-stock:optimized
```

### 测试镜像
```bash
# 运行容器
docker run -d -p 3000:3000 riemann-stock:optimized

# 测试健康检查
curl http://localhost:3000/health
```

---

## 推荐方案

**生产环境推荐**：方案 1（多阶段构建）
- 平衡了优化效果和复杂度
- 提升安全性和可靠性
- 易于维护和调试

**追求极致优化**：方案 2（Distroless）
- 适合对安全性要求极高的场景
- 需要额外的调试策略

**快速优化**：方案 3（最小改动）
- 适合快速上线
- 风险最低
