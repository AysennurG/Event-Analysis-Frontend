import React, { useRef, useState, useEffect } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircularProgress from "@mui/material/CircularProgress";

function AnalysisPage({ setCurrentPage, setPageData }) {
  const fileInputRef = useRef(null);
  const [eventName, setEventName] = useState("");
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Canvas referansı
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Nokta ve bağlantı ayarları (daha küçük ve sık)
    const POINTS = Math.floor((window.innerWidth * window.innerHeight) / 12000); // Daha fazla ve küçük
    const points = [];
    for (let i = 0; i < POINTS; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 1.7 + Math.random() * 1.1, // Noktalar artık bir tık daha büyük
      });
    }

    let animationFrameId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Bağlantı çizgileri
      for (let i = 0; i < POINTS; i++) {
        for (let j = i + 1; j < POINTS; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 65) { // Daha kısa bağlantılar
            ctx.save();
            ctx.globalAlpha = 0.07 + (1 - dist / 65) * 0.10;
            ctx.strokeStyle = "#00e676";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Noktalar
      for (let i = 0; i < POINTS; i++) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, points[i].r, 0, 2 * Math.PI);
        ctx.fillStyle = "#00e676";
        ctx.shadowColor = "#00e676";
        ctx.shadowBlur = 2;
        ctx.globalAlpha = 0.45;
        ctx.fill();
        ctx.restore();

        // Hareket
        points[i].x += points[i].vx;
        points[i].y += points[i].vy;
        if (points[i].x < 0 || points[i].x > canvas.width) points[i].vx *= -1;
        if (points[i].y < 0 || points[i].y > canvas.height) points[i].vy *= -1;
      }

      animationFrameId = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleFile = (fileList) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/zip"];
    const validFiles = Array.from(fileList).filter(
      (file) =>
        allowedTypes.includes(file.type) || file.name.endsWith(".zip")
    );
    setFiles(validFiles);
    setFileNames(validFiles.map((f) => f.name));
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!eventName) {
      alert("Please enter an event name.");
      return;
    }
    if (files.length === 0) {
      alert("Please select files to upload.");
      return;
    }
    setUploading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("event_name", eventName);
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to upload files");

      const data = await response.json();
      setUploadResult(data);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to upload files:", err);
      alert("An error occurred while uploading the files.");
    } finally {
      setUploading(false);
    }
  };

  const handleViewResults = async () => {
    if (
      uploadResult &&
      uploadResult.analysis_results &&
      uploadResult.analysis_results.length > 0
    ) {
      // Sonuçları terminale yazdırmak için backend'e gönder
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/print_results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ results: uploadResult.analysis_results }),
        });
      } catch (err) {
        console.error("Terminale yazdırma isteği başarısız:", err);
      }
      setPageData(uploadResult); // <-- SADECE results değil, tüm uploadResult
      setCurrentPage("results");
    } else {
      alert("Analiz sonucu bulunamadı. Lütfen yüz içeren bir fotoğraf yükleyin.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#162447", // Lacivert arka plan
        overflow: "hidden",
        zIndex: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Connected Nodes & Dots */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          opacity: 0.85,
          pointerEvents: "none",
        }}
      />
      {/* Ortadaki transparan kutu */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: 420,
          minHeight: 420,
          borderRadius: "24px",
          boxShadow: "0 8px 32px #0004",
          padding: 32,
          background: "rgba(24,28,47,0.68)", // Transparan
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#00e676",
            textShadow: "0 2px 8px #000a, 0 0 8px #00e67688",
          }}
        >
          Etkinlik Yükle
        </h2>
        <input
          type="text"
          placeholder="Etkinlik adı giriniz"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "1px solid #00e676",
            fontSize: "16px",
            background: "rgba(0,60,94,0.7)",
            color: "#fff",
            boxShadow: "0 2px 8px #0001",
          }}
        />
        <div
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: dragActive ? "2px solid #00e676" : "2px dashed #00e676",
            background: dragActive
              ? "rgba(0,230,118,0.10)"
              : "rgba(0,60,94,0.5)",
            padding: "40px",
            textAlign: "center",
            borderRadius: "16px",
            cursor: "pointer",
            transition: "all 0.2s",
            marginBottom: "20px",
            position: "relative",
            boxShadow: "0 2px 16px #00e67622",
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".zip,image/jpeg,image/png"
            multiple
            onChange={handleFileChange}
          />
          <p style={{ fontSize: "16px", color: "#00e676" }}>
            {fileNames.length > 0 ? (
              <span>
                {fileNames.map((name, i) => (
                  <span
                    key={i}
                    style={{ display: "block", color: "#00e676" }}
                  >
                    Yüklendi: {name}
                  </span>
                ))}
              </span>
            ) : (
              "Sürükleyip bırakın ya da tıklayarak .zip / .jpeg / .png yükleyin"
            )}
          </p>
          {uploading && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <CircularProgress color="success" />
            </div>
          )}
          {uploadSuccess && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "#00e676",
              }}
            >
              <CheckCircleIcon
                style={{ fontSize: 48, animation: "pop 0.4s" }}
              />
            </div>
          )}
        </div>
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(90deg,#00bcd4,#00e676)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: uploading ? "not-allowed" : "pointer",
            marginBottom: "16px",
            transition: "background 0.2s",
            boxShadow: "0 2px 8px #00bcd455",
          }}
        >
          {uploading ? "Yükleniyor..." : "Yükle ve Analiz Et"}
        </button>
        {uploadResult && (
          <button
            onClick={handleViewResults}
            style={{
              width: "100%",
              padding: "12px",
              background: "linear-gradient(90deg,#43a047,#00bcd4)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 2px 8px #43a04755",
            }}
          >
            Sonuçları Görüntüle
          </button>
        )}
      </div>
      <style>
        {`
          @keyframes pop {
            0% { transform: scale(0.5);}
            80% { transform: scale(1.2);}
            100% { transform: scale(1);}
          }
        `}
      </style>
    </div>
  );
}

export default AnalysisPage;