import React, { useRef, useState } from "react";
import Graphs from "../components/Graphs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/EventDetailPage.css";

function isEmptyReport(report) {
  if (!report) return true;
  return (
    (!report.crowd_size || report.crowd_size === 0) &&
    (!report.gender_distribution || Object.keys(report.gender_distribution).length === 0) &&
    (!report.race_distribution || Object.keys(report.race_distribution).length === 0) &&
    (!report.age_distribution || Object.keys(report.age_distribution).length === 0) &&
    (!report.emotion_distribution || Object.keys(report.emotion_distribution).length === 0) &&
    (!report["memnuniyet_orani_%"] || report["memnuniyet_orani_%"] === 0)
  );
}

function EventDetailPage({ eventDetails, previewType, previewImg, setPreviewType, setPreviewImg, resultsRef }) {
  // Eğer resultsRef prop olarak gelmezse local ref oluştur
  const localRef = useRef();
  const activeRef = resultsRef || localRef;

  if (!eventDetails) {
    return <div>Yükleniyor...</div>;
  }

  // Hem analizden sonra hem event history için uyumlu
  let results =
    eventDetails.analysis_results ||
    eventDetails.results ||
    (eventDetails.event_details && eventDetails.event_details.results) ||
    [];
  let report =
    eventDetails.report ||
    (eventDetails.event_details && eventDetails.event_details.report) ||
    null;
  let event_name =
    eventDetails.event_name ||
    (eventDetails.event_details && eventDetails.event_details.event_name) ||
    "";
  let event_date =
    eventDetails.event_date ||
    (eventDetails.event_details && eventDetails.event_details.event_date) ||
    "";
  let description =
    eventDetails.description ||
    (eventDetails.event_details && eventDetails.event_details.description) ||
    "";

  const isEmpty = (!results || results.length === 0) || isEmptyReport(report);

  // Önizleme oluştur
  const handlePreview = async (type) => {
    if (!activeRef.current) return;
    const canvas = await html2canvas(activeRef.current, {
      backgroundColor: "#fff",
      scale: 2 // daha net görüntü için
    });
    const imgData = canvas.toDataURL("image/png");
    setPreviewImg(imgData);
    setPreviewType(type);
  };

  // İndir (önizleme sonrası)
  const handleDownload = () => {
    if (!previewImg) return;
    if (previewType === "pdf") {
      const img = new window.Image();
      img.src = previewImg;
      img.onload = () => {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [img.width, img.height],
        });
        pdf.addImage(previewImg, "PNG", 0, 0, img.width, img.height);
        pdf.save(`${event_name || "analiz"}_analiz.pdf`);
      };
    } else {
      const link = document.createElement("a");
      link.href = previewImg;
      link.download = `${event_name || "analiz"}_analiz.png`;
      link.click();
    }
    setPreviewType(null);
    setPreviewImg(null);
  };

  return (
    <div className="event-detail-page">
      <h2>{event_name || "Etkinlik Detayı"}</h2>
      <p>
        <strong>Tarih:</strong>{" "}
        {event_date ? new Date(event_date).toLocaleDateString() : "-"}
      </p>
      <p>
        <strong>Açıklama:</strong> {description || "-"}
      </p>
      <h3>Analiz Sonuçları</h3>
      <div style={{ marginBottom: 16 }}>
        <button className="preview-btn" onClick={() => handlePreview("pdf")}>
          PDF Önizle & İndir
        </button>
        <button className="preview-btn" onClick={() => handlePreview("png")}>
          PNG Önizle & İndir
        </button>
      </div>
      {/* Grafikler ve analizler */}
      <div ref={activeRef} className="graphs-container">
        {!isEmpty ? (
          <Graphs results={results} report={report} />
        ) : (
          <div>
            Yüz bulunamadı, grafik oluşturulamadı.
            <br />
            <span style={{ color: "#888", fontSize: "0.98em" }}>
              --- Rapor (Boş) ---
            </span>
          </div>
        )}
      </div>
      {/* Önizleme kutusu */}
      {previewType && (
        <div className="preview-modal">
          <div className="preview-content">
            <h3>İndirilecek {previewType === "pdf" ? "PDF" : "PNG"} Önizlemesi</h3>
            <img src={previewImg} alt="Önizleme" style={{ maxWidth: "100%", borderRadius: 12, boxShadow: "0 4px 24px #3454d122" }} />
            <div style={{ display: "flex", gap: "1rem", marginTop: 16 }}>
              <button className="register-btn" onClick={handleDownload}>
                İndir
              </button>
              <button className="white-btn" onClick={() => { setPreviewType(null); setPreviewImg(null); }}>
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetailPage;