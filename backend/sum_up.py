import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from typing import Dict, List

# 加载环境变量
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

def combine_analysis_results(analysis_results: Dict[str, str]) -> str:
    """
    将四个视角的分析结果组合成一个完整的描述
    
    Args:
        analysis_results: 包含四个视角分析结果的字典
        
    Returns:
        组合后的完整描述
    """
    # 验证API密钥
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY not found in environment variables")

    # 生成提示词
    prompt_lines = [
        "You have four synchronized camera views of the same action sequence, each providing time-stamped segments in MM:SS–MM:SS : description format:",
        "- Top: overhead view",
        "- Front: frontal view",
        "- Right: camera on the right robotic arm",
        "- Left: camera on the left robotic arm",
        "",
        "Generate a single chronological list of unified action segments with these rules:",
        "1. Order by start time (then end time).",
        "2. When segments share identical times, merge their information into one description without view labels.",
        "3. Merge overlapping segments only if they describe the same continuous motion—use the earliest start, latest end, and combine details.",
        "4. Keep segments granular: start a new segment whenever the action changes (e.g., moving vs. grasping vs. placing).",
        "5. Drop view-specific prefixes; describe the action as a whole (e.g., “Both arms move inward to secure side flaps”).",
        "6. Preserve the exact MM:SS–MM:SS format.",
        "",
        "Output ONLY the unified list, one segment per line, with no extra text."
    ]



    # 添加各个视角的描述
    for view in ["top", "front", "right", "left"]:
        segments = analysis_results.get(view, "")
        prompt_lines.append(f"\n{view.capitalize()} view segments:")
        if segments:
            prompt_lines.append(segments)
        else:
            prompt_lines.append("No analysis available")

    # 调用Gemini API
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt_lines
    )

    return response.text

def main():
    # 示例分析结果
    analysis_results = {
        "front": "00:00–00:03 : Two robotic arms move in to grab the container.\n00:03–00:09 : Both robotic arms grab the container, lift it up, and remove the lid.\n00:09–00:11 : Both robotic arms lift the container.",
        "left": "00:00–00:04 : Left robotic arm moves towards the center.\n00:04–00:08 : Left robotic arm grabs the container.\n00:08–00:11 : Left robotic arm lifts the container.",
        "right": "00:01–00:04 : Right robotic arm descends towards the plastic cup.\n00:04–00:11 : The right robotic arm lifts the plastic cup.",
        "top": "00:00–00:05 : Two robotic arms with white 3D-printed end effectors move inward toward the center of the frame.\n00:05–00:11 : The robotic arms manipulate the objects to be in the end effectors."
    }

    try:
        combined_result = combine_analysis_results(analysis_results)
        print("\n--- Combined Action Segments ---")
        print(combined_result)
    except Exception as e:
        print(f"Error during analysis: {str(e)}")

if __name__ == "__main__":
    main() 