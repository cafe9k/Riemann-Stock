# Distroless + Docker-slim 极致优化指南

## 📊 预期效果

| 阶段 | 镜像大小 | 减少比例 | 累计减少 |
|------|---------|---------|---------|
| 原始镜像（node:16） | ~900MB | - | - |
| Alpine 版本 | ~170MB | -81% | -81% |
| Distroless 版本 | ~80MB | -53% | -91% |
| **Distroless + Slim** | **~30-50MB** | **-40%** | **-95%** |

**最终效果**：从 900MB 减少到 30-50MB，减少 **95%**！

---

## 🛠️ 本地构建和测试

### 1. 构建 Distroless 镜像

```bash
# 构建 distroless 版本
docker build -f Dockerfile.distroless -t riemann-stock:distroless .

# 查看镜像大小
docker images | grep riemann-stock
# 预期：~80MB
```

### 2. 测试 Distroless 镜像

```bash
# 运行容器（需要传递环境变量）
docker run -d \
  --name riemann-stock \
  -p 3000:3000 \
  -e PORT=3000 \
  -e AKTOOLS_URL=http://nb.nblink.cc:15641 \
  -e AKTOOLS_USERNAME=akshare \
  -e AKTOOLS_PASSWORD=akfamily \
  riemann-stock:distroless

# 测试应用
curl http://localhost:3000

# 健康检查
curl http://localhost:3000/health
```

### 3. 使用 Docker-slim 压缩镜像

#### 安装 docker-slim

```bash
# macOS
brew install docker-slim

# 或下载二进制文件
curl -L -o dslim.tar.gz https://downloads.dockerslim.com/releases/1.40.0/dist_mac.zip
tar -xzf dslim.tar.gz
sudo mv docker-slim /usr/local/bin/docker-slim
sudo mv docker-slim-sensor /usr/local/bin/docker-slim-sensor
```

#### 压缩镜像

```bash
# 基础压缩（自动探测）
docker-slim build --target riemann-stock:distroless \
  --tag riemann-stock:slim

# 使用配置文件压缩
docker-slim build --config .slim.yaml

# 查看压缩后的镜像
docker images | grep riemann-stock
# 预期：~30-50MB
```

#### 高级压缩选项

```bash
# 包含 HTTP 探测（推荐用于 Web 应用）
docker-slim build \
  --target riemann-stock:distroless \
  --tag riemann-stock:slim \
  --http-probe \
  --http-probe-port 3000 \
  --http-probe-cmd "GET:/:200"

# 手动指定保留路径
docker-slim build \
  --target riemann-stock:distroless \
  --tag riemann-stock:slim \
  --include-path /app/backend/server.js \
  --include-path /app/backend/node_modules \
  --include-path /app/frontend

# 保留所有环境变量
docker-slim build \
  --target riemann-stock:distroless \
  --tag riemann-stock:slim \
  --include-env PORT \
  --include-env NODE_ENV \
  --include-env AKTOOLS_URL \
  --include-env AKTOOLS_USERNAME \
  --include-env AKTOOLS_PASSWORD
```

### 4. 测试压缩后的镜像

```bash
# 运行压缩后的镜像
docker run -d \
  --name riemann-stock-slim \
  -p 3001:3000 \
  -e PORT=3000 \
  -e AKTOOLS_URL=http://nb.nblink.cc:15641 \
  -e AKTOOLS_USERNAME=akshare \
  -e AKTOOLS_PASSWORD=akfamily \
  riemann-stock:slim

# 测试功能
curl http://localhost:3001

# 查看镜像详情
docker-slim info riemann-stock:slim
```

---

## 🔄 CI/CD 集成

### 方案 A：使用 Docker-slim GitHub Action

修改 `.github/workflows/ci.yml`：

```yaml
- name: Build Docker image (distroless)
  uses: docker/build-push-action@v5
  with:
    context: .
    file: Dockerfile.distroless
    platforms: linux/amd64,linux/arm64
    push: false
    tags: riemann-stock:distroless
    cache-from: type=gha
    cache-to: type=gha,mode=max

- name: Slim the image
  uses: kitabisa/docker-slim-action@v1
  with:
    target: riemann-stock:distroless
    tag: riemann-stock:slim

- name: Push slim image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ${{ steps.imagename.outputs.name }}:slim
```

### 方案 B：手动集成（推荐）

在 workflow 中添加新 job：

```yaml
slim-image:
  needs: build
  runs-on: ubuntu-latest
  if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master')
  permissions:
    contents: read
    packages: write

  steps:
    - uses: actions/checkout@v4

    - name: Set lowercase image name
      id: imagename
      run: echo "name=$(echo '${{ github.repository }}' | tr '[:upper:]' '[:lower:]')" >> $GITHUB_OUTPUT

    - name: Log in to GHCR
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Pull image
      run: docker pull ghcr.io/${{ steps.imagename.outputs.name }}:latest

    - name: Install docker-slim
      run: |
        curl -L -o dslim.tar.gz https://downloads.dockerslim.com/releases/1.40.0/dist_linux.tar.gz
        tar -xzf dslim.tar.gz
        sudo mv dist_linux/docker-slim /usr/local/bin/
        sudo mv dist_linux/docker-slim-sensor /usr/local/bin/

    - name: Slim the image
      run: |
        docker-slim build \
          --target ghcr.io/${{ steps.imagename.outputs.name }}:latest \
          --tag ghcr.io/${{ steps.imagename.outputs.name }}:slim \
          --include-path /app/backend/server.js \
          --include-path /app/backend/node_modules \
          --include-path /app/frontend

    - name: Push slim image
      run: docker push ghcr.io/${{ steps.imagename.outputs.name }}:slim
```

---

## 🐛 调试 Distroless 镜像

### 问题：Distroless 没有 shell，无法进入容器调试

### 解决方案 1：使用临时调试容器

```bash
# 创建调试容器（包含 busybox）
kubectl run -i --tty --image busybox debug -- sh

# 或使用 ephemeral container
kubectl debug -it <pod-name> --image=busybox --target=<container-name>
```

### 解决方案 2：使用专门的调试镜像

创建 `Dockerfile.debug`：

```dockerfile
FROM gcr.io/distroless/nodejs:16-debug
WORKDIR /app
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY backend/server.js ./backend/
COPY frontend/ ./frontend/
CMD ["backend/server.js"]
```

构建调试版本：

```bash
docker build -f Dockerfile.debug -t riemann-stock:debug .
docker run -it --rm riemann-stock:debug sh
```

### 解决方案 3：使用 Kubernetes debug

```bash
# 创建临时调试容器
kubectl debug -it <pod-name> \
  --image=node:16-alpine \
  --target=<container-name> \
  -- sh
```

---

## 📈 性能对比测试

### 测试脚本

```bash
#!/bin/bash

# 构建所有版本
echo "Building images..."
docker build -t riemann-stock:alpine .
docker build -f Dockerfile.distroless -t riemann-stock:distroless .
docker-slim build --target riemann-stock:distroless --tag riemann-stock:slim

# 查看镜像大小
echo "=== Image Sizes ==="
docker images | grep riemann-stock | awk '{print $1":"$2, $7}'

# 测试启动时间
echo -e "\n=== Startup Time ==="
for img in alpine distroless slim; do
  echo -n "riemann-stock:$img: "
  time docker run --rm riemann-stock:$img &
  sleep 2
  docker stop $(docker ps -q --filter ancestor=riemann-stock:$img)
done

# 测试内存使用
echo -e "\n=== Memory Usage ==="
for img in alpine distroless slim; do
  docker run -d --name test-$img riemann-stock:$img
  sleep 5
  echo -n "riemann-stock:$img: "
  docker stats --no-stream test-$img | awk 'NR==2 {print $4}'
  docker rm -f test-$img
done
```

---

## ✅ 最佳实践检查清单

### 构建阶段
- [ ] 使用 `npm ci --production`
- [ ] 清理 npm 缓存
- [ ] 使用多阶段构建
- [ ] 删除构建工具（apk del）

### 运行阶段
- [ ] 使用 distroless 基础镜像
- [ ] 不安装不必要的包
- [ ] 只复制必需文件
- [ ] 不使用 EXPOSE（仅文档性质）

### Docker-slim 优化
- [ ] 使用 HTTP 探测
- [ ] 包含所有必需路径
- [ ] 保留必要环境变量
- [ ] 测试压缩后功能

### 调试策略
- [ ] 准备调试镜像（-debug tag）
- [ ] 配置 Kubernetes debug
- [ ] 完善日志输出
- [ ] 添加健康检查端点

---

## 🎯 推荐使用场景

### 适合 Distroless + Slim
- ✅ 生产环境
- ✅ 对安全性要求高
- ✅ 镜像拉取频繁
- ✅ 带宽受限环境
- ✅ 大规模部署

### 不推荐场景
- ❌ 需要频繁调试
- ❌ 开发环境
- ❌ 需要容器内工具
- ❌ 依赖动态加载模块

---

## 🚀 快速开始

```bash
# 1. 构建 distroless 镜像
docker build -f Dockerfile.distroless -t riemann-stock:distroless .

# 2. 测试 distroless 镜像
docker run -d -p 3000:3000 \
  -e AKTOOLS_URL=http://nb.nblink.cc:15641 \
  -e AKTOOLS_USERNAME=akshare \
  -e AKTOOLS_PASSWORD=akfamily \
  riemann-stock:distroless

curl http://localhost:3000

# 3. 压缩镜像
docker-slim build \
  --target riemann-stock:distroless \
  --tag riemann-stock:slim \
  --http-probe \
  --include-path /app/backend/server.js \
  --include-path /app/backend/node_modules \
  --include-path /app/frontend

# 4. 查看最终大小
docker images | grep riemann-stock
```

预期结果：30-50MB（相比原始镜像减少 95%）
