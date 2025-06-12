import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResultsPage from "./pages/ResultsPage";
import EventHistoryPage from "./pages/EventHistoryPage";
import EventDetailPage from "./pages/EventDetailPage";
import AnalysisPage from "./pages/AnalysisPage";
import "./styles/App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem("currentPage");
    // Eğer kayıtlı değer login veya register ise, home ile başlat
    if (saved === "login" || saved === "register") return "home";
    return saved ? saved : "home";
  });
  const [pageData, setPageData] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [toast, setToast] = useState(null);

  // currentPage değiştikçe localStorage'a yaz
  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  // Otomatik login kontrolü
  useEffect(() => {
    fetch("http://127.0.0.1:5000/auth/check", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  useEffect(() => {
    // Eğer login olduysak ve currentPage hala "login" ise, ana sayfaya yönlendir
    if (isAuthenticated && currentPage === "login") {
      setCurrentPage("home");
    }
  }, [isAuthenticated, currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage setCurrentPage={setCurrentPage} isAuthenticated={isAuthenticated} toast={toast} setToast={setToast} />;
      case "login":
        return <LoginPage setIsAuthenticated={setIsAuthenticated} setCurrentPage={setCurrentPage} />;
      case "register":
        return <RegisterPage setCurrentPage={setCurrentPage} setIsAuthenticated={setIsAuthenticated} setToast={setToast} />;
      case "results":
        return isAuthenticated ? <ResultsPage pageData={pageData} /> : <LoginPage setIsAuthenticated={setIsAuthenticated} setCurrentPage={setCurrentPage} />;
      case "events":
        return isAuthenticated ? <EventHistoryPage setCurrentPage={setCurrentPage} setPageData={setPageData} previewType={previewType} setPreviewType={setPreviewType} previewImg={previewImg} setPreviewImg={setPreviewImg} /> : <LoginPage setIsAuthenticated={setIsAuthenticated} setCurrentPage={setCurrentPage} />;
      case "analysis":
        return isAuthenticated ? <AnalysisPage setCurrentPage={setCurrentPage} setPageData={setPageData} /> : <LoginPage setIsAuthenticated={setIsAuthenticated} setCurrentPage={setCurrentPage} />;
      case "eventDetail":
        return isAuthenticated ? <EventDetailPage eventDetails={pageData} previewType={previewType} previewImg={previewImg} setPreviewType={setPreviewType} setPreviewImg={setPreviewImg} /> : <LoginPage setIsAuthenticated={setIsAuthenticated} setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} isAuthenticated={isAuthenticated} toast={toast} setToast={setToast} />;
    }
  };

  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        setCurrentPage={setCurrentPage}
        setIsAuthenticated={setIsAuthenticated}
      />
      <div className="content">
        {renderPage()}
      </div>
    </>
  );
}

export default App;