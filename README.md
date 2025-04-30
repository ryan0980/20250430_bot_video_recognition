# 视频分析系统

这是一个基于 React 前端和 Flask 后端的视频分析系统，可以将多视角视频分割并分析每个视角的动作。

## 功能特点

- 视频上传
- 多视角视频分割
- 基于 Gemini 的智能动作分析
- 实时处理状态显示

## 环境要求

- Python 3.8+
- Node.js 14+
- Google API Key (Gemini)

## 安装步骤

1. 克隆项目

```bash
git clone [项目地址]
cd [项目目录]
```

2. 安装后端依赖

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
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
│   ├── public/
│   └── src/
├── backend/           # Flask后端项目
│   ├── uploads/       # 上传的视频文件
│   ├── separated_videos/  # 分割后的视频
│   ├── app.py         # 主应用文件
│   ├── video_separator.py  # 视频分割模块
│   ├── video_analyzer.py   # 视频分析模块
│   └── requirements.txt    # Python依赖
└── README.md          # 项目说明
```

## 注意事项

1. 确保已安装所有必要的依赖
2. 确保已正确配置 Google API Key
3. 上传的视频文件会被自动分割为四个视角
4. 分析结果会显示在右侧面板中

## 常见问题

1. 如果遇到 API Key 错误，请检查：

   - `.env` 文件是否存在
   - API Key 是否正确
   - 网络连接是否正常

2. 如果视频上传失败，请检查：
   - 文件大小是否合适
   - 文件格式是否支持
   - 网络连接是否正常

## Ref:

https://github.com/openai/openai-cookbook/blob/main/examples/GPT_with_vision_for_video_understanding.ipynb
