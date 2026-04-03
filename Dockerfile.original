# 使用 Node.js 官方镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY backend/package.json ./backend/

# 安装依赖
WORKDIR /app/backend
RUN npm install --production

# 复制后端代码
COPY backend/server.js ./

# 复制前端文件
COPY frontend/ ../frontend/

# 暴露端口
EXPOSE 3000

# 环境变量默认值
ENV PORT=3000
ENV AKTOOLS_URL=http://nb.nblink.cc:15641
ENV AKTOOLS_USERNAME=akshare
ENV AKTOOLS_PASSWORD=akfamily

# 启动服务
CMD ["node", "server.js"]
