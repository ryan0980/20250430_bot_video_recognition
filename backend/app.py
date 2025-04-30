from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from pathlib import Path
from dotenv import load_dotenv
from video_separator import separate_video
from video_analyzer import analyze_all_videos
from sum_up import combine_analysis_results

# 加载环境变量
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

app = Flask(__name__)
CORS(app)

# 确保上传目录存在
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello from Flask!"})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'video' not in request.files:
        return jsonify({"error": "没有文件被上传"}), 400
    
    file = request.files['video']
    if file.filename == '':
        return jsonify({"error": "没有选择文件"}), 400
    
    if file:
        # 保存文件
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)
        
        try:
            # 分割视频
            separated_videos = separate_video(filename)
            
            # 分析视频
            analysis_results = analyze_all_videos(separated_videos)
            
            # 汇总分析结果
            combined_result = combine_analysis_results(analysis_results)
            
            return jsonify({
                "message": "文件上传、分割和分析成功",
                "filename": file.filename,
                "separated_videos": separated_videos,
                "analysis_results": analysis_results,
                "combined_result": combined_result
            }), 200
        except Exception as e:
            return jsonify({
                "error": f"处理失败: {str(e)}",
                "filename": file.filename
            }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 