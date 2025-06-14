import React, { useState, useEffect, useRef } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import EventDetailPage from "./EventDetailPage";
import "../styles/EventHistoryPage.css";

function EventHistoryPage({ setCurrentPage, setPageData, previewType, setPreviewType, previewImg, setPreviewImg }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const resultsRef = useRef();

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
        setPageData(data); // data.results ve data.report olacak!
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

  // PDF ve PNG indirme
  const handleDownloadPDF = async () => {
    if (!resultsRef.current) return;
    const canvas = await html2canvas(resultsRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${selectedEvent?.event_name || "analiz"}_raporu.pdf`);
  };

  const handleDownloadPNG = async () => {
    if (!resultsRef.current) return;
    const canvas = await html2canvas(resultsRef.current);
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = `${selectedEvent?.event_name || "analiz"}_raporu.png`;
    link.click();
  };

  // Menüden indirme işlemi
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
          // Sadece grafik alanını yakala!
          if (resultsRef.current) {
            const canvas = await html2canvas(resultsRef.current, {
              backgroundColor: "#fff",
              scale: 2
            });
            const imgData = canvas.toDataURL("image/png");
            setPreviewImg(imgData);
            setPreviewType(type);
          }
        }, 500); // Modal açıldıktan sonra biraz bekle
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

  // Dışarı tıklanınca menüyü kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".event-menu")) setMenuOpenId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Etkinlik silme fonksiyonu
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setEvents(events.filter(e => e.id !== eventId)); // Listeyi güncelle
        setMenuOpenId(null);
      } else {
        alert(data.error || "Silme işlemi başarısız oldu.");
      }
    } catch (err) {
      alert("Bir hata oluştu.");
    }
  };

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
                onClick={() => handleEventClick(event.id)} // <-- Buraya ekleyin
              >
                <div className="event-card-header">
                  <span className="event-name">{event.event_name}</span>
                  <div className="event-menu">
                    <button
                      className="menu-btn"
                      onClick={e => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === event.id ? null : event.id);
                      }}
                    >
                      <FiMoreHorizontal size={22} />
                    </button>
                    {menuOpenId === event.id && (
                      <div className="menu-dropdown">
                        <button onClick={e => { e.stopPropagation(); handleMenuPreview(event.id, "pdf"); }}>
                          PDF Olarak İndir
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleMenuPreview(event.id, "png"); }}>
                          PNG Olarak İndir
                        </button>
                        <button
                          style={{ color: "dark-blue" }}
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                        >
                          Etkinliği Sil
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="event-card-body">
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
      {/* Modal ile analiz sonuçları göster */}
      <AnimatePresence>
        {(selectedEvent || loadingDetail) && (
          <motion.div
            className="event-detail-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-content" ref={resultsRef}>
              <button
                className="close-btn"
                onClick={() => setSelectedEvent(null)}
              >
                Kapat
              </button>
              {loadingDetail && !selectedEvent ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>Yükleniyor...</div>
              ) : (
                <EventDetailPage
                  eventDetails={selectedEvent}
                  previewType={previewType}
                  previewImg={previewImg}
                  setPreviewType={setPreviewType}
                  setPreviewImg={setPreviewImg}
                  resultsRef={resultsRef}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EventHistoryPage;