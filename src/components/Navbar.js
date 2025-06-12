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
      <h1>Face Analysis App</h1>
      <ul>
        <li>
          <button onClick={() => setCurrentPage("home")} className="nav-button">
            Home
          </button>
        </li>
        {isAuthenticated ? (
          <>
            {/* Results kaldırıldı */}
            <li>
              <button onClick={() => setCurrentPage("events")} className="nav-button">
                Event History
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage("analysis")} className="nav-button">
                Etkinlik Analizi
              </button>
            </li>
            <li>
              <button onClick={handleLogout} className="nav-button">
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <button onClick={() => setCurrentPage("login")} className="nav-button">
                Login
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage("register")} className="nav-button">
                Register
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;