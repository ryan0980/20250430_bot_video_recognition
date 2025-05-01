# 视频分析系统

这是一个基于 React 前端和 Flask 后端的视频分析系统，可以将多视角视频分割并分析每个视角的动作。

## 功能特点

- 支持文件上传和 URL 上传两种方式
- 多视角视频自动分割
- 基于 Gemini 的智能动作分析
- 实时处理状态显示
- 时间线视图展示
- 支持编辑和保存分析结果
- 响应式设计，适配不同设备

## 技术栈

- 前端：React.js
- 后端：Flask (Python)
- AI 分析：Google Gemini API
- 视频处理：OpenCV
- 样式：CSS3

## 环境要求

- Python 3.8+
- Node.js 14+
- Google API Key (Gemini)

## 安装步骤

1. 克隆项目

```bash
git clone https://github.com/ryan0980/20250430_bot_video_recognition.git
cd 20250430_bot_video_recognition
```

2. 安装后端依赖

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
pip install -r requirements.txt
```

3. 安装前端依赖

```bash
cd frontend
npm install
```

4. 配置环境变量

- 在 `backend` 目录下创建 `.env` 文件
- 添加您的 Google API Key：

```
GOOGLE_API_KEY=your_api_key_here
```

## 运行项目

1. 启动后端服务

```bash
cd backend
python app.py
```

2. 启动前端服务

```bash
cd frontend
npm start
```

3. 访问应用

- 打开浏览器访问 http://localhost:3000

## 项目结构

```
.
├── frontend/          # React前端项目
│   ├── public/        # 静态资源
│   └── src/           # 源代码
│       ├── App.js     # 主组件
│       └── App.css    # 样式文件
├── backend/           # Flask后端项目
│   ├── uploads/       # 上传的视频文件
│   ├── separated_videos/  # 分割后的视频
│   ├── app.py         # 主应用文件
│   ├── video_separator.py  # 视频分割模块
│   ├── video_analyzer.py   # 视频分析模块
│   └── requirements.txt    # Python依赖
└── README.md          # 项目说明
```

## 使用说明

1. 上传视频

   - 点击"文件上传"或"URL 上传"按钮
   - 选择视频文件或输入视频 URL
   - 点击"上传视频"按钮

2. 查看分析结果

   - 上传成功后，系统会自动处理视频
   - 在右侧面板查看处理结果
   - 可以查看分割后的视频和分析结果

3. 时间线视图
   - 点击"查看时间线"按钮进入时间线视图
   - 可以查看每个时间点的视频帧
   - 支持编辑和保存分析结果

## 注意事项

1. 确保已安装所有必要的依赖
2. 确保已正确配置 Google API Key
3. 上传的视频文件会被自动分割为多个视角
4. 分析结果会显示在右侧面板中
5. 建议上传的视频时长不要超过 10 分钟

## 常见问题

1. 如果遇到 API Key 错误，请检查：

   - `.env` 文件是否存在
   - API Key 是否正确
   - 网络连接是否正常

2. 如果视频上传失败，请检查：

   - 文件大小是否合适
   - 文件格式是否支持
   - 网络连接是否正常

3. 如果分析结果不准确，请检查：
   - 视频质量是否清晰
   - 视频内容是否适合分析
   - 网络连接是否稳定

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

MIT License

## 作者

Shi Qiu

## 致谢

- [Google Gemini API](https://ai.google.dev/)
- [OpenCV](https://opencv.org/)
- [React](https://reactjs.org/)
- [Flask](https://flask.palletsprojects.com/)
