@echo off
echo 正在启动后端服务...
start cmd /k "cd backend && python app.py"

echo 正在启动前端服务...
start cmd /k "cd frontend && npm start"

echo 服务启动完成！
echo 后端服务运行在: http://localhost:5000
echo 前端服务运行在: http://localhost:3000 