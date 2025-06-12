import React, { useState, useEffect } from "react";
import "../styles/HomePage.css";

/*
  - Ana ekranda vizyon, misyon ve amaç kutucukları yan yana, animasyonlu ve estetik şekilde gösterilir.
  - Kullanıcı login değilse butona tıklayınca modal açılır, login ise analiz sayfasına yönlendirilmez.
  - Modal kutucuğunda kapatma (X) butonu vardır.
*/

function HomePage({ setCurrentPage, isAuthenticated, toast, setToast }) {
  const [showModal, setShowModal] = useState(false);

  const handleContinue = () => {
    if (isAuthenticated) {
      setCurrentPage("analysis");
    } else {
      setShowModal(true);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  return (
    <div className="homepage">
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 32,
            right: 32,
            zIndex: 9999,
            background: "#4BB543",
            color: "#fff",
            padding: "18px 32px",
            borderRadius: 12,
            boxShadow: "0 4px 24px #4BB54344",
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: 0.5,
            transition: "all 0.3s",
            minWidth: 260,
            textAlign: "center",
          }}
        >
          {toast.message}
        </div>
      )}
      <div className="hero-section">
        <h1 className="app-title">Face Analysis App</h1>
        <div className="info-cards">
          <div className="info-card animated-card delay-0">
            <h2>Misyonumuz</h2>
            <p>Katılımcıların demografik ve duygusal analizini kolayca sunmak.</p>
          </div>
          <div className="info-card animated-card delay-1">
            <h2>Vizyonumuz</h2>
            <p>Etkinliklerde veri odaklı kararlar için en güvenilir yardımcı olmak.</p>
          </div>
          <div className="info-card animated-card delay-2">
            <h2>Amacımız</h2>
            <p>
              Fotoğraflardan yüzleri analiz ederek yaş, cinsiyet, ırk ve duygu
              dağılımlarını grafiklerle sunmak.
            </p>
          </div>
        </div>
        <button className="continue-button" onClick={handleContinue}>
          ETKİNLİK ANALİZİNE BAŞLA
        </button>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2>Welcome!</h2>
            <p>Please choose an option to proceed:</p>
            <button
              className="modal-button"
              onClick={() => setCurrentPage("login")}
            >
              Login
            </button>
            <button
              className="modal-button"
              onClick={() => setCurrentPage("register")}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;