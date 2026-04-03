# 部署指南

## 📦 GitHub Container Registry 自动构建

本项目使用 GitHub Actions 自动构建和推送 Docker 镜像到 GitHub Container Registry (GHCR)。

### 🚀 自动触发条件

- **推送到 main/master 分支**：自动构建并推送 `latest` 标签
- **创建版本标签** (如 `v1.0.0`)：自动构建并推送版本标签
- **Pull Request**：仅构建镜像，不推送

### ✨ 优势

- ✅ **零配置**：无需设置 Secrets，开箱即用
- ✅ **自动认证**：使用 GitHub 内置 `GITHUB_TOKEN`
- ✅ **权限管理**：与仓库权限自动集成
- ✅ **多架构支持**：支持 linux/amd64 和 linux/arm64
- ✅ **安全扫描**：自动检测镜像漏洞

### 📝 使用步骤

#### 1. 推送代码触发构建

```bash
# 添加修改
git add .

# 提交
git commit -m "feat: 添加新功能"

# 推送到 main 分支
git push origin main
```

#### 2. 查看构建状态

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看工作流运行状态
4. 点击具体运行查看详细日志

#### 3. 使用构建好的镜像

**拉取镜像：**

```bash
# 拉取最新版本
docker pull ghcr.io/<username>/riemann-stock:latest

# 拉取特定版本
docker pull ghcr.io/<username>/riemann-stock:v1.0.0

# 拉取特定提交
docker pull ghcr.io/<username>/riemann-stock:main-abc1234
```

**运行容器：**

```bash
docker run -d \
  --name aktools-stock-viewer \
  -p 3000:3000 \
  -e AKTOOLS_URL=http://nb.nblink.cc:15641 \
  -e AKTOOLS_USERNAME=akshare \
  -e AKTOOLS_PASSWORD=akfamily \
  ghcr.io/<username>/riemann-stock:latest
```

**使用 docker-compose：**

```yaml
version: '3.8'

services:
  aktools-web:
    image: ghcr.io/<username>/riemann-stock:latest
    container_name: aktools-stock-viewer
    ports:
      - "3000:3000"
    environment:
      - AKTOOLS_URL=http://nb.nblink.cc:15641
      - AKTOOLS_USERNAME=akshare
      - AKTOOLS_PASSWORD=akfamily
    restart: unless-stopped
```

### 🏷️ 版本管理

#### 创建版本发布

```bash
# 创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 自动生成的镜像标签：
# - ghcr.io/<username>/riemann-stock:v1.0.0
# - ghcr.io/<username>/riemann-stock:v1.0
# - ghcr.io/<username>/riemann-stock:v1
# - ghcr.io/<username>/riemann-stock:latest
```

#### 语义化版本规则

- `v1.0.0` - 完整版本号（主版本.次版本.补丁版本）
- `v1.0` - 自动生成（次版本）
- `v1` - 自动生成（主版本）
- `latest` - 始终指向最新版本

### 📊 工作流说明

#### 主要工作流

1. **`docker-build.yml`** - Docker 镜像构建
   - 触发：推送到主分支、创建标签、PR
   - 功能：构建多架构镜像并推送
   - 平台：linux/amd64, linux/arm64

2. **`ci.yml`** - 完整 CI/CD 流程
   - 代码检查 → 构建镜像 → 安全扫描
   - 自动化测试和验证

### 🔍 CI/CD 流程图

```
代码推送
   ↓
[代码检查] → Node.js 语法检查
   ↓
[构建镜像] → 多架构 Docker 镜像构建
   ↓
[推送镜像] → GitHub Container Registry
   ↓
[安全扫描] → Trivy 漏洞检测
```

### 🐛 故障排查

#### 问题 1: 镜像拉取失败

**错误信息：**
```
Error: ghcr.io/<username>/riemann-stock:latest: not found
```

**原因：**
- 镜像还未构建完成
- 仓库设置为私有，需要登录

**解决方法：**

```bash
# 登录 GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 或者使用个人访问令牌
docker login ghcr.io -u USERNAME
# 输入 GitHub Personal Access Token (需要 read:packages 权限)
```

#### 问题 2: 构建失败

**检查步骤：**
1. 查看 Actions 日志定位错误
2. 检查 Dockerfile 语法
3. 确认依赖安装正确

#### 问题 3: 多架构构建慢

**优化建议：**
- GitHub Actions 已启用缓存
- 构建时间通常 3-5 分钟
- 可接受范围内

### 🔐 镜像可见性设置

#### 公开镜像（推荐）

```bash
# 在 GitHub 网页操作：
# 1. 进入仓库的 Packages 页面
# 2. 点击镜像名称
# 3. 点击 "Package settings"
# 4. 将 "Change visibility" 设置为 Public
```

#### 私有镜像

如果镜像设为私有，拉取时需要认证：

```bash
# 创建 GitHub Personal Access Token
# 需要权限：read:packages

# 登录
docker login ghcr.io -u USERNAME
# 输入 PAT

# 然后拉取
docker pull ghcr.io/<username>/riemann-stock:latest
```

### 📈 最佳实践

1. **使用版本标签**
   ```bash
   # 生产环境使用固定版本
   docker pull ghcr.io/<username>/riemann-stock:v1.0.0
   
   # 开发环境使用最新版本
   docker pull ghcr.io/<username>/riemann-stock:latest
   ```

2. **定期更新镜像**
   ```bash
   # 拉取最新镜像
   docker pull ghcr.io/<username>/riemann-stock:latest
   
   # 重启容器使用新镜像
   docker-compose down
   docker-compose up -d
   ```

3. **监控安全扫描结果**
   - 查看 Actions 安全扫描步骤
   - 及时修复高危漏洞
   - 定期更新基础镜像

### 🎯 快速开始

**一键部署：**

```bash
# 拉取镜像
docker pull ghcr.io/<username>/riemann-stock:latest

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e AKTOOLS_URL=http://nb.nblink.cc:15641 \
  -e AKTOOLS_USERNAME=akshare \
  -e AKTOOLS_PASSWORD=akfamily \
  --name aktools-stock-viewer \
  ghcr.io/<username>/riemann-stock:latest

# 访问应用
# 打开浏览器: http://localhost:3000
```

### 📚 相关文档

- [GitHub Container Registry 官方文档](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker 多架构构建](https://docs.docker.com/build/building/multi-platform/)
- [GitHub Actions 工作流语法](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

---

**配置完成！每次推送代码到主分支都会自动构建 Docker 镜像。** 🎉
