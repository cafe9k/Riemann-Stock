@echo off
chcp 65001 >nul
echo =========================================
echo AKTools A股股票数据查看器 - 本地开发启动
echo =========================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到 Node.js，请先安装 Node.js
    echo    下载地址: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js 版本: %NODE_VERSION%
echo.

REM 进入后端目录
cd backend

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    call npm install
    echo.
)

REM 加载环境变量
if exist "..\.env" (
    echo 📄 加载 .env 配置文件...
    for /f "usebackq tokens=1,* delims==" %%a in ("..\.env") do (
        set "line=%%a"
        if not "!line:~0,1!"=="#" (
            set "%%a=%%b"
        )
    )
) else (
    echo ⚠️  未找到 .env 文件，使用默认配置
    echo    提示: 复制 .env.example 为 .env 并修改配置
    set PORT=3000
    set AKTOOLS_URL=http://nb.nblink.cc:15641
    set AKTOOLS_USERNAME=akshare
    set AKTOOLS_PASSWORD=akfamily
)

echo.
echo =========================================
echo 🚀 启动服务...
echo =========================================
echo AKTools 地址: %AKTOOLS_URL%
echo 服务端口: %PORT%
echo 访问地址: http://localhost:%PORT%
echo =========================================
echo.
echo 💡 提示: 按 Ctrl+C 停止服务
echo.

REM 启动服务
node server.js

pause
