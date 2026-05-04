import { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

import creative from "./templates/creative.html?raw";
import professional from "./templates/professional.html?raw";

import { fillTemplate } from "./utils/fillTemplate";
import { downloadPortfolio } from "./utils/downloadPortfolio";

const BACKEND_URL = "https://hack-backend-zl1d.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [templateType, setTemplateType] = useState("creative");

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    }
  });

  const handleUpload = async () => {
    if (!file) return alert("Upload a PDF first");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);

      const res = await axios.post(
        `${BACKEND_URL}/api/upload`,
        formData
      );

      console.log("Backend response:", res.data);

      // ✅ FIXED: correct backend key
      const parsedData = res.data.structuredData;

      if (!parsedData) {
        throw new Error("No structured data returned from backend");
      }

      setData(parsedData);

    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      alert("Backend failed — using dummy data");

      setData({
        name: "Demo User",
        email: "demo@email.com",
        summary: "Generated from resume",
        skills: ["React", "Node", "Python"],
        projects: [
          { title: "Project", description: "Demo project", tech: [] }
        ],
        education: [
          { degree: "BTech", college: "University", year: "2025" }
        ],
        experience: [
          { role: "Intern", company: "Company", duration: "2024", points: [] }
        ]
      });

    } finally {
      setLoading(false);
    }
  };

  const template =
    templateType === "creative" ? creative : professional;

  const html = data ? fillTemplate(template, data) : "";

  return (
    <div style={{ padding: "30px" }}>

      {/* ---------- UPLOAD SCREEN ---------- */}
      {!data && (
        <div>
          <h1>Upload Resume</h1>

          <div
            {...getRootProps()}
            style={{
              border: "2px dashed #ccc",
              padding: "40px",
              marginTop: "20px",
              cursor: "pointer"
            }}
          >
            <input {...getInputProps()} />
            <p>Drag & drop PDF here or click</p>
          </div>

          {file && <p>Selected: {file.name}</p>}

          <button onClick={handleUpload} disabled={loading}>
            {loading ? "Processing..." : "Generate Portfolio"}
          </button>
        </div>
      )}

      {/* ---------- PREVIEW SCREEN ---------- */}
      {data && (
        <div>
          <h2>Preview</h2>

          <select
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value)}
          >
            <option value="creative">Creative</option>
            <option value="professional">Professional</option>
          </select>

          <button onClick={() => downloadPortfolio(template, data)}>
            Download HTML
          </button>

          <iframe
            srcDoc={html}
            style={{
              width: "100%",
              height: "80vh",
              border: "1px solid #ccc",
              marginTop: "20px"
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;