#!/bin/bash

echo "========================================="
echo "AKTools A股股票数据查看器 - 本地开发启动"
echo "========================================="
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到 Node.js，请先安装 Node.js"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 进入后端目录
cd backend

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    echo ""
fi

# 加载环境变量
if [ -f "../.env" ]; then
    echo "📄 加载 .env 配置文件..."
    export $(cat ../.env | grep -v '^#' | xargs)
else
    echo "⚠️  未找到 .env 文件，使用默认配置"
    echo "   提示: 复制 .env.example 为 .env 并修改配置"
    export PORT=3000
    export AKTOOLS_URL=http://nb.nblink.cc:15641
    export AKTOOLS_USERNAME=akshare
    export AKTOOLS_PASSWORD=akfamily
fi

echo ""
echo "========================================="
echo "🚀 启动服务..."
echo "========================================="
echo "AKTools 地址: $AKTOOLS_URL"
echo "服务端口: $PORT"
echo "访问地址: http://localhost:$PORT"
echo "========================================="
echo ""
echo "💡 提示: 按 Ctrl+C 停止服务"
echo ""

# 启动服务
node server.js
