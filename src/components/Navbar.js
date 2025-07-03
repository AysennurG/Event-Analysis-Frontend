import React from "react";
import "./Navbar.css";

function Navbar({ isAuthenticated, setCurrentPage, setIsAuthenticated }) {
  const handleLogout = async () => {
    await fetch("http://127.0.0.1:5000/logout", {
      method: "GET",
      credentials: "include",
    });
    setIsAuthenticated(false);
    setCurrentPage("home"); // Çıkıştan sonra ana sayfaya yönlendir
  };

  return (
    <nav className="navbar">
      <h1>Etkinlik Katılımcı Analizi</h1>
      <ul>
        <li>
          <button onClick={() => setCurrentPage("home")} className="nav-button">
            Ana Sayfa
          </button>
        </li>
        {isAuthenticated ? (
          <>
            {/* Results kaldırıldı */}
            <li>
              <button onClick={() => setCurrentPage("events")} className="nav-button">
                Etkinlik Geçmişi
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage("analysis")} className="nav-button">
                Etkinlik Analizi
              </button>
            </li>
            <li>
              <button onClick={handleLogout} className="nav-button">
                Çıkış
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <button onClick={() => setCurrentPage("login")} className="nav-button">
                Giriş Yap
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage("register")} className="nav-button">
                Kaydol
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;