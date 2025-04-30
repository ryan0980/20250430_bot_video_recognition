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

  useEffect(() => {
    fetch("http://localhost:5000/api/hello")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error:", error));
  }, []);

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

  return (
    <div className="App">
      <header className="App-header">
        <h1>视频上传系统</h1>
      </header>

      <div className="main-container">
        <div className="upload-section">
          <h2>上传视频</h2>
          <div className="upload-container">
            <input type="file" accept="video/*" onChange={handleFileChange} className="file-input" />
            <button onClick={handleUpload} disabled={isLoading} className="upload-button">
              {isLoading ? "上传中..." : "上传视频"}
            </button>
          </div>
          <div className={`status-message ${uploadStatus === "上传成功！" ? "success" : uploadStatus === "上传中..." ? "uploading" : uploadStatus.includes("失败") || uploadStatus.includes("出错") ? "error" : ""}`}>{uploadStatus}</div>
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
