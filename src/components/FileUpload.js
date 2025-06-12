import React, { useState } from "react";
import "./FileUpload.css";

function FileUpload({ onUpload }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file!");
      return;
    }
    onUpload(selectedFiles); // Dosyaları üst bileşene gönder
  };

  return (
    <div className="file-upload">
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default FileUpload;