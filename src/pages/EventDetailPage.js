import React, { useRef } from "react";
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

function EventDetailPage({ eventDetails, resultsRef }) {
  const localRef = useRef();
  const activeRef = resultsRef || localRef;

  if (!eventDetails) {
    return <div>Yükleniyor...</div>;
  }

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

  // Doğrudan indirme fonksiyonları
  const handleDirectDownloadPDF = async () => {
    if (!activeRef.current) return;
    const canvas = await html2canvas(activeRef.current, {
      backgroundColor: "#fff",
      scale: 2,
      useCORS: true
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${event_name || "analiz"}_analiz.pdf`);
  };

  const handleDirectDownloadPNG = async () => {
    if (!activeRef.current) return;
    const canvas = await html2canvas(activeRef.current, {
      backgroundColor: "#fff",
      scale: 2,
      useCORS: true
    });
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = `${event_name || "analiz"}_analiz.png`;
    link.click();
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
        <button className="preview-btn" onClick={handleDirectDownloadPDF}>
          PDF Olarak İndir
        </button>
        <button className="preview-btn" onClick={handleDirectDownloadPNG}>
          PNG Olarak İndir
        </button>
      </div>
      <div className="graphs-container" ref={activeRef}>
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
    </div>
  );
}

export default EventDetailPage;