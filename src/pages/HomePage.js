
import React, { useState, useEffect } from "react";
import "../styles/HomePage.css";

/*
  - Ana ekranda vizyon, misyon ve amaç kutucukları yan yana, animasyonlu ve estetik şekilde gösterilir.
  - Kullanıcı login değilse butona tıklayınca modal açılır, login ise analiz sayfasına yönlendirilmez.
  - Modal kutucuğunda kapatma (X) butonu vardır.
*/

function HomePage({ setCurrentPage, isAuthenticated }) {
  const [showModal, setShowModal] = useState(false);

  // Geçişli arka plan için:
  const backgroundImages = [
    "etkinlik1.jpg",
    "etkinlik2.jpg",
    "etkinlik3.jpg",
    "etkinlik4.jpg",
    

  ];
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 4000); // 4 saniyede bir değişir
    return () => clearInterval(interval);
  }, [backgroundImages.length]); // eslint-disable-line react-hooks/exhaustive-deps
/*
  const handleContinue = () => {
    if (isAuthenticated) {
      setCurrentPage("analysis");
    } else {
      setShowModal(true);
    }
  };
*/
  return (
    <div
      className="homepage"
      style={{
        backgroundImage: `url(${backgroundImages[bgIndex]})`,
        transition: "background-image 1s ease-in-out"
      }}
    >
      <div className="hero-section">
        <h1 className="app-title">Etkinlik Katılımcı Analizi</h1>
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
            <p>Fotoğraflardan yüzleri analiz ederek yaş, cinsiyet, ırk ve duygu dağılımlarını grafiklerle sunmak.</p>
          </div>
        </div>
        {/*
  <button className="continue-button" onClick={handleContinue}>
    ETKİNLİK ANALİZİNE BAŞLA
  </button>
*/}

      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
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