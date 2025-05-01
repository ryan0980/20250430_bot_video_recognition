import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [outputData, setOutputData] = useState(null);
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineLines, setTimelineLines] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadMode, setUploadMode] = useState("file");
  const [frameImages, setFrameImages] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/api/hello")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error:", error));
  }, []);

  useEffect(() => {
    if (response?.combined_result) {
      setTimelineLines(response.combined_result.split("\n").filter((line) => line.trim()));
    }
  }, [response]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadStatus("");
    setResponseData(null);
    setOutputData(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("请选择文件");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      setUploadStatus("上传中...");
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResponse(data);

      if (response.ok) {
        setUploadStatus("上传成功！");
        setOutputData({
          status: "处理完成",
          originalFile: data.filename,
          videos: data.separated_videos,
          analysis: data.analysis_results,
        });
      } else {
        setUploadStatus("上传失败");
      }
    } catch (error) {
      console.error("Error:", error);
      setUploadStatus("上传出错");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlUpload = async () => {
    if (!videoUrl) {
      setUploadStatus("请输入视频URL");
      return;
    }

    setIsLoading(true);
    try {
      setUploadStatus("上传中...");
      const response = await fetch("http://localhost:5000/api/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      const data = await response.json();
      setResponse(data);

      if (response.ok) {
        setUploadStatus("上传成功！");
        setOutputData({
          status: "处理完成",
          originalFile: data.filename,
          videos: data.separated_videos,
          analysis: data.analysis_results,
        });
      } else {
        setUploadStatus("上传失败");
      }
    } catch (error) {
      console.error("Error:", error);
      setUploadStatus("上传出错");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetFrame = async (videoPath, timestamp, index, view) => {
    console.log(`请求帧 ${view}:`, { videoPath, timestamp, index });

    if (!videoPath || timestamp === undefined || timestamp === null) {
      console.error("视频路径或时间戳无效:", { videoPath, timestamp, index });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/get_frame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_path: videoPath,
          timestamp: timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error(`获取截图失败: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      console.log(`成功获取帧 ${view}:`, { index, imageUrl });

      setFrameImages((prev) => {
        const newImages = {
          ...prev,
          [index]: {
            ...prev[index],
            [view]: imageUrl,
          },
        };
        console.log("更新后的图片状态:", newImages);
        return newImages;
      });
    } catch (error) {
      console.error(`获取帧失败 ${view}:`, error);
      setUploadStatus(`获取${view}视角截图失败`);
    }
  };

  useEffect(() => {
    if (response?.combined_result && response?.separated_videos?.front && response?.separated_videos?.top) {
      console.log("视频路径:", {
        top: response.separated_videos.top,
        front: response.separated_videos.front,
      });

      timelineLines.forEach((line, index) => {
        const timestampMatch = line.match(/(\d+:\d+)(?:-\d+:\d+)?/);
        if (timestampMatch) {
          const timeStr = timestampMatch[1];
          const [minutes, seconds] = timeStr.split(":").map(Number);
          // 如果时间戳是0秒，使用1秒
          let timestamp = minutes * 60 + seconds;
          if (timestamp === 0) {
            timestamp = 1;
          }
          console.log(`处理第 ${index} 行:`, { line, timeStr, originalTimestamp: minutes * 60 + seconds, adjustedTimestamp: timestamp });

          const topPath = response.separated_videos.top.replace(/\\/g, "/");
          const frontPath = response.separated_videos.front.replace(/\\/g, "/");

          if (timestamp >= 0) {
            handleGetFrame(topPath, timestamp, index, "top");
            handleGetFrame(frontPath, timestamp, index, "front");
          } else {
            console.error(`无效的时间戳 ${index}:`, timestamp);
          }
        } else {
          console.error(`无法从文本中提取时间戳 ${index}:`, line);
        }
      });
    } else {
      console.log("缺少必要的视频信息:", {
        hasResult: !!response?.combined_result,
        hasFront: !!response?.separated_videos?.front,
        hasTop: !!response?.separated_videos?.top,
      });
    }
  }, [timelineLines, response]);

  const TimelineView = () => {
    if (!response?.combined_result) return null;

    const handleEdit = (index) => {
      setEditingIndex(index);
      setEditText(timelineLines[index]);
    };

    const handleSave = (index) => {
      const newLines = [...timelineLines];
      newLines[index] = editText;
      setTimelineLines(newLines);
      setEditingIndex(null);
    };

    const handleCancel = () => {
      setEditingIndex(null);
    };

    return (
      <div className="timeline-container">
        <div className="timeline-header">
          <h2>时间线视图</h2>
          <button className="back-button" onClick={() => setShowTimeline(false)}>
            返回
          </button>
        </div>
        <div className="timeline-content">
          {timelineLines.map((line, index) => (
            <div key={index} className="timeline-item">
              {editingIndex === index ? (
                <div className="edit-container">
                  <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="edit-textarea" autoFocus />
                  <div className="edit-buttons">
                    <button className="save-button" onClick={() => handleSave(index)}>
                      保存
                    </button>
                    <button className="cancel-button" onClick={handleCancel}>
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="line-content">
                  <div className="line-frame">
                    {frameImages[index] ? (
                      <>
                        {frameImages[index].top ? <img src={frameImages[index].top} alt="顶部视角截图" /> : <div className="frame-placeholder">加载顶部视角...</div>}
                        {frameImages[index].front ? <img src={frameImages[index].front} alt="正面视角截图" /> : <div className="frame-placeholder">加载正面视角...</div>}
                      </>
                    ) : (
                      <div className="frame-placeholder">准备加载...</div>
                    )}
                  </div>
                  <div className="line-text-container">
                    <span className="line-text">{line}</span>
                    <button className="edit-button" onClick={() => handleEdit(index)}>
                      编辑
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (showTimeline) {
    return <TimelineView />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>视频上传系统</h1>
        <div style={{ display: "flex", alignItems: "center" }}>
          <a href="https://github.com/ryan0980/20250430_bot_video_recognition" target="_blank" rel="noopener noreferrer" className="github-link">
            GitHub
          </a>
          <span className="author-info">BY: Shi Qiu</span>
        </div>
      </header>

      <div className="main-container">
        <div className="upload-section">
          <h2>上传视频</h2>
          <div className="upload-container">
            <div className="upload-mode-switch">
              <button className={`mode-button ${uploadMode === "file" ? "active" : ""}`} onClick={() => setUploadMode("file")}>
                文件上传
              </button>
              <button className={`mode-button ${uploadMode === "url" ? "active" : ""}`} onClick={() => setUploadMode("url")}>
                URL上传
              </button>
            </div>

            {uploadMode === "file" ? (
              <div className="file-upload">
                <input type="file" accept="video/*" onChange={handleFileChange} className="file-input" />
                <div className="upload-button-container">
                  <div className={`status-message ${uploadStatus === "上传成功！" ? "success" : uploadStatus === "上传中..." ? "uploading" : uploadStatus.includes("失败") || uploadStatus.includes("出错") ? "error" : ""}`}>{uploadStatus}</div>
                  <button onClick={handleUpload} disabled={isLoading} className="upload-button">
                    {isLoading ? "上传中..." : "上传视频"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="url-upload">
                <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="输入视频URL" className="url-input" />
                <div className="upload-button-container">
                  <div className={`status-message ${uploadStatus === "上传成功！" ? "success" : uploadStatus === "上传中..." ? "uploading" : uploadStatus.includes("失败") || uploadStatus.includes("出错") ? "error" : ""}`}>{uploadStatus}</div>
                  <button onClick={handleUrlUpload} disabled={isLoading} className="upload-button">
                    {isLoading ? "上传中..." : "上传视频"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {response && (
          <div className="response-section">
            <div className="response-box">
              <h3>服务器响应</h3>
              <pre>{JSON.stringify(response, null, 2)}</pre>
            </div>
          </div>
        )}

        <div className="result-section">
          {response && (
            <>
              <div className="result-box">
                <h3>处理结果</h3>
                <div className="result-content">
                  <p>
                    <strong>原始文件:</strong> {response.filename}
                  </p>
                  <p>
                    <strong>状态:</strong> {response.message}
                  </p>

                  <div className="separated-videos">
                    <h4>分割后的视频:</h4>
                    {Object.entries(response.separated_videos).map(([view, path]) => (
                      <p key={view}>
                        {view}: {path}
                      </p>
                    ))}
                  </div>

                  <div className="analysis-results">
                    <h4>动作分析结果:</h4>
                    {Object.entries(response.analysis_results).map(([view, result]) => (
                      <div key={view} className="view-analysis">
                        <h5>{view} 视角:</h5>
                        <pre>{result}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="combined-result-box">
                <h3>合并结果</h3>
                <div className="combined-result-content">
                  <pre>{response.combined_result}</pre>
                </div>
                <button className="timeline-button" onClick={() => setShowTimeline(true)}>
                  查看时间线
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
