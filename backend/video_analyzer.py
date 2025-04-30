import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types
from typing import Dict, Optional
import time

# 加载环境变量
# 1) 拿到 app.py 的绝对路径  
BASE_DIR = Path(__file__).resolve().parent  
# 2) 假设 .env 就放在同级目录下  
env_path = BASE_DIR / ".env"  
print("尝试加载 .env：", env_path, "exists:", env_path.is_file())  
# 3) 带 encoding 和 override  
load_dotenv(dotenv_path=str(env_path), override=True, encoding="utf-8-sig")  
print("GOOGLE_API_KEY=", os.getenv("GOOGLE_API_KEY"))

def generate_action_segments(
    video_path: str,
    api_key: str | None = None,
    model: str = "gemini-2.0-flash",
    view: str | None = None,
    prompt: str | None = None,
    max_retries: int = 5,
    retry_delay: int = 2,
) -> str:
    """
    使用 Gemini 将视频拆分成精细动作分段并返回文本结果。

    Args:
        video_path: 本地视频文件路径。
        api_key: 你的 Google API Key；如果留空则自动从 .env 加载。
        model: 要调用的 Gemini 模型名称。
        view: 视图标签，可选 up/front/left/right，对应不同视角。
        prompt: 自定义提示；默认已根据 view 嵌入格式要求。
        max_retries: 最大重试次数。
        retry_delay: 重试间隔（秒）。

    Returns:
        模型返回的纯文本分段列表。
    """
    # 如果没传 api_key，则尝试加载 .env
    if api_key is None:
        api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("未找到环境变量 GOOGLE_API_KEY，请检查 .env 文件")

    # 校验并读取视频字节
    if not os.path.isfile(video_path):
        raise FileNotFoundError(f"视频文件未找到: {video_path}")
    with open(video_path, "rb") as f:
        video_bytes = f.read()

    # 视角提示映射
    view_prompts = {
        'up': (
            "This video is captured from a top-mounted camera. "
            "Focus on movements and spatial relations as seen from above, "
            "including object positioning and state changes."
        ),
        'front': (
            "This video is captured from a front-mounted camera. "
            "Describe actions and object interactions as seen head-on, "
            "noting any changes in object orientation or condition."
        ),
        'left': (
            "This video is captured from a camera fixed to the left robotic arm. "
            "Detail motions and object handling from the left-arm perspective, "
            "including how the arm manipulates or alters object state."
        ),
        'right': (
            "This video is captured from a camera fixed to the right robotic arm. "
            "Detail motions and object handling from the right-arm perspective, "
            "including how the arm manipulates or alters object state."
        ),
    }

    default_prompt = (
        "Split the video into fine-grained action segments, each focused on one distinct action. "
        "For each segment, include: actor (which arm), object, and any changes in object state or position. "
        "Output ONLY lines in this exact format:\n"
        "MM:SS–MM:SS : action description\n"
        "with no headings or extra commentary. For example:\n"
        "00:00–00:03 : Left robotic arm moves to the middle.\n"
        "00:03–00:06 : Right robotic arm shifts a Duracell battery into the compartment, locking it in place.\n"
        "00:06–00:09 : Both arms lift up and retract, leaving the closed battery compartment behind.\n"
    )

    # 合成最终 prompt
    if prompt is None:
        prompt = ''
        if view in view_prompts:
            prompt += view_prompts[view]
        prompt += default_prompt

    # 调用 Gemini，带重试机制
    client = genai.Client(api_key=api_key)
    content = types.Content(parts=[
        types.Part(inline_data=types.Blob(data=video_bytes, mime_type="video/mp4")),
        types.Part(text=prompt),
    ])
    
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(model=model, contents=content)
            return response.text
        except Exception as e:
            error_str = str(e)
            if ("503" in error_str or "500" in error_str) and attempt < max_retries - 1:
                print(f"遇到错误 ({error_str})，等待 {retry_delay} 秒后重试... (尝试 {attempt + 1}/{max_retries})")
                time.sleep(retry_delay)
            else:
                raise e

def analyze_all_videos(video_paths: Dict[str, str], api_key: Optional[str] = None) -> Dict[str, str]:
    """
    分析所有视角的视频
    
    Args:
        video_paths: 包含四个视角视频路径的字典
        api_key: Google API Key
        
    Returns:
        包含每个视角分析结果的字典
    """
    results = {}
    view_mapping = {
        'top': 'up',
        'front': 'front',
        'left': 'left',
        'right': 'right'
    }
    
    for view, path in video_paths.items():
        try:
            print(f"\n分析 {view} 视角视频:")
            print(f"视频路径: {path}")
            print(f"视角标签: {view_mapping[view]}")
            
            segments = generate_action_segments(
                video_path=path,
                api_key=api_key,
                view=view_mapping[view]
            )
            results[view] = segments
            
            print(f"分析结果:\n{segments}")
            print("-" * 50)
        except Exception as e:
            error_msg = f"分析失败: {str(e)}"
            print(f"分析失败: {error_msg}")
            results[view] = error_msg
            
    return results 