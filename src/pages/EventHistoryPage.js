import React, { useState, useEffect, useRef } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import EventDetailPage from "./EventDetailPage";
import "../styles/EventHistoryPage.css";

function EventHistoryPage({ setCurrentPage, setPageData }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [previewType, setPreviewType] = useState(null); // "pdf" veya "png"
  const [previewImg, setPreviewImg] = useState(null);
  const resultsRef = useRef();
  const hiddenRef = useRef(); // Referans eklendi

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/events", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events);
        } else {
          alert("Failed to fetch event history.");
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  // Filtreleme ve sıralama
  const filteredEvents = events
    .filter((event) =>
      event.event_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === "date"
        ? new Date(b.event_date) - new Date(a.event_date)
        : a.event_name.localeCompare(b.event_name)
    );

  // Etkinlik detayını çek
  const handleEventClick = async (eventId) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/event/${eventId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setPageData(data);
        setCurrentPage("eventDetail");
      } else {
        alert("Failed to fetch event details.");
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Sadece önizleme ile indirme
  const handleMenuPreview = async (eventId, type) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/event/${eventId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedEvent(data);
        setTimeout(async () => {
          // Sadece analiz/grafik alanını yakala!
          if (resultsRef.current) {
            const canvas = await html2canvas(resultsRef.current, {
              backgroundColor: "#fff",
              scale: 2,
              useCORS: true,
            });
            const imgData = canvas.toDataURL("image/png");
            setPreviewImg(imgData);
            setPreviewType(type);
          }
        }, 1000); // 1 saniye bekle, gerekirse artır
      } else {
        alert("Failed to fetch event details.");
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
    } finally {
      setLoadingDetail(false);
      setMenuOpenId(null);
    }
  };

  // Önizleme modalında indir butonu
  const handlePreviewDownload = () => {
    if (!previewImg || !previewType) return;
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
        pdf.save(`${selectedEvent?.event_name || "analiz"}_raporu.pdf`);
      };
    } else {
      const link = document.createElement("a");
      link.href = previewImg;
      link.download = `${selectedEvent?.event_name || "analiz"}_raporu.png`;
      link.click();
    }
    setPreviewType(null);
    setPreviewImg(null);
  };

  // Dışarı tıklanınca menüyü kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".event-menu")) setMenuOpenId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="event-history-page">
      <h2>Etkinlik Geçmişi</h2>
      <div className="event-controls">
        <input
          type="text"
          placeholder="Etkinlik ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">Tarihe Göre</option>
          <option value="name">İsme Göre</option>
        </select>
      </div>
      <motion.div
        className="event-grid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.07 } },
        }}
      >
        <AnimatePresence>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <motion.div
                className="event-card"
                key={event.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 180, damping: 18 }}
              >
                <div className="event-card-header">
                  <span className="event-name">{event.event_name}</span>
                  <div className="event-menu">
                    <button
                      className="menu-btn"
                      onClick={() =>
                        setMenuOpenId(menuOpenId === event.id ? null : event.id)
                      }
                    >
                      <FiMoreHorizontal size={22} />
                    </button>
                    {menuOpenId === event.id && (
                      <div className="menu-dropdown">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuPreview(event.id, "pdf");
                          }}
                        >
                          Önizleme ile PDF İndir
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuPreview(event.id, "png");
                          }}
                        >
                          Önizleme ile PNG İndir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="event-card-body"
                  onClick={() => handleEventClick(event.id)}
                >
                  <span className="event-date">
                    {new Date(event.event_date).toLocaleDateString()}
                  </span>
                  <span className="event-desc">
                    {event.description || "Açıklama yok."}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.p
              className="no-events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Etkinlik bulunamadı.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Gizli analiz/grafik alanı (sadece önizleme için) */}
      <div
        ref={hiddenRef}
        style={{
          position: "absolute",
          top: 0,
          left: "-2000px",
          minWidth: "1400px", // veya width: "auto"
          opacity: 1,
          pointerEvents: "none",
          zIndex: -1,
          background: "#fff",
        }}
      >
        {selectedEvent && (
          <EventDetailPage
            eventDetails={selectedEvent}
            resultsRef={resultsRef}
          />
        )}
      </div>

      {/* Önizleme modalı */}
      <AnimatePresence>
        {previewType && previewImg && (
          <motion.div
            className="preview-modal"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="preview-content">
              <button
                className="close-btn"
                onClick={() => {
                  setPreviewType(null);
                  setPreviewImg(null);
                }}
              >
                Kapat
              </button>
              <img
                src={previewImg}
                alt="Önizleme"
                style={{
                  maxWidth: "95vw",      // Ekranın %95'ine kadar büyüsün
                  maxHeight: "90vh",     // Ekranın %90'ına kadar büyüsün
                  margin: "1rem 0",
                  borderRadius: "12px",
                  boxShadow: "0 4px 24px #4f8cff22"
                }}
              />
              <button
                className="preview-btn"
                onClick={handlePreviewDownload}
              >
                {previewType === "pdf"
                  ? "PDF Olarak İndir"
                  : "PNG Olarak İndir"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EventHistoryPage;