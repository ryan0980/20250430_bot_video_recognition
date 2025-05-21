# Robot Data Segmentation Agent

A specialized system for analyzing and labeling ALOHA (A Low-cost Open-source Hardware System for Bimanual Teleoperation) project's video data. The system automatically analyzes and labels robot operation videos from four cameras (480x640 resolution), with two stationary cameras and two mounted on robot wrists.

docker version: https://github.com/ryan0980/20250502_bot_docker_version

## Features

- File and URL upload support
- Specialized for ALOHA's 4-camera video data
- 4*480x640 resolution video stream support
- Handles both stationary and wrist-mounted camera feeds
- AI-powered action analysis using Gemini
- Real-time processing status
- Timeline view
- Edit and save analysis results
- Responsive design

## Tech Stack

- Frontend: React.js
- Backend: Flask (Python)
- AI Analysis: Google Gemini API
- Video Processing: OpenCV
- Styling: CSS3

## Requirements

- Python 3.8+
- Node.js 14+
- Google API Key (Gemini)

## Quick Start

1. Clone the project

```bash
git clone https://github.com/ryan0980/20250430_bot_video_recognition.git
cd 20250430_bot_video_recognition
```

2. Install backend dependencies

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
pip install -r requirements.txt
```

3. Install frontend dependencies

```bash
cd frontend
npm install
```

4. Configure environment

- Create `.env` file in `backend` directory
- Add your Google API Key:

```
GOOGLE_API_KEY=your_api_key_here
```

5. Run the application

```bash
# Method 1: Using start.bat (Windows only)
# Double click start.bat in the project root directory

# Method 2: Manual start
# Start backend
cd backend
python app.py

# Start frontend
cd frontend
npm start
```

6. Access the application at http://localhost:3000

## Notes

- Ensure video format matches ALOHA project standards (480x640 resolution)
- The video must include all four camera views in a specific arrangement
- Maximum recommended video size: 20mb

## License

MIT License

## Author

Shi Qiu

## References

- [ALOHA Dataset](https://tonyzhaozh.github.io/aloha/)
- [Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware](https://tonyzhaozh.github.io/aloha/)
